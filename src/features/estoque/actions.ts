"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { estoqueMovimentos, produtos } from "@/db/schema";
import { exigirPermissao } from "@/features/auth/sessao";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { movimentoDoLancamento } from "./regras";
import { lancamentoSchema } from "./schemas";

export async function lancarEstoque(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const funcionario = await exigirPermissao("pode_lancar_estoque");
  const envio = proximoEnvio(anterior);
  const dados = lancamentoSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { produtoId, observacao, ...lancamento } = dados.data;

  const resultado = await getDb().transaction(async (tx) => {
    // Trava o produto para dois ajustes simultâneos não calcularem a diferença sobre o mesmo saldo.
    const [produto] = await tx.select({ id: produtos.id }).from(produtos).where(eq(produtos.id, produtoId)).for("update").limit(1);
    if (!produto) return "sem_produto" as const;
    const [{ saldo }] = await tx
      .select({ saldo: sql<number>`coalesce(sum(${estoqueMovimentos.quantidade}), 0)::int` })
      .from(estoqueMovimentos)
      .where(eq(estoqueMovimentos.produtoId, produtoId));
    const movimento = movimentoDoLancamento(lancamento, saldo);
    if (!movimento) return "sem_diferenca" as const;
    await tx.insert(estoqueMovimentos).values({ produtoId, observacao, funcionarioId: funcionario.id, ...movimento });
    return "ok" as const;
  });

  if (resultado === "sem_produto") return { erro: "Produto não encontrado.", envio };
  if (resultado === "sem_diferenca") return { ok: "O saldo já era esse. Nada foi lançado.", envio };
  revalidatePath("/estoque");
  return { ok: "Lançamento registrado.", envio };
}
