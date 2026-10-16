"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { createSupabaseServer } from "@/lib/supabase/server";
import { paginaInicial } from "./permissoes";
import { buscarFuncionarioAtivo } from "./sessao";
import { loginSchema, usuarioParaEmail } from "./usuario";

// `tentativa` muda a cada envio para o aviso de erro ser anunciado de novo.
export type EstadoLogin = { erro?: string; usuario?: string; tentativa?: number };

const ERRO_GENERICO = "Usuário ou senha incorretos.";
const ERRO_INDISPONIVEL = "Não foi possível entrar agora. Tente de novo.";

export async function entrar(anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const usuarioDigitado = String(formData.get("usuario") ?? "");
  const falha = (erro: string) => ({ erro, usuario: usuarioDigitado, tentativa: (anterior.tentativa ?? 0) + 1 });
  const dados = loginSchema.safeParse({ usuario: usuarioDigitado, senha: formData.get("senha") });
  if (!dados.success) return falha(ERRO_GENERICO);

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usuarioParaEmail(dados.data.usuario),
    password: dados.data.senha,
  });
  if (error) {
    if (error.status === 429) return falha("Muitas tentativas. Aguarde um minuto e tente de novo.");
    if (error.status !== 400) logger.error({ code: error.code, status: error.status }, "Falha no login");
    return falha(ERRO_GENERICO);
  }

  // Login sem perfil ativo (desativado ou sem cadastro) não entra; sem banco, também não.
  let funcionario: Awaited<ReturnType<typeof buscarFuncionarioAtivo>>;
  try {
    funcionario = await buscarFuncionarioAtivo(data.user.id);
  } catch (erro) {
    logger.error({ code: (erro as { code?: string }).code }, "Falha ao buscar funcionário no login");
    await encerrarSessao(supabase);
    return falha(ERRO_INDISPONIVEL);
  }
  if (!funcionario) {
    await encerrarSessao(supabase);
    return falha(ERRO_GENERICO);
  }
  redirect(paginaInicial(funcionario));
}

export async function sair() {
  await encerrarSessao(await createSupabaseServer());
  redirect("/entrar");
}

// "local" encerra só este aparelho. Se o Supabase falhar (rede, 5xx), apaga os cookies de sessão à mão.
async function encerrarSessao(supabase: Awaited<ReturnType<typeof createSupabaseServer>>) {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (!error) return;
  logger.warn({ code: error.code, status: error.status }, "Falha ao encerrar sessão no Supabase");
  const cookieStore = await cookies();
  for (const { name } of cookieStore.getAll()) if (name.startsWith("sb-")) cookieStore.delete(name);
}
