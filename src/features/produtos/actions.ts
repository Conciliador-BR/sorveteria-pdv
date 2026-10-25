"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { violouReferencia, violouUnico } from "@/db/erros";
import { auditoria, categorias, estoqueMovimentos, produtoFotos, produtos, vendaItens } from "@/db/schema";
import { exigirPermissao } from "@/features/auth/sessao";
import type { Tx } from "@/features/vendas/operacoes";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import type { z } from "zod";
import { categoriaSchema, salvarProdutoSchema } from "./schemas";


async function produtoJaUsado(tx: Tx, id: string) {
  const [movimento] = await tx.select({ id: estoqueMovimentos.id }).from(estoqueMovimentos).where(eq(estoqueMovimentos.produtoId, id)).limit(1);
  if (movimento) return true;
  const [item] = await tx.select({ id: vendaItens.id }).from(vendaItens).where(eq(vendaItens.produtoId, id)).limit(1);
  return Boolean(item);
}

type FotoEscolhida = z.output<typeof salvarProdutoSchema>["foto"];

// Traduz a escolha do formulário para as colunas do produto. `manter` devolve undefined (não mexe).
async function colunasDaFoto(tx: Tx, foto: FotoEscolhida) {
  switch (foto.tipo) {
    case "manter":
      return undefined;
    case "nenhuma":
      return { imagem: null, fotoId: null };
    case "galeria":
      return { imagem: foto.id, fotoId: null };
    case "nova": {
      const [nova] = await tx.insert(produtoFotos).values({ tipo: foto.formato, conteudo: foto.conteudo }).returning({ id: produtoFotos.id });
      return { imagem: null, fotoId: nova.id };
    }
  }
}

export async function salvarProduto(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const funcionario = await exigirPermissao("pode_gerenciar_produtos");
  const envio = proximoEnvio(anterior);
  const dados = salvarProdutoSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { id, foto, ...campos } = dados.data;
  const editando = id !== null;

  try {
    await getDb().transaction(async (tx) => {
      const colunasFoto = await colunasDaFoto(tx, foto);
      const valores = { ...campos, ...colunasFoto };
      if (id) {
        const alteracoes = valores;
        // Trava o produto: uma venda não grava item no tipo antigo enquanto o tipo muda.
        const [antes] = await tx.select().from(produtos).where(eq(produtos.id, id)).for("update").limit(1);
        if (!antes) throw new Error("produto_nao_encontrado");
        // Saldo e itens já gravados estão em unidades ou em gramas: trocar o tipo misturaria os dois.
        if (antes.tipoVenda !== valores.tipoVenda && (await produtoJaUsado(tx, id))) throw new Error("tipo_em_uso");
        await tx.update(produtos).set(alteracoes).where(eq(produtos.id, id));
        // Foto trocada ou removida: apaga a antiga, que ninguém mais usa.
        if (antes.fotoId && colunasFoto && colunasFoto.fotoId !== antes.fotoId) {
          await tx.delete(produtoFotos).where(eq(produtoFotos.id, antes.fotoId));
        }
        await tx.insert(auditoria).values({
          tabela: "produtos",
          registroId: id,
          acao: "editar",
          dados: { antes: { nome: antes.nome, precoCentavos: antes.precoCentavos, ativo: antes.ativo }, depois: alteracoes },
          funcionarioId: funcionario.id,
        });
      } else {
        const [novo] = await tx.insert(produtos).values(valores).returning({ id: produtos.id });
        await tx.insert(auditoria).values({
          tabela: "produtos",
          registroId: novo.id,
          acao: "criar",
          dados: valores,
          funcionarioId: funcionario.id,
        });
      }
    });
  } catch (erro) {
    if (violouUnico(erro)) return { campos: { codigo: "Esse código já está em outro produto." }, envio };
    if (violouReferencia(erro)) return { campos: { categoriaId: "Categoria não encontrada. Recarregue a página." }, envio };
    if ((erro as Error).message === "produto_nao_encontrado") return { erro: "Produto não encontrado.", envio };
    if ((erro as Error).message === "tipo_em_uso") {
      return { campos: { tipoVenda: "Esse produto já tem vendas ou estoque. Para mudar entre unidade e peso, cadastre um produto novo." }, envio };
    }
    throw erro;
  }

  revalidatePath("/produtos");
  return { ok: editando ? "Produto atualizado." : "Produto cadastrado.", envio };
}

export async function criarCategoria(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirPermissao("pode_gerenciar_produtos");
  const envio = proximoEnvio(anterior);
  const dados = categoriaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  try {
    await getDb().insert(categorias).values(dados.data);
  } catch (erro) {
    if (violouUnico(erro)) return { campos: { nome: "Essa categoria já existe." }, envio };
    throw erro;
  }
  revalidatePath("/produtos");
  return { ok: "Categoria criada.", envio };
}
