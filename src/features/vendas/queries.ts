import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { bandeiras, categorias, funcionarios, produtos, vendaItens, vendas } from "@/db/schema";

// Produtos ativos para a grade do PDV, na ordem das categorias.
export async function listarProdutosParaVenda() {
  return getDb()
    .select({
      id: produtos.id,
      nome: produtos.nome,
      codigo: produtos.codigo,
      tipoVenda: produtos.tipoVenda,
      precoCentavos: produtos.precoCentavos,
      categoria: categorias.nome,
    })
    .from(produtos)
    .leftJoin(categorias, eq(produtos.categoriaId, categorias.id))
    .where(eq(produtos.ativo, true))
    .orderBy(sql`${categorias.ordem} asc nulls last`, asc(categorias.nome), asc(produtos.nome))
    .limit(500);
}

export type ProdutoParaVenda = Awaited<ReturnType<typeof listarProdutosParaVenda>>[number];

export async function listarBandeirasAtivas() {
  const lista = await getDb()
    .select({ id: bandeiras.id, nome: bandeiras.nome, tipo: bandeiras.tipo })
    .from(bandeiras)
    .where(eq(bandeiras.ativo, true))
    .orderBy(asc(bandeiras.ordem), asc(bandeiras.nome))
    .limit(50);
  return {
    debito: lista.filter((bandeira) => bandeira.tipo === "debito").map(({ id, nome }) => ({ id, nome })),
    credito: lista.filter((bandeira) => bandeira.tipo === "credito").map(({ id, nome }) => ({ id, nome })),
  };
}

export type BandeirasPorTipo = Awaited<ReturnType<typeof listarBandeirasAtivas>>;

const minutosDesde = (coluna: typeof vendas.abertaEm) => sql<number>`floor(extract(epoch from (now() - ${coluna})) / 60)::int`;

export async function listarComandasAbertas() {
  return getDb()
    .select({
      id: vendas.id,
      identificacao: vendas.identificacao,
      totalCentavos: vendas.totalCentavos,
      abertaEm: vendas.abertaEm,
      minutosAberta: minutosDesde(vendas.abertaEm),
      abertaPor: funcionarios.nome,
      quantidadeItens: sql<number>`count(${vendaItens.id})::int`,
    })
    .from(vendas)
    .innerJoin(funcionarios, eq(vendas.funcionarioId, funcionarios.id))
    .leftJoin(vendaItens, eq(vendaItens.vendaId, vendas.id))
    .where(and(eq(vendas.tipo, "comanda"), eq(vendas.status, "aberta")))
    .groupBy(vendas.id, funcionarios.nome)
    .orderBy(desc(vendas.abertaEm))
    .limit(100);
}

export type ComandaAberta = Awaited<ReturnType<typeof listarComandasAbertas>>[number];

// Comanda com os itens, quem lançou e quando. Id inválido ou inexistente → null.
export async function buscarComanda(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const db = getDb();
  const [comanda] = await db
    .select({
      id: vendas.id,
      numero: vendas.numero,
      identificacao: vendas.identificacao,
      status: vendas.status,
      totalCentavos: vendas.totalCentavos,
      trocoCentavos: vendas.trocoCentavos,
      abertaEm: vendas.abertaEm,
      abertaPor: funcionarios.nome,
    })
    .from(vendas)
    .innerJoin(funcionarios, eq(vendas.funcionarioId, funcionarios.id))
    .where(and(eq(vendas.id, id), eq(vendas.tipo, "comanda")))
    .limit(1);
  if (!comanda) return null;

  const itens = await db
    .select({
      id: vendaItens.id,
      nome: vendaItens.nomeProduto,
      tipoVenda: vendaItens.tipoVenda,
      quantidade: vendaItens.quantidade,
      pesoGramas: vendaItens.pesoGramas,
      pesoPeloValor: vendaItens.pesoPeloValor,
      totalCentavos: vendaItens.totalCentavos,
      lancadoPor: funcionarios.nome,
      criadoEm: vendaItens.criadoEm,
    })
    .from(vendaItens)
    .innerJoin(funcionarios, eq(vendaItens.lancadoPor, funcionarios.id))
    .where(eq(vendaItens.vendaId, id))
    .orderBy(asc(vendaItens.criadoEm))
    .limit(200);

  return { ...comanda, itens };
}

export type ItemDaComanda = NonNullable<Awaited<ReturnType<typeof buscarComanda>>>["itens"][number];
