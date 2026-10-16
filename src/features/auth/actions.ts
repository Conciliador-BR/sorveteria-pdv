"use server";

import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { createSupabaseServer } from "@/lib/supabase/server";
import { paginaInicial } from "./permissoes";
import { buscarFuncionarioAtivo } from "./sessao";
import { loginSchema, usuarioParaEmail } from "./usuario";

export type EstadoLogin = { erro?: string; usuario?: string };

const ERRO_GENERICO = "Usuário ou senha incorretos.";

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const usuarioDigitado = String(formData.get("usuario") ?? "");
  const dados = loginSchema.safeParse({ usuario: usuarioDigitado, senha: formData.get("senha") });
  if (!dados.success) return { erro: ERRO_GENERICO, usuario: usuarioDigitado };

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usuarioParaEmail(dados.data.usuario),
    password: dados.data.senha,
  });
  if (error) {
    if (error.status === 429) return { erro: "Muitas tentativas. Aguarde um minuto e tente de novo.", usuario: usuarioDigitado };
    if (error.status !== 400) logger.error({ code: error.code, status: error.status }, "Falha no login");
    return { erro: ERRO_GENERICO, usuario: usuarioDigitado };
  }

  // Login sem perfil ativo (desativado ou sem cadastro) não entra.
  const funcionario = await buscarFuncionarioAtivo(data.user.id);
  if (!funcionario) {
    await supabase.auth.signOut({ scope: "local" });
    return { erro: ERRO_GENERICO, usuario: usuarioDigitado };
  }
  redirect(paginaInicial(funcionario));
}

// "local" encerra só este aparelho; os outros caixas do mesmo funcionário seguem logados.
export async function sair() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/entrar");
}
