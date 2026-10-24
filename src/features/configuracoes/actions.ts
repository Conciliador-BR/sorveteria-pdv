"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { violouUnico } from "@/db/erros";
import { auditoria, bandeiras, configuracoes } from "@/db/schema";
import { exigirDono } from "@/features/auth/sessao";
import { errosPorCampo, lerFormulario, proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { dadosFiscaisSchema, editarBandeiraSchema, nomeLojaSchema, novaBandeiraSchema } from "./schemas";

const BANDEIRA_REPETIDA = "Já existe uma bandeira com esse nome nesse tipo.";

export async function salvarNomeLoja(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = nomeLojaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { nomeLoja } = dados.data;

  await getDb().transaction(async (tx) => {
    // Linha única (id = 1): cria se a migration ainda não semeou, senão atualiza.
    const [antes] = await tx.select({ nomeLoja: configuracoes.nomeLoja }).from(configuracoes).where(eq(configuracoes.id, 1)).for("update").limit(1);
    await tx
      .insert(configuracoes)
      .values({ id: 1, nomeLoja })
      .onConflictDoUpdate({ target: configuracoes.id, set: { nomeLoja, atualizadoEm: sql`now()` } });
    await tx.insert(auditoria).values({
      tabela: "configuracoes",
      registroId: "1",
      acao: "editar",
      dados: { antes: { nomeLoja: antes?.nomeLoja ?? null }, depois: { nomeLoja } },
      funcionarioId: dono.id,
    });
  });

  // O nome aparece no menu de todas as telas da área logada.
  revalidatePath("/", "layout");
  return { ok: "Nome da loja salvo.", envio };
}

export async function salvarDadosFiscais(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = dadosFiscaisSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  await getDb().transaction(async (tx) => {
    const [antes] = await tx
      .select({
        emitirNfce: configuracoes.emitirNfce,
        razaoSocial: configuracoes.razaoSocial,
        cnpj: configuracoes.cnpj,
        inscricaoEstadual: configuracoes.inscricaoEstadual,
        endereco: configuracoes.endereco,
        uf: configuracoes.uf,
      })
      .from(configuracoes)
      .where(eq(configuracoes.id, 1))
      .for("update")
      .limit(1);
    await tx
      .insert(configuracoes)
      .values({ id: 1, ...dados.data })
      .onConflictDoUpdate({ target: configuracoes.id, set: { ...dados.data, atualizadoEm: sql`now()` } });
    await tx.insert(auditoria).values({
      tabela: "configuracoes",
      registroId: "1",
      acao: "editar",
      dados: { antes: antes ?? null, depois: dados.data },
      funcionarioId: dono.id,
    });
  });

  revalidatePath("/configuracoes");
  return { ok: dados.data.emitirNfce ? "Dados salvos. As próximas vendas emitem NFC-e (em modo de teste)." : "Dados salvos. Emissão de NFC-e desligada.", envio };
}

export async function criarBandeira(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = novaBandeiraSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { nome, tipo } = dados.data;

  try {
    await getDb().transaction(async (tx) => {
      // Nova bandeira entra no fim da lista do tipo.
      const [{ proxima }] = await tx
        .select({ proxima: sql<number>`coalesce(max(${bandeiras.ordem}), 0)::int + 1` })
        .from(bandeiras)
        .where(eq(bandeiras.tipo, tipo));
      const [nova] = await tx.insert(bandeiras).values({ nome, tipo, ordem: proxima }).returning({ id: bandeiras.id });
      await tx.insert(auditoria).values({
        tabela: "bandeiras",
        registroId: nova.id,
        acao: "criar",
        dados: { nome, tipo, ordem: proxima },
        funcionarioId: dono.id,
      });
    });
  } catch (erro) {
    // Índice único (nome sem diferenciar maiúsculas, tipo) também cobre dois envios ao mesmo tempo.
    if (violouUnico(erro)) return { campos: { nome: BANDEIRA_REPETIDA }, envio };
    throw erro;
  }

  revalidatePath("/configuracoes");
  return { ok: `Bandeira ${nome} cadastrada.`, envio };
}

export async function editarBandeira(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximoEnvio(anterior);
  const dados = editarBandeiraSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { id, ...alteracoes } = dados.data;

  let resultado: "ok" | "nao_encontrada";
  try {
    resultado = await getDb().transaction(async (tx) => {
      const [antes] = await tx
        .select({ nome: bandeiras.nome, ativo: bandeiras.ativo })
        .from(bandeiras)
        .where(eq(bandeiras.id, id))
        .for("update")
        .limit(1);
      if (!antes) return "nao_encontrada" as const;
      await tx.update(bandeiras).set(alteracoes).where(eq(bandeiras.id, id));
      await tx.insert(auditoria).values({
        tabela: "bandeiras",
        registroId: id,
        acao: "editar",
        dados: { antes, depois: alteracoes },
        funcionarioId: dono.id,
      });
      return "ok" as const;
    });
  } catch (erro) {
    if (violouUnico(erro)) return { campos: { nome: BANDEIRA_REPETIDA }, envio };
    throw erro;
  }
  if (resultado === "nao_encontrada") return { erro: "Bandeira não encontrada. Recarregue a página.", envio };

  revalidatePath("/configuracoes");
  return { ok: alteracoes.ativo ? "Bandeira salva." : "Bandeira salva e desativada: não aparece mais no pagamento.", envio };
}
