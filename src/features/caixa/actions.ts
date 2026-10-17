"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { violouUnico } from "@/db/erros";
import { auditoria, caixaMovimentos, caixas } from "@/db/schema";
import { senhaConfere } from "@/features/auth/reautenticar";
import { exigirDono, exigirFuncionario } from "@/features/auth/sessao";
import { formatarReais } from "@/lib/dinheiro";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { resumoDoCaixa } from "./queries";
import { conferir, observacaoObrigatoria } from "./regras";
import { abrirCaixaSchema, fecharCaixaSchema, movimentoCaixaSchema, reabrirCaixaSchema } from "./schemas";


export async function abrirCaixa(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const funcionario = await exigirFuncionario();
  const envio = proximoEnvio(anterior);
  const dados = abrirCaixaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  if (!(await senhaConfere(funcionario.usuario, dados.data.senha))) return { campos: { senha: "Senha incorreta." }, envio };

  const fundoCentavos = dados.data.semFundo ? 0 : (dados.data.fundo ?? 0);
  try {
    await getDb().transaction(async (tx) => {
      const [caixa] = await tx
        .insert(caixas)
        .values({ funcionarioId: funcionario.id, fundoCentavos, semFundo: fundoCentavos === 0 })
        .returning({ id: caixas.id });
      await tx.insert(auditoria).values({ tabela: "caixas", registroId: caixa.id, acao: "abrir", dados: { fundoCentavos }, funcionarioId: funcionario.id });
    });
  } catch (erro) {
    // Índice único: o funcionário já tem um caixa aberto (por exemplo, dois cliques).
    if (violouUnico(erro)) redirect("/caixa");
    throw erro;
  }
  revalidatePath("/caixa");
  redirect("/caixa");
}

export async function registrarMovimentoCaixa(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const funcionario = await exigirFuncionario();
  const envio = proximoEnvio(anterior);
  const dados = movimentoCaixaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  const registrado = await getDb().transaction(async (tx) => {
    // Trava o caixa: a sangria não entra num caixa que está fechando.
    const [caixa] = await tx
      .select({ id: caixas.id })
      .from(caixas)
      .where(and(eq(caixas.funcionarioId, funcionario.id), eq(caixas.status, "aberto")))
      .for("update")
      .limit(1);
    if (!caixa) return false;
    await tx.insert(caixaMovimentos).values({
      caixaId: caixa.id,
      tipo: dados.data.tipo,
      valorCentavos: dados.data.valor,
      motivo: dados.data.motivo,
      funcionarioId: funcionario.id,
    });
    return true;
  });
  if (!registrado) return { erro: "Abra o caixa antes.", envio };
  revalidatePath("/caixa");
  const nome = dados.data.tipo === "sangria" ? "Sangria" : "Suprimento";
  return { ok: `${nome} de ${formatarReais(dados.data.valor)} registrada.`, envio };
}

export type EstadoFechamento = EstadoFormulario & { conferencia?: { esperadoCentavos: number; diferencaCentavos: number } };

export async function fecharCaixa(anterior: EstadoFechamento, formData: FormData): Promise<EstadoFechamento> {
  const funcionario = await exigirFuncionario();
  const envio = proximoEnvio(anterior);
  const dados = fecharCaixaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  if (!(await senhaConfere(funcionario.usuario, dados.data.senha))) return { campos: { senha: "Senha incorreta." }, envio };

  const resultado = await getDb().transaction(async (tx) => {
    // Trava o caixa: nenhuma venda entra nele enquanto fecha.
    const [caixa] = await tx
      .select({ id: caixas.id })
      .from(caixas)
      .where(and(eq(caixas.funcionarioId, funcionario.id), eq(caixas.status, "aberto")))
      .for("update")
      .limit(1);
    if (!caixa) return { tipo: "sem_caixa" as const };
    const resumo = await resumoDoCaixa(caixa.id, tx);
    if (!resumo) return { tipo: "sem_caixa" as const };
    if (resumo.comandasAbertas > 0) return { tipo: "comandas" as const, quantidade: resumo.comandasAbertas };

    const { diferencaCentavos } = conferir(resumo.esperadoCentavos, dados.data.contado);
    if (observacaoObrigatoria(diferencaCentavos) && !dados.data.observacao) {
      return { tipo: "precisa_observacao" as const, esperadoCentavos: resumo.esperadoCentavos, diferencaCentavos };
    }
    await tx
      .update(caixas)
      .set({
        status: "fechado",
        fechadoEm: new Date(),
        esperadoCentavos: resumo.esperadoCentavos,
        contadoCentavos: dados.data.contado,
        diferencaCentavos,
        observacao: dados.data.observacao,
      })
      .where(eq(caixas.id, caixa.id));
    await tx.insert(auditoria).values({
      tabela: "caixas",
      registroId: caixa.id,
      acao: "fechar",
      dados: { esperadoCentavos: resumo.esperadoCentavos, contadoCentavos: dados.data.contado, diferencaCentavos },
      funcionarioId: funcionario.id,
    });
    return { tipo: "fechado" as const, caixaId: caixa.id };
  });

  if (resultado.tipo === "sem_caixa") return { erro: "Você não tem caixa aberto.", envio };
  if (resultado.tipo === "comandas") {
    return { erro: `Há ${resultado.quantidade} comanda(s) aberta(s) neste caixa. Cobre ou cancele antes de fechar.`, envio };
  }
  if (resultado.tipo === "precisa_observacao") {
    return {
      campos: { observacao: "Explique a diferença para fechar o caixa." },
      conferencia: { esperadoCentavos: resultado.esperadoCentavos, diferencaCentavos: resultado.diferencaCentavos },
      envio,
    };
  }
  revalidatePath("/caixa");
  redirect(`/caixa/fechamento/${resultado.caixaId}`);
}

export async function reabrirCaixa(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = reabrirCaixaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  try {
    const reaberto = await getDb().transaction(async (tx) => {
      const atualizados = await tx
        .update(caixas)
        .set({ status: "aberto", fechadoEm: null, observacao: null, esperadoCentavos: null, contadoCentavos: null, diferencaCentavos: null, reabertoPor: dono.id, reabertoEm: new Date() })
        .where(and(eq(caixas.id, dados.data.caixaId), eq(caixas.status, "fechado")))
        .returning({ id: caixas.id });
      if (atualizados.length === 0) return false;
      await tx.insert(auditoria).values({ tabela: "caixas", registroId: dados.data.caixaId, acao: "reabrir", dados: { motivo: dados.data.motivo }, funcionarioId: dono.id });
      return true;
    });
    if (!reaberto) return { erro: "Esse caixa não está fechado.", envio };
  } catch (erro) {
    if (violouUnico(erro)) return { erro: "O funcionário já tem outro caixa aberto. Feche aquele antes.", envio };
    throw erro;
  }
  revalidatePath("/dashboard");
  return { ok: "Caixa reaberto.", envio };
}
