import "server-only";
import { and, desc, eq, gte, ne, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { bandeiras, caixas, estoqueMovimentos, funcionarios, pagamentos, produtos, vendaItens, vendas } from "@/db/schema";
import { FUSO_LOJA } from "@/features/historico/filtros";

// Início do dia/semana/mês no fuso da loja.
const inicio = (unidade: "day" | "week" | "month") => sql`date_trunc(${unidade}, now() at time zone ${FUSO_LOJA}) at time zone ${FUSO_LOJA}`;
// Últimos 30 dias contando hoje, a partir da meia-noite da loja.
const ultimos30Dias = sql`${inicio("day")} - interval '29 days'`;
const concluidaDesde = (desde: SQL) => and(eq(vendas.status, "concluida"), gte(vendas.concluidaEm, desde));

async function totais(desde: SQL) {
  const [linha] = await getDb()
    .select({ faturamentoCentavos: sql<number>`coalesce(sum(${vendas.totalCentavos}), 0)::int`, quantidade: sql<number>`count(*)::int` })
    .from(vendas)
    .where(concluidaDesde(desde));
  return { ...linha, ticketMedioCentavos: linha.quantidade ? Math.round(linha.faturamentoCentavos / linha.quantidade) : 0 };
}

export async function painelDoDono() {
  const db = getDb();
  const mes = inicio("month");
  const [dia, semana, mesTotais, porForma, porBandeira, porProduto, porFuncionario, porHora, porDia, fechamentosComDiferenca, estoque] = await Promise.all([
    totais(inicio("day")),
    totais(inicio("week")),
    totais(mes),
    db
      .select({ forma: pagamentos.forma, valorCentavos: sql<number>`sum(${pagamentos.valorCentavos})::int` })
      .from(pagamentos)
      .innerJoin(vendas, eq(pagamentos.vendaId, vendas.id))
      .where(concluidaDesde(mes))
      .groupBy(pagamentos.forma),
    db
      .select({ forma: pagamentos.forma, bandeira: bandeiras.nome, valorCentavos: sql<number>`sum(${pagamentos.valorCentavos})::int` })
      .from(pagamentos)
      .innerJoin(vendas, eq(pagamentos.vendaId, vendas.id))
      .innerJoin(bandeiras, eq(pagamentos.bandeiraId, bandeiras.id))
      .where(concluidaDesde(mes))
      .groupBy(pagamentos.forma, bandeiras.nome)
      .orderBy(desc(sql`sum(${pagamentos.valorCentavos})`)),
    db
      .select({ nome: vendaItens.nomeProduto, valorCentavos: sql<number>`sum(${vendaItens.totalCentavos})::int`, quantidade: sql<number>`sum(${vendaItens.quantidade})::int` })
      .from(vendaItens)
      .innerJoin(vendas, eq(vendaItens.vendaId, vendas.id))
      .where(concluidaDesde(mes))
      .groupBy(vendaItens.nomeProduto)
      .orderBy(desc(sql`sum(${vendaItens.totalCentavos})`))
      .limit(10),
    db
      .select({ id: funcionarios.id, nome: funcionarios.nome, valorCentavos: sql<number>`sum(${vendas.totalCentavos})::int`, quantidade: sql<number>`count(*)::int` })
      .from(vendas)
      .innerJoin(funcionarios, eq(vendas.concluidaPor, funcionarios.id))
      .where(concluidaDesde(mes))
      .groupBy(funcionarios.id, funcionarios.nome)
      .orderBy(desc(sql`sum(${vendas.totalCentavos})`)),
    db
      .select({
        hora: sql<number>`extract(hour from ${vendas.concluidaEm} at time zone ${FUSO_LOJA})::int`,
        valorCentavos: sql<number>`sum(${vendas.totalCentavos})::int`,
      })
      .from(vendas)
      .where(concluidaDesde(ultimos30Dias))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db
      .select({
        dia: sql<string>`to_char(${vendas.concluidaEm} at time zone ${FUSO_LOJA}, 'YYYY-MM-DD')`,
        valorCentavos: sql<number>`sum(${vendas.totalCentavos})::int`,
      })
      .from(vendas)
      .where(concluidaDesde(ultimos30Dias))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db
      .select({ id: caixas.id, funcionario: funcionarios.nome, fechadoEm: caixas.fechadoEm, diferencaCentavos: caixas.diferencaCentavos, observacao: caixas.observacao })
      .from(caixas)
      .innerJoin(funcionarios, eq(caixas.funcionarioId, funcionarios.id))
      .where(and(eq(caixas.status, "fechado"), ne(caixas.diferencaCentavos, 0), gte(caixas.fechadoEm, mes)))
      .orderBy(desc(caixas.fechadoEm))
      .limit(10),
    db
      .select({
        id: produtos.id,
        nome: produtos.nome,
        tipoVenda: produtos.tipoVenda,
        estoqueMinimo: produtos.estoqueMinimo,
        saldo: sql<number>`coalesce(sum(${estoqueMovimentos.quantidade}), 0)::int`,
      })
      .from(produtos)
      .leftJoin(estoqueMovimentos, eq(estoqueMovimentos.produtoId, produtos.id))
      .where(eq(produtos.ativo, true))
      .groupBy(produtos.id)
      // Só produtos com mínimo definido, ou com saldo negativo (venda sem entrada lançada).
      .having(
        sql`(${produtos.estoqueMinimo} > 0 and coalesce(sum(${estoqueMovimentos.quantidade}), 0) <= ${produtos.estoqueMinimo}) or coalesce(sum(${estoqueMovimentos.quantidade}), 0) < 0`,
      )
      .orderBy(produtos.nome)
      .limit(20),
  ]);
  return { dia, semana, mes: mesTotais, porForma, porBandeira, porProduto, porFuncionario, porHora, porDia, fechamentosComDiferenca, estoque };
}

export type PainelDono = Awaited<ReturnType<typeof painelDoDono>>;

