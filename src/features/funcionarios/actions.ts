"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { auditoria, funcionarios } from "@/db/schema";
import { exigirDono } from "@/features/auth/sessao";
import { usuarioParaEmail } from "@/features/auth/usuario";
import { logger } from "@/lib/logger";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { alteracaoTrancaODono } from "./regras";
import { errosPorCampo, lerFormulario, proximoEnvio as proximo, type EstadoFormulario } from "@/lib/formulario";
import { criarFuncionarioSchema, editarFuncionarioSchema, redefinirSenhaSchema } from "./schemas";

export async function criarFuncionario(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximo(anterior);
  const dados = criarFuncionarioSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { senha, usuario, ...perfil } = dados.data;

  const admin = createSupabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email: usuarioParaEmail(usuario),
    password: senha,
    email_confirm: true,
  });
  if (error || !data.user) {
    if (error?.code === "email_exists") return { campos: { usuario: "Esse usuário já existe." }, envio };
    if (error?.code === "weak_password") return { campos: { senha: "Senha fraca. Use uma senha mais forte." }, envio };
    logger.error({ code: error?.code, status: error?.status }, "Falha ao criar login de funcionário");
    return { erro: "Não foi possível criar o login agora. Tente de novo.", envio };
  }

  try {
    await getDb().transaction(async (tx) => {
      await tx.insert(funcionarios).values({ id: data.user.id, usuario, ...perfil });
      await tx.insert(auditoria).values({
        tabela: "funcionarios",
        registroId: data.user.id,
        acao: "criar",
        dados: { usuario, ...perfil },
        funcionarioId: dono.id,
      });
    });
  } catch (erro) {
    // Sem perfil o login não serve: desfaz o usuário criado no Auth.
    const desfeito = await admin.auth.admin.deleteUser(data.user.id);
    if (desfeito.error) logger.error({ code: desfeito.error.code, userId: data.user.id }, "Falha ao desfazer login sem perfil");
    logger.error({ code: (erro as { code?: string } | null)?.code }, "Falha ao gravar funcionário");
    return { erro: "Não foi possível salvar o funcionário. Tente de novo.", envio };
  }

  revalidatePath("/funcionarios");
  return { ok: `${perfil.nome} pode entrar com o usuário "${usuario}".`, envio };
}

export async function editarFuncionario(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximo(anterior);
  const dados = editarFuncionarioSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };
  const { id, ...alteracoes } = dados.data;

  if (alteracaoTrancaODono({ idEditado: id, idDono: dono.id, novoPapel: alteracoes.papel, novoAtivo: alteracoes.ativo })) {
    return { erro: "Você não pode tirar o seu próprio acesso de dono.", envio };
  }

  const resultado = await getDb().transaction(async (tx) => {
    // A loja nunca fica sem um dono ativo (dois donos se rebaixando ao mesmo tempo).
    if (alteracoes.papel !== "dono" || !alteracoes.ativo) {
      const outrosDonos = await tx
        .select({ id: funcionarios.id })
        .from(funcionarios)
        .where(and(eq(funcionarios.papel, "dono"), eq(funcionarios.ativo, true), ne(funcionarios.id, id)))
        .for("update");
      if (outrosDonos.length === 0) return "sem_dono" as const;
    }
    const atualizados = await tx
      .update(funcionarios)
      .set(alteracoes)
      .where(eq(funcionarios.id, id))
      .returning({ id: funcionarios.id });
    if (atualizados.length === 0) return "nao_encontrado" as const;
    await tx.insert(auditoria).values({ tabela: "funcionarios", registroId: id, acao: "editar", dados: alteracoes, funcionarioId: dono.id });
    return "ok" as const;
  });
  if (resultado === "sem_dono") return { erro: "A loja precisa de pelo menos um dono ativo.", envio };
  if (resultado === "nao_encontrado") return { erro: "Funcionário não encontrado.", envio };

  revalidatePath("/funcionarios");
  return { ok: "Alterações salvas.", envio };
}

export async function redefinirSenha(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const dono = await exigirDono();
  const envio = proximo(anterior);
  const dados = redefinirSenhaSchema.safeParse(lerFormulario(formData));
  if (!dados.success) return { campos: errosPorCampo(dados.error), envio };

  // Só troca senha de quem é funcionário da loja, não de qualquer login do Auth.
  const [existe] = await getDb().select({ id: funcionarios.id }).from(funcionarios).where(eq(funcionarios.id, dados.data.id)).limit(1);
  if (!existe) return { erro: "Funcionário não encontrado.", envio };

  const { error } = await createSupabaseAdmin().auth.admin.updateUserById(dados.data.id, { password: dados.data.senha });
  if (error) {
    if (error.code === "weak_password") return { campos: { senha: "Senha fraca. Use uma senha mais forte." }, envio };
    logger.error({ code: error.code, status: error.status }, "Falha ao redefinir senha");
    return { erro: "Não foi possível trocar a senha agora. Tente de novo.", envio };
  }
  try {
    await getDb().transaction(async (tx) => {
      // Encerra as sessões abertas com a senha antiga (os refresh tokens caem junto).
      await tx.execute(sql`delete from auth.sessions where user_id = ${dados.data.id}`);
      await tx.insert(auditoria).values({ tabela: "funcionarios", registroId: dados.data.id, acao: "redefinir_senha", funcionarioId: dono.id });
    });
  } catch (erro) {
    logger.error({ code: (erro as { code?: string } | null)?.code }, "Falha ao encerrar sessões ou auditar troca de senha");
    return { ok: "Senha trocada, mas não consegui desconectar os aparelhos já logados. Se a senha vazou, desative o funcionário.", envio };
  }
  return { ok: "Senha trocada e aparelhos desconectados. Passe a nova senha pessoalmente.", envio };
}
