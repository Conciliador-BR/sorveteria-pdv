import "server-only";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  custosFixos,
  fichaTecnicaItens,
  insumos,
  maquinas,
  pagamentos,
  precificacaoParametros,
  precificacaoProdutos,
  produtos,
  vendas,
} from "@/db/schema";
import { custoDaFicha, depreciacaoMensal, rendimentoPadrao, type Parametros } from "./regras";

const LIMITE = 300;

export async function listarInsumos() {
  return getDb()
    .select({
      id: insumos.id,
      nome: insumos.nome,
      unidade: insumos.unidade,
      embalagemQuantidade: insumos.embalagemQuantidade,
      embalagemPrecoCentavos: insumos.embalagemPrecoCentavos,
    })
    .from(insumos)
    .orderBy(asc(insumos.nome))
    .limit(LIMITE);
}

export async function listarCustosFixos() {
  return getDb()
    .select({ id: custosFixos.id, nome: custosFixos.nome, valorMensalCentavos: custosFixos.valorMensalCentavos })
    .from(custosFixos)
    .orderBy(asc(custosFixos.nome))
    .limit(LIMITE);
}

export async function listarMaquinas() {
  return getDb()
    .select({
      id: maquinas.id,
      nome: maquinas.nome,
      valorCompraCentavos: maquinas.valorCompraCentavos,
      valorResidualCentavos: maquinas.valorResidualCentavos,
      vidaUtilMeses: maquinas.vidaUtilMeses,
    })
    .from(maquinas)
    .orderBy(asc(maquinas.nome))
    .limit(LIMITE);
}

const PARAMETROS_PADRAO = {
  faturamentoMensalCentavos: null,
  impostoPercentual: 0,
  taxaCartaoPercentual: 0,
  parteCartaoPercentual: 0,
  perdasPercentual: 0,
  margemPadraoPercentual: 3000,
};

export async function buscarParametros(): Promise<Parametros & { margemPadraoPercentual: number }> {
  const [linha] = await getDb()
    .select({
      faturamentoMensalCentavos: precificacaoParametros.faturamentoMensalCentavos,
      impostoPercentual: precificacaoParametros.impostoPercentual,
      taxaCartaoPercentual: precificacaoParametros.taxaCartaoPercentual,
      parteCartaoPercentual: precificacaoParametros.parteCartaoPercentual,
      perdasPercentual: precificacaoParametros.perdasPercentual,
      margemPadraoPercentual: precificacaoParametros.margemPadraoPercentual,
    })
    .from(precificacaoParametros)
    .where(eq(precificacaoParametros.id, 1))
    .limit(1);
  return linha ?? PARAMETROS_PADRAO;
}

// Fixos do mês + depreciação das máquinas, que entram no rateio sobre o faturamento.
export async function custosMensais() {
  const [fixos, listaMaquinas] = await Promise.all([listarCustosFixos(), listarMaquinas()]);
  const totalFixos = fixos.reduce((soma, c) => soma + c.valorMensalCentavos, 0);
  const totalDepreciacao = listaMaquinas.reduce((soma, m) => soma + depreciacaoMensal(m), 0);
  return { fixos, maquinas: listaMaquinas, totalFixos, totalDepreciacao, total: totalFixos + totalDepreciacao };
}

// Referência para o dono preencher os parâmetros: vendas concluídas dos últimos 30 dias.
export async function resumoUltimos30Dias() {
  const desde = sql`now() - interval '30 days'`;
  const filtro = and(eq(vendas.status, "concluida"), gte(vendas.concluidaEm, desde));
  const [[faturamento], [cartao]] = await Promise.all([
    getDb().select({ total: sql<number>`coalesce(sum(${vendas.totalCentavos}), 0)::int` }).from(vendas).where(filtro),
    getDb()
      .select({ total: sql<number>`coalesce(sum(${pagamentos.valorCentavos}), 0)::int` })
      .from(pagamentos)
      .innerJoin(vendas, eq(vendas.id, pagamentos.vendaId))
      .where(and(filtro, sql`${pagamentos.forma} in ('debito', 'credito')`)),
  ]);
  return { faturamentoCentavos: faturamento.total, cartaoCentavos: cartao.total };
}

export async function listarProdutosParaPrecificar() {
  return getDb()
    .select({
      id: produtos.id,
      nome: produtos.nome,
      tipoVenda: produtos.tipoVenda,
      precoCentavos: produtos.precoCentavos,
      rendimento: precificacaoProdutos.rendimento,
      margemPercentual: precificacaoProdutos.margemPercentual,
    })
    .from(produtos)
    .leftJoin(precificacaoProdutos, eq(precificacaoProdutos.produtoId, produtos.id))
    .where(eq(produtos.ativo, true))
    .orderBy(asc(produtos.nome))
    .limit(LIMITE);
}

export async function listarItensFicha() {
  return getDb()
    .select({
      id: fichaTecnicaItens.id,
      produtoId: fichaTecnicaItens.produtoId,
      insumoId: fichaTecnicaItens.insumoId,
      quantidade: fichaTecnicaItens.quantidade,
      nome: insumos.nome,
      unidade: insumos.unidade,
      embalagemQuantidade: insumos.embalagemQuantidade,
      embalagemPrecoCentavos: insumos.embalagemPrecoCentavos,
    })
    .from(fichaTecnicaItens)
    .innerJoin(insumos, eq(insumos.id, fichaTecnicaItens.insumoId))
    .orderBy(asc(insumos.nome))
    .limit(LIMITE * 20);
}

// Custo dos insumos por unidade (ou por kg) de cada produto com ficha técnica, em centavos inteiros.
// Produto sem ficha fica fora do mapa.
export async function custoUnitarioDosProdutos() {
  const [lista, itens] = await Promise.all([listarProdutosParaPrecificar(), listarItensFicha()]);
  const custos = new Map<string, number>();
  for (const produto of lista) {
    const ficha = itens.filter((item) => item.produtoId === produto.id);
    const custo = custoDaFicha(ficha, produto.rendimento ?? rendimentoPadrao(produto.tipoVenda), produto.tipoVenda);
    if (custo !== null) custos.set(produto.id, Math.round(custo));
  }
  return custos;
}

export type InsumoLista = Awaited<ReturnType<typeof listarInsumos>>[number];
export type CustoFixoLista = Awaited<ReturnType<typeof listarCustosFixos>>[number];
export type MaquinaLista = Awaited<ReturnType<typeof listarMaquinas>>[number];
export type ProdutoPrecificar = Awaited<ReturnType<typeof listarProdutosParaPrecificar>>[number];
export type ItemFichaLista = Awaited<ReturnType<typeof listarItensFicha>>[number];
