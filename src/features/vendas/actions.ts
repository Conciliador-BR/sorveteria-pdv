"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { violouUnico } from "@/db/erros";
import { auditoria, caixas, vendaItens, vendas } from "@/db/schema";
import { exigirFuncionario, exigirPermissao } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { emitirNfceSeLigada } from "@/features/fiscal/emissao";
import { formatarReais } from "@/lib/dinheiro";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { baixarEstoque, devolverEstoque, ErroVenda, gravarPagamentos, LIMITE_CENTAVOS, montarItens, type Tx } from "./operacoes";
import { conferirPagamentos, totalDaVenda, type PagamentoInformado } from "./regras";
import {
  abrirComandaSchema,
  cancelarVendaSchema,
  cobrarComandaSchema,
  lancarNaComandaSchema,
  lerJson,
  removerItemSchema,
  vendaBalcaoSchema,
} from "./schemas";

export type EstadoVenda = EstadoFormulario & { venda?: { id: string; numero: number; totalCentavos: number; trocoCentavos: number } };

const SEM_CAIXA = "Abra o seu caixa antes de vender.";

async function comCaixa() {
  const funcionario = await exigirFuncionario();
  const caixa = await buscarCaixaAberto(funcionario.id);
  return { funcionario, caixa };
}

function tratarErro(erro: unknown, envio: number): EstadoVenda {
  if (erro instanceof ErroVenda) return { erro: erro.message, envio };
  throw erro;
}

// Trava o caixa e confere que segue aberto: o fechamento não corre junto com a venda.
async function travarCaixaAberto(tx: Tx, caixaId: string) {
  const [caixa] = await tx.select({ id: caixas.id }).from(caixas).where(and(eq(caixas.id, caixaId), eq(caixas.status, "aberto"))).for("update").limit(1);
  if (!caixa) throw new ErroVenda(SEM_CAIXA);
}

// O total pode ter mudado desde que a tela abriu (preço alterado, item lançado por outra pessoa).
function conferirOuAvisar(totalCentavos: number, lista: PagamentoInformado[], totalMudou: string) {
  if (totalCentavos > LIMITE_CENTAVOS) throw new ErroVenda(`A venda passou do limite de ${formatarReais(LIMITE_CENTAVOS)}.`);
  const soma = lista.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
  if (soma !== totalCentavos) throw new ErroVenda(totalMudou);
  const conferencia = conferirPagamentos(totalCentavos, lista);
  if (!conferencia.ok) throw new ErroVenda(conferencia.erro);
  return conferencia;
}

export async function venderNoBalcao(anterior: EstadoVenda, formData: FormData): Promise<EstadoVenda> {
  const { funcionario, caixa } = await comCaixa();
  const envio = proximoEnvio(anterior);
  if (!caixa) return { erro: SEM_CAIXA, envio };
  const dados = vendaBalcaoSchema.safeParse(lerJson(formData));
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados da venda inválidos.", envio };

  try {
    const venda = await getDb().transaction(async (tx) => {
      await travarCaixaAberto(tx, caixa.id);
      // O id vem da tela: um envio repetido da mesma venda esbarra na chave e não grava de novo.
      const [nova] = await tx
        .insert(vendas)
        .values({ id: dados.data.id, caixaId: caixa.id, funcionarioId: funcionario.id, tipo: "balcao", status: "concluida", concluidaEm: new Date(), concluidaPor: funcionario.id })
        .returning({ id: vendas.id, numero: vendas.numero });
      const itens = await montarItens(tx, dados.data.itens, nova.id, funcionario.id);
      const totalCentavos = totalDaVenda(itens);
      // O carrinho guarda o preço de quando a tela abriu: só recarregando ele pega o preço novo.
      const conferencia = conferirOuAvisar(totalCentavos, dados.data.pagamentos, "O preço de algum produto mudou. Atualize a tela e refaça a venda.");
      await tx.insert(vendaItens).values(itens);
      await gravarPagamentos(tx, nova.id, dados.data.pagamentos);
      await tx.update(vendas).set({ totalCentavos, trocoCentavos: conferencia.trocoCentavos }).where(eq(vendas.id, nova.id));
      await baixarEstoque(tx, nova.id, funcionario.id);
      return { id: nova.id, numero: nova.numero, totalCentavos, trocoCentavos: conferencia.trocoCentavos };
    });
    await emitirNfceSeLigada(venda.id, funcionario.id);
    revalidatePath("/caixa");
    return { ok: `Venda nº ${venda.numero} registrada.`, venda, envio };
  } catch (erro) {
    if (violouUnico(erro)) {
      const [ja] = await getDb()
        .select({ id: vendas.id, numero: vendas.numero, totalCentavos: vendas.totalCentavos, trocoCentavos: vendas.trocoCentavos })
        .from(vendas)
        .where(and(eq(vendas.id, dados.data.id), eq(vendas.funcionarioId, funcionario.id), eq(vendas.tipo, "balcao")))
        .limit(1);
      if (ja) return { ok: `Venda nº ${ja.numero} registrada.`, venda: ja, envio };
      return { erro: "Não foi possível registrar a venda. Tente de novo.", envio };
    }
    return tratarErro(erro, envio);
  }
}

