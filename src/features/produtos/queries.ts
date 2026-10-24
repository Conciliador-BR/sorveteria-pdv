import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { categorias, produtoFotos, produtos } from "@/db/schema";

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
      imagem: produtos.imagem,
      fotoId: produtos.fotoId,
    })
    .from(produtos)
    .leftJoin(categorias, eq(produtos.categoriaId, categorias.id))
    .where(opcoes.somenteAtivos ? eq(produtos.ativo, true) : undefined)
    .orderBy(asc(categorias.ordem), asc(produtos.nome))
    .limit(500);
}

export type ProdutoLista = Awaited<ReturnType<typeof listarProdutos>>[number];

// Foto enviada, para a rota que entrega a imagem ao navegador.
export async function buscarFotoProduto(id: string) {
  const [foto] = await getDb()
    .select({ tipo: produtoFotos.tipo, conteudo: produtoFotos.conteudo })
    .from(produtoFotos)
    .where(eq(produtoFotos.id, id))
    .limit(1);
  return foto ?? null;
}
