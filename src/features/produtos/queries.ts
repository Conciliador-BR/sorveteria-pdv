import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categorias, produtos } from "@/db/schema";

export async function listarCategorias() {
  return getDb()
    .select({ id: categorias.id, nome: categorias.nome, ordem: categorias.ordem, ativo: categorias.ativo })
    .from(categorias)
    .orderBy(asc(categorias.ordem), asc(categorias.nome))
    .limit(100);
}

export async function listarProdutos(opcoes: { somenteAtivos?: boolean } = {}) {
  return getDb()
    .select({
      id: produtos.id,
      nome: produtos.nome,
      categoriaId: produtos.categoriaId,
      categoria: categorias.nome,
      tipoVenda: produtos.tipoVenda,
      precoCentavos: produtos.precoCentavos,
      codigo: produtos.codigo,
      estoqueMinimo: produtos.estoqueMinimo,
      baixaAutomatica: produtos.baixaAutomatica,
      ativo: produtos.ativo,
    })
    .from(produtos)
    .leftJoin(categorias, eq(produtos.categoriaId, categorias.id))
    .where(opcoes.somenteAtivos ? eq(produtos.ativo, true) : undefined)
    .orderBy(asc(categorias.ordem), asc(produtos.nome))
    .limit(500);
}

export type ProdutoLista = Awaited<ReturnType<typeof listarProdutos>>[number];