export async function abrirComanda(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { funcionario, caixa } = await comCaixa();
  const envio = proximoEnvio(anterior);
  if (!caixa) return { erro: SEM_CAIXA, envio };
  const dados = abrirComandaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  let comanda: { id: string };
  try {
    comanda = await getDb().transaction(async (tx) => {
      await travarCaixaAberto(tx, caixa.id);
      const [nova] = await tx
        .insert(vendas)
        .values({ caixaId: caixa.id, funcionarioId: funcionario.id, tipo: "comanda", status: "aberta", identificacao: dados.data.identificacao })
        .returning({ id: vendas.id });
      return nova;
    });
  } catch (erro) {
    return tratarErro(erro, envio);
  }
  revalidatePath("/comandas");
  // Segue direto para lançar itens; o redirect também impede um segundo toque de abrir outra comanda.
  redirect(`/comandas/${comanda.id}`);
}

// Recalcula o total da comanda a partir dos itens gravados.
async function atualizarTotal(tx: Tx, vendaId: string) {
  const [{ total }] = await tx
    .select({ total: sql`coalesce(sum(${vendaItens.totalCentavos}), 0)`.mapWith(Number) })
    .from(vendaItens)
    .where(eq(vendaItens.vendaId, vendaId));
  if (total > LIMITE_CENTAVOS) throw new ErroVenda(`A comanda passou do limite de ${formatarReais(LIMITE_CENTAVOS)}.`);
  await tx.update(vendas).set({ totalCentavos: total }).where(eq(vendas.id, vendaId));
  return total;
}

async function travarComandaAberta(tx: Tx, vendaId: string) {
  const [comanda] = await tx
    .select({ id: vendas.id, caixaId: vendas.caixaId })
    .from(vendas)
    .where(and(eq(vendas.id, vendaId), eq(vendas.tipo, "comanda"), eq(vendas.status, "aberta")))
    .for("update")
    .limit(1);
  if (!comanda) throw new ErroVenda("Essa comanda já foi fechada ou cancelada.");
  return comanda;
}

export async function lancarNaComanda(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { funcionario, caixa } = await comCaixa();
  const envio = proximoEnvio(anterior);
  if (!caixa) return { erro: SEM_CAIXA, envio };
  const dados = lancarNaComandaSchema.safeParse(lerJson(formData));
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos.", envio };

  try {
    await getDb().transaction(async (tx) => {
      await travarComandaAberta(tx, dados.data.vendaId);
      const itens = await montarItens(tx, dados.data.itens, dados.data.vendaId, funcionario.id);
      await tx.insert(vendaItens).values(itens);
      await atualizarTotal(tx, dados.data.vendaId);
    });
  } catch (erro) {
    // A comanda pode ter sido cobrada ou cancelada em outro aparelho: a tela recarrega com o estado atual.
    revalidatePath(`/comandas/${dados.data.vendaId}`);
    return tratarErro(erro, envio);
  }
  revalidatePath(`/comandas/${dados.data.vendaId}`);
  revalidatePath("/comandas");
  return { ok: "Itens lançados na comanda.", envio };
}

export async function removerItemDaComanda(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { funcionario, caixa } = await comCaixa();
  const envio = proximoEnvio(anterior);
  if (!caixa) return { erro: SEM_CAIXA, envio };
  const dados = removerItemSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { erro: "Item inválido.", envio };

  try {
    const vendaId = await getDb().transaction(async (tx) => {
      const [item] = await tx
        .select({ vendaId: vendaItens.vendaId, nome: vendaItens.nomeProduto, totalCentavos: vendaItens.totalCentavos })
        .from(vendaItens)
        .where(eq(vendaItens.id, dados.data.itemId))
        .limit(1);
      if (!item) throw new ErroVenda("Item não encontrado.");
      await travarComandaAberta(tx, item.vendaId);
      await tx.delete(vendaItens).where(eq(vendaItens.id, dados.data.itemId));
      await atualizarTotal(tx, item.vendaId);
      await tx.insert(auditoria).values({ tabela: "venda_itens", registroId: dados.data.itemId, acao: "remover", dados: item, funcionarioId: funcionario.id });
      return item.vendaId;
    });
    revalidatePath(`/comandas/${vendaId}`);
    revalidatePath("/comandas");
  } catch (erro) {
    return tratarErro(erro, envio);
  }
  return { ok: "Item removido.", envio };
}

