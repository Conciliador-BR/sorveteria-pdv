"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { violouReferencia } from "@/db/erros";
import { auditoria, fichaTecnicaItens, precificacaoProdutos, produtos } from "@/db/schema";
import { exigirDono } from "@/features/auth/sessao";
import { formatarReais } from "@/lib/dinheiro";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { buscarParametros, custosMensais, listarItensFicha } from "./queries";
import { analisarProduto, PRECO_MAXIMO_CENTAVOS } from "./regras";
import { aplicarPrecoSchema, idSchema, itemFichaSchema, produtoPrecificacaoSchema } from "./schemas";

// Ficha técnica, rendimento, margem e aplicação do preço sugerido. Só o dono.

const CAMINHO = "/precificacao";

export async function salvarItemFicha(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = itemFichaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { produtoId, insumoId, quantidade } = dados.data;

  try {
    // O mesmo insumo duas vezes na ficha vira uma linha só, com a quantidade nova.
    await getDb()
      .insert(fichaTecnicaItens)
      .values({ produtoId, insumoId, quantidade })
      .onConflictDoUpdate({ target: [fichaTecnicaItens.produtoId, fichaTecnicaItens.insumoId], set: { quantidade } });
  } catch (erro) {
    if (violouReferencia(erro)) return { erro: "Produto ou insumo não existe mais. Recarregue a página.", envio };
    throw erro;
  }
  revalidatePath(CAMINHO);
  return { ok: "Ficha técnica atualizada.", envio };
}

export async function removerItemFicha(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = idSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { erro: "Item inválido. Recarregue a página.", envio };
  await getDb().delete(fichaTecnicaItens).where(eq(fichaTecnicaItens.id, dados.data.id));
  revalidatePath(CAMINHO);
  return { ok: "Insumo tirado da ficha.", envio };
}

// Guarda rendimento e margem. Com `aplicar`, também troca o preço de venda do produto pelo sugerido.
export async function salvarProdutoPrecificacao(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximoEnvio(anterior);
  const entrada = lerFormulario(formData);
  const dados = produtoPrecificacaoSchema.safeParse(entrada);
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { produtoId, rendimento, margemPercentual } = dados.data;
  const aplicar = entrada.aplicar === "sim";

  // O preço mostrado na tela; o servidor recalcula e só aplica se for o mesmo.
  const precoTela = aplicar ? aplicarPrecoSchema.safeParse(entrada) : null;
  if (precoTela && !precoTela.success) return { erro: "Não há preço sugerido que possa ir para o caixa. Confira a ficha técnica e os percentuais.", envio };

  // Leituras fora da transação: o pool é pequeno e a conta não depende de trava.
  let preco: number | null = null;
  if (precoTela) {
    const [[produto], parametros, custos, itens] = await Promise.all([
      getDb().select({ tipoVenda: produtos.tipoVenda }).from(produtos).where(eq(produtos.id, produtoId)).limit(1),
      buscarParametros(),
      custosMensais(),
      listarItensFicha(),
    ]);
    if (!produto) return { erro: "Produto não encontrado. Recarregue a página.", envio };
    preco = analisarProduto(
      {
        tipoVenda: produto.tipoVenda,
        rendimento,
        margemPercentual: margemPercentual ?? parametros.margemPadraoPercentual,
        itens: itens.filter((item) => item.produtoId === produtoId),
      },
      parametros,
      custos.total,
    ).preco;
    if (preco === null) return { erro: "Não há preço sugerido para aplicar. Confira a ficha técnica e os percentuais.", envio };
    if (preco > PRECO_MAXIMO_CENTAVOS) return { erro: "O preço sugerido passa de R$ 100.000,00. Confira a ficha técnica e os percentuais.", envio };
    if (preco !== precoTela.data.precoCentavos) {
      return { erro: `Os custos mudaram e o preço sugerido agora é ${formatarReais(preco)}. Confira e aplique de novo.`, envio };
    }
  }

  const resultado = await getDb().transaction(async (tx) => {
    const [produto] = await tx
      .select({ nome: produtos.nome, precoCentavos: produtos.precoCentavos })
      .from(produtos)
      .where(eq(produtos.id, produtoId))
      .for("update")
      .limit(1);
    if (!produto) return { erro: "Produto não encontrado. Recarregue a página." };

    await tx
      .insert(precificacaoProdutos)
      .values({ produtoId, rendimento, margemPercentual })
      .onConflictDoUpdate({ target: precificacaoProdutos.produtoId, set: { rendimento, margemPercentual } });
    if (preco === null) return { ok: "Rendimento e margem salvos." };

    await tx.update(produtos).set({ precoCentavos: preco }).where(eq(produtos.id, produtoId));
    await tx.insert(auditoria).values({
      tabela: "produtos",
      registroId: produtoId,
      acao: "editar",
      dados: { antes: { precoCentavos: produto.precoCentavos }, depois: { precoCentavos: preco }, origem: "precificacao" },
      funcionarioId: dono.id,
    });
    return { ok: `Preço de ${produto.nome} agora é ${formatarReais(preco)}. Vale para as próximas vendas.` };
  });

  revalidatePath(CAMINHO);
  if (precoTela) revalidatePath("/produtos");
  return { ...resultado, envio };
}
