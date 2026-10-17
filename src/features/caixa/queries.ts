import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { bandeiras, caixaMovimentos, caixas, funcionarios, pagamentos, vendas } from "@/db/schema";
import { dinheiroEsperado, resumirPagamentos } from "./regras";

type Leitor = Pick<ReturnType<typeof getDb>, "select">;

export async function buscarCaixaAberto(funcionarioId: string, db: Leitor = getDb()) {
  const [caixa] = await db
    .select({ id: caixas.id, abertoEm: caixas.abertoEm, fundoCentavos: caixas.fundoCentavos, semFundo: caixas.semFundo })
    .from(caixas)
    .where(and(eq(caixas.funcionarioId, funcionarioId), eq(caixas.status, "aberto")))
    .limit(1);
  return caixa ?? null;
}

// Totais do caixa: fundo, vendas concluídas por forma/bandeira, sangrias, suprimentos e esperado na gaveta.
export async function resumoDoCaixa(caixaId: string, db: Leitor = getDb()) {
  const [caixa] = await db.select({ fundoCentavos: caixas.fundoCentavos }).from(caixas).where(eq(caixas.id, caixaId)).limit(1);
  if (!caixa) return null;

  const linhasPagamento = await db
    .select({ forma: pagamentos.forma, bandeira: bandeiras.nome, valorCentavos: pagamentos.valorCentavos })
    .from(pagamentos)
    .innerJoin(vendas, eq(pagamentos.vendaId, vendas.id))
    .leftJoin(bandeiras, eq(pagamentos.bandeiraId, bandeiras.id))
    .where(and(eq(vendas.caixaId, caixaId), eq(vendas.status, "concluida")));

  const movimentos = await db
    .select({ tipo: caixaMovimentos.tipo, total: sql<number>`coalesce(sum(${caixaMovimentos.valorCentavos}), 0)::int` })
    .from(caixaMovimentos)
    .where(eq(caixaMovimentos.caixaId, caixaId))
    .groupBy(caixaMovimentos.tipo);

  const [{ quantidade }] = await db
    .select({ quantidade: sql<number>`count(*)::int` })
    .from(vendas)
    .where(and(eq(vendas.caixaId, caixaId), eq(vendas.status, "concluida")));

  const [{ comandasAbertas }] = await db
    .select({ comandasAbertas: sql<number>`count(*)::int` })
    .from(vendas)
    .where(and(eq(vendas.caixaId, caixaId), eq(vendas.status, "aberta")));

  const pagamentosResumo = resumirPagamentos(linhasPagamento);
  const suprimentosCentavos = movimentos.find((m) => m.tipo === "suprimento")?.total ?? 0;
  const sangriasCentavos = movimentos.find((m) => m.tipo === "sangria")?.total ?? 0;
  return {
    fundoCentavos: caixa.fundoCentavos,
    suprimentosCentavos,
    sangriasCentavos,
    quantidadeVendas: quantidade,
    comandasAbertas,
    pagamentos: pagamentosResumo,
    esperadoCentavos: dinheiroEsperado({
      fundoCentavos: caixa.fundoCentavos,
      vendasDinheiroCentavos: pagamentosResumo.porForma.dinheiro,
      suprimentosCentavos,
      sangriasCentavos,
    }),
  };
}

export type ResumoCaixa = NonNullable<Awaited<ReturnType<typeof resumoDoCaixa>>>;

export async function listarMovimentosDoCaixa(caixaId: string) {
  return getDb()
    .select({
      id: caixaMovimentos.id,
      tipo: caixaMovimentos.tipo,
      valorCentavos: caixaMovimentos.valorCentavos,
      motivo: caixaMovimentos.motivo,
      criadoEm: caixaMovimentos.criadoEm,
    })
    .from(caixaMovimentos)
    .where(eq(caixaMovimentos.caixaId, caixaId))
    .orderBy(desc(caixaMovimentos.criadoEm))
    .limit(100);
}

// Fechamentos recentes (para o dono): esperado, contado e diferença.
export async function listarFechamentos(limite = 50) {
  return getDb()
    .select({
      id: caixas.id,
      funcionario: funcionarios.nome,
      status: caixas.status,
      abertoEm: caixas.abertoEm,
      fechadoEm: caixas.fechadoEm,
      fundoCentavos: caixas.fundoCentavos,
      esperadoCentavos: caixas.esperadoCentavos,
      contadoCentavos: caixas.contadoCentavos,
      diferencaCentavos: caixas.diferencaCentavos,
      observacao: caixas.observacao,
    })
    .from(caixas)
    .innerJoin(funcionarios, eq(caixas.funcionarioId, funcionarios.id))
    .orderBy(desc(caixas.abertoEm))
    .limit(limite);
}

// Um caixa pelo id, com o dono do caixa: a página confere se quem pede é ele ou o dono da loja.
export async function buscarCaixaPorId(caixaId: string) {
  const [caixa] = await getDb()
    .select({
      id: caixas.id,
      funcionarioId: caixas.funcionarioId,
      funcionario: funcionarios.nome,
      status: caixas.status,
      abertoEm: caixas.abertoEm,
      fechadoEm: caixas.fechadoEm,
      fundoCentavos: caixas.fundoCentavos,
      esperadoCentavos: caixas.esperadoCentavos,
      contadoCentavos: caixas.contadoCentavos,
      diferencaCentavos: caixas.diferencaCentavos,
      observacao: caixas.observacao,
      reabertoEm: caixas.reabertoEm,
    })
    .from(caixas)
    .innerJoin(funcionarios, eq(caixas.funcionarioId, funcionarios.id))
    .where(eq(caixas.id, caixaId))
    .limit(1);
  return caixa ?? null;
}

export type CaixaDetalhe = NonNullable<Awaited<ReturnType<typeof buscarCaixaPorId>>>;
export type MovimentoCaixa = Awaited<ReturnType<typeof listarMovimentosDoCaixa>>[number];
