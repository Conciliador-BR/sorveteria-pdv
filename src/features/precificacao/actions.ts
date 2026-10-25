"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { violouReferencia, violouUnico } from "@/db/erros";
import { custosFixos, insumos, maquinas, precificacaoParametros } from "@/db/schema";
import { exigirDono } from "@/features/auth/sessao";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { custoFixoSchema, idSchema, insumoSchema, maquinaSchema, parametrosSchema } from "./schemas";

// Cadastros da precificação (insumos, custos fixos, máquinas e parâmetros). Só o dono.
// São dados de planejamento: não mexem em venda, caixa nem estoque. Preço de produto muda só em actions-ficha.ts, com auditoria.

const CAMINHO = "/precificacao";
const NAO_ENCONTRADO = "Registro não encontrado. Recarregue a página.";

export async function salvarInsumo(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = insumoSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { id, ...valores } = dados.data;

  try {
    if (id) {
      const alterados = await getDb()
        .update(insumos)
        .set({ ...valores, atualizadoEm: sql`now()` })
        .where(eq(insumos.id, id))
        .returning({ id: insumos.id });
      if (alterados.length === 0) return { erro: NAO_ENCONTRADO, envio };
    } else {
      await getDb().insert(insumos).values(valores);
    }
  } catch (erro) {
    if (violouUnico(erro)) return { campos: { nome: "Já existe um insumo com esse nome." }, envio };
    throw erro;
  }

  revalidatePath(CAMINHO);
  return { ok: id ? "Insumo salvo. As fichas que usam ele já foram recalculadas." : `Insumo ${valores.nome} cadastrado.`, envio };
}

export async function excluirInsumo(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = idSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { erro: NAO_ENCONTRADO, envio };

  try {
    await getDb().delete(insumos).where(eq(insumos.id, dados.data.id));
  } catch (erro) {
    if (violouReferencia(erro)) return { erro: "Esse insumo está na ficha técnica de um produto. Tire ele da ficha antes de excluir.", envio };
    throw erro;
  }
  revalidatePath(CAMINHO);
  return { ok: "Insumo excluído.", envio };
}

export async function salvarCustoFixo(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = custoFixoSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { id, ...valores } = dados.data;

  if (id) {
    const alterados = await getDb().update(custosFixos).set(valores).where(eq(custosFixos.id, id)).returning({ id: custosFixos.id });
    if (alterados.length === 0) return { erro: NAO_ENCONTRADO, envio };
  } else {
    await getDb().insert(custosFixos).values(valores);
  }
  revalidatePath(CAMINHO);
  return { ok: id ? "Custo fixo salvo." : `Custo ${valores.nome} cadastrado.`, envio };
}

export async function excluirCustoFixo(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = idSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { erro: NAO_ENCONTRADO, envio };
  await getDb().delete(custosFixos).where(eq(custosFixos.id, dados.data.id));
  revalidatePath(CAMINHO);
  return { ok: "Custo fixo excluído.", envio };
}

export async function salvarMaquina(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = maquinaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { id, vidaUtilAnos, ...resto } = dados.data;
  const valores = { ...resto, vidaUtilMeses: vidaUtilAnos * 12 };

  if (id) {
    const alterados = await getDb().update(maquinas).set(valores).where(eq(maquinas.id, id)).returning({ id: maquinas.id });
    if (alterados.length === 0) return { erro: NAO_ENCONTRADO, envio };
  } else {
    await getDb().insert(maquinas).values(valores);
  }
  revalidatePath(CAMINHO);
  return { ok: id ? "Máquina salva." : `Máquina ${valores.nome} cadastrada.`, envio };
}

export async function excluirMaquina(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = idSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { erro: NAO_ENCONTRADO, envio };
  await getDb().delete(maquinas).where(eq(maquinas.id, dados.data.id));
  revalidatePath(CAMINHO);
  return { ok: "Máquina excluída.", envio };
}

export async function salvarParametros(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = parametrosSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  // Linha única (id = 1): cria se a migration ainda não semeou, senão atualiza.
  await getDb()
    .insert(precificacaoParametros)
    .values({ id: 1, ...dados.data })
    .onConflictDoUpdate({ target: precificacaoParametros.id, set: { ...dados.data, atualizadoEm: sql`now()` } });

  revalidatePath(CAMINHO);
  return { ok: "Impostos, taxas e margem padrão salvos. Os preços sugeridos já foram recalculados.", envio };
}
