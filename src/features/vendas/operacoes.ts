import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { getDb } from "@/db";
import { bandeiras, estoqueMovimentos, pagamentos, produtos, vendaItens } from "@/db/schema";
import { calcularItem, ErroItem, type PagamentoInformado } from "./regras";
import type { ItemPedido } from "./schemas";

export type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

export class ErroVenda extends Error {}

// Teto de um item e de uma venda: o mesmo dos pagamentos (R$ 100.000,00).
export const LIMITE_CENTAVOS = 10_000_000;

// Preço, nome e tipo vêm do cadastro, nunca do navegador. Exceção: no modo valor o total é o que o
// funcionário digitou da balança (as gramas gravadas são estimadas).
export async function montarItens(tx: Tx, itens: ItemPedido[], vendaId: string, lancadoPor: string) {
  const ids = [...new Set(itens.map((item) => item.produtoId))];
  const cadastro = await tx
    .select({ id: produtos.id, nome: produtos.nome, tipoVenda: produtos.tipoVenda, precoCentavos: produtos.precoCentavos })
    .from(produtos)
    .where(and(inArray(produtos.id, ids), eq(produtos.ativo, true)));
  const porId = new Map(cadastro.map((produto) => [produto.id, produto]));

  return itens.map((item) => {
    const produto = porId.get(item.produtoId);
    if (!produto) throw new ErroVenda("Um dos produtos não está mais disponível. Atualize a tela.");
    let calculado: ReturnType<typeof calcularItem>;
    try {
      calculado = calcularItem(produto, item);
    } catch (erro) {
      if (erro instanceof ErroItem) throw new ErroVenda(erro.message);
      throw erro;
    }
    const { quantidade, pesoGramas, totalCentavos } = calculado;
    if (totalCentavos > LIMITE_CENTAVOS) throw new ErroVenda(`O item ${produto.nome} passou do limite por venda.`);
    return {
      vendaId,
      produtoId: produto.id,
      nomeProduto: produto.nome,
      tipoVenda: produto.tipoVenda,
      quantidade,
      pesoGramas,
      precoUnitarioCentavos: produto.precoCentavos,
      totalCentavos,
      lancadoPor,
    } satisfies typeof vendaItens.$inferInsert;
  });
}

export async function gravarPagamentos(tx: Tx, vendaId: string, lista: PagamentoInformado[]) {
  const idsBandeira = lista.flatMap((pagamento) => ("bandeiraId" in pagamento ? [pagamento.bandeiraId] : []));
  if (idsBandeira.length > 0) {
    const validas = await tx.select({ id: bandeiras.id, tipo: bandeiras.tipo }).from(bandeiras).where(and(inArray(bandeiras.id, idsBandeira), eq(bandeiras.ativo, true)));
    const tipoPorId = new Map(validas.map((bandeira) => [bandeira.id, bandeira.tipo]));
    for (const pagamento of lista) {
      if ("bandeiraId" in pagamento && tipoPorId.get(pagamento.bandeiraId) !== pagamento.forma) throw new ErroVenda("Bandeira inválida para essa forma de pagamento.");
    }
  }
  await tx.insert(pagamentos).values(
    lista.map((pagamento) => ({
      vendaId,
      forma: pagamento.forma,
      valorCentavos: pagamento.valorCentavos,
      bandeiraId: "bandeiraId" in pagamento ? pagamento.bandeiraId : null,
      valorRecebidoCentavos: pagamento.forma === "dinheiro" ? pagamento.recebidoCentavos : null,
    })),
  );
}

// Baixa automática na conclusão: unidades ou gramas, só dos produtos marcados.
export async function baixarEstoque(tx: Tx, vendaId: string, funcionarioId: string) {
  const itens = await tx
    .select({ produtoId: vendaItens.produtoId, quantidade: vendaItens.quantidade, pesoGramas: vendaItens.pesoGramas })
    .from(vendaItens)
    .innerJoin(produtos, eq(vendaItens.produtoId, produtos.id))
    .where(and(eq(vendaItens.vendaId, vendaId), eq(produtos.baixaAutomatica, true)));
  if (itens.length === 0) return;
  // Trava os produtos em ordem fixa: um ajuste de estoque não corre junto com a baixa.
  const ids = [...new Set(itens.map((item) => item.produtoId))].sort();
  await tx.select({ id: produtos.id }).from(produtos).where(inArray(produtos.id, ids)).orderBy(produtos.id).for("update");
  await tx.insert(estoqueMovimentos).values(
    itens.map((item) => ({
      produtoId: item.produtoId,
      tipo: "venda" as const,
      motivo: "venda" as const,
      quantidade: -(item.pesoGramas ?? item.quantidade),
      vendaId,
      funcionarioId,
    })),
  );
}

// Cancelamento devolve exatamente o que a venda baixou.
export async function devolverEstoque(tx: Tx, vendaId: string, funcionarioId: string) {
  const baixas = await tx
    .select({ produtoId: estoqueMovimentos.produtoId, quantidade: estoqueMovimentos.quantidade })
    .from(estoqueMovimentos)
    .where(and(eq(estoqueMovimentos.vendaId, vendaId), eq(estoqueMovimentos.tipo, "venda")));
  if (baixas.length === 0) return;
  await tx.insert(estoqueMovimentos).values(
    baixas.map((baixa) => ({
      produtoId: baixa.produtoId,
      tipo: "cancelamento" as const,
      motivo: "cancelamento" as const,
      quantidade: -baixa.quantidade,
      vendaId,
      funcionarioId,
    })),
  );
}
