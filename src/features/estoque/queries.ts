import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { estoqueMovimentos, funcionarios, produtos } from "@/db/schema";

// Saldo de cada produto ativo = soma das movimentações.
export async function listarSaldos() {
  return getDb()
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
    .orderBy(asc(produtos.nome))
    .limit(500);
}

export async function listarUltimosMovimentos(limite = 30) {
  return getDb()
    .select({
      id: estoqueMovimentos.id,
      produto: produtos.nome,
      tipoVenda: produtos.tipoVenda,
      tipo: estoqueMovimentos.tipo,
      motivo: estoqueMovimentos.motivo,
      quantidade: estoqueMovimentos.quantidade,
      observacao: estoqueMovimentos.observacao,
      funcionario: funcionarios.nome,
      criadoEm: estoqueMovimentos.criadoEm,
    })
    .from(estoqueMovimentos)
    .innerJoin(produtos, eq(estoqueMovimentos.produtoId, produtos.id))
    .innerJoin(funcionarios, eq(estoqueMovimentos.funcionarioId, funcionarios.id))
    .orderBy(desc(estoqueMovimentos.criadoEm))
    .limit(limite);
}

export type SaldoProduto = Awaited<ReturnType<typeof listarSaldos>>[number];
export type MovimentoEstoque = Awaited<ReturnType<typeof listarUltimosMovimentos>>[number];