export async function cobrarComanda(anterior: EstadoVenda, formData: FormData): Promise<EstadoVenda> {
  const { funcionario, caixa } = await comCaixa();
  const envio = proximoEnvio(anterior);
  if (!caixa) return { erro: SEM_CAIXA, envio };
  const dados = cobrarComandaSchema.safeParse(lerJson(formData));
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos.", envio };

  try {
    const venda = await getDb().transaction(async (tx) => {
      await travarCaixaAberto(tx, caixa.id);
      await travarComandaAberta(tx, dados.data.vendaId);
      const totalCentavos = await atualizarTotal(tx, dados.data.vendaId);
      const conferencia = conferirOuAvisar(totalCentavos, dados.data.pagamentos, `O total mudou para ${formatarReais(totalCentavos)}. Confira o pagamento e tente de novo.`);
      await gravarPagamentos(tx, dados.data.vendaId, dados.data.pagamentos);
      // O dinheiro entra na gaveta de quem cobrou.
      const [concluida] = await tx
        .update(vendas)
        .set({ status: "concluida", caixaId: caixa.id, trocoCentavos: conferencia.trocoCentavos, concluidaEm: new Date(), concluidaPor: funcionario.id })
        .where(eq(vendas.id, dados.data.vendaId))
        .returning({ numero: vendas.numero });
      await baixarEstoque(tx, dados.data.vendaId, funcionario.id);
      return { id: dados.data.vendaId, numero: concluida.numero, totalCentavos, trocoCentavos: conferencia.trocoCentavos };
    });
    await emitirNfceSeLigada(venda.id, funcionario.id);
    revalidatePath("/comandas");
    revalidatePath("/caixa");
    return { ok: `Comanda cobrada. Venda nº ${venda.numero}.`, venda, envio };
  } catch (erro) {
    revalidatePath(`/comandas/${dados.data.vendaId}`);
    return tratarErro(erro, envio);
  }
}

export async function cancelarVenda(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const funcionario = await exigirPermissao("pode_cancelar_venda");
  const envio = proximoEnvio(anterior);
  const dados = cancelarVendaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  try {
    await getDb().transaction(async (tx) => {
      // Mesma ordem de travas da cobrança (caixa, depois venda), para as duas não se travarem.
      const [atual] = await tx.select({ caixaId: vendas.caixaId }).from(vendas).where(eq(vendas.id, dados.data.vendaId)).limit(1);
      if (!atual) throw new ErroVenda("Venda não encontrada.");
      // Caixa fechado não muda: o dono reabre antes, se precisar.
      await travarCaixaAberto(tx, atual.caixaId).catch((erro) => {
        if (!(erro instanceof ErroVenda)) throw erro;
        throw new ErroVenda("O caixa dessa venda já foi fechado. Peça ao dono para reabrir antes de cancelar.");
      });
      const [venda] = await tx
        .select({ id: vendas.id, status: vendas.status, caixaId: vendas.caixaId })
        .from(vendas)
        .where(eq(vendas.id, dados.data.vendaId))
        .for("update")
        .limit(1);
      if (!venda || venda.status === "cancelada") throw new ErroVenda("Essa venda já está cancelada.");
      if (venda.caixaId !== atual.caixaId) throw new ErroVenda("Essa comanda acabou de ser cobrada. Abra a venda de novo para cancelar.");
      if (venda.status === "concluida") await devolverEstoque(tx, venda.id, funcionario.id);
      await tx
        .update(vendas)
        .set({ status: "cancelada", canceladaEm: new Date(), canceladaPor: funcionario.id, motivoCancelamento: dados.data.motivo })
        .where(eq(vendas.id, venda.id));
      await tx.insert(auditoria).values({ tabela: "vendas", registroId: venda.id, acao: "cancelar", dados: { motivo: dados.data.motivo, statusAnterior: venda.status }, funcionarioId: funcionario.id });
    });
  } catch (erro) {
    return tratarErro(erro, envio);
  }
  revalidatePath("/vendas", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/comandas");
  revalidatePath("/caixa");
  return { ok: "Venda cancelada.", envio };
}
