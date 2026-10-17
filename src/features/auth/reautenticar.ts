import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";
import { logger } from "@/lib/logger";
import { usuarioParaEmail } from "./usuario";

// Confere a senha do próprio funcionário (abertura e fechamento de caixa) sem mexer na sessão do navegador.
export async function senhaConfere(usuario: string, senha: string) {
  if (!senha) return false;
  const cliente = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data, error } = await cliente.auth.signInWithPassword({ email: usuarioParaEmail(usuario), password: senha });
  if (error) {
    if (error.status !== 400) logger.error({ code: error.code, status: error.status }, "Falha ao conferir senha");
    return false;
  }
  // Encerra só a sessão temporária criada para a conferência.
  if (data.session) await cliente.auth.admin.signOut(data.session.access_token, "local").catch(() => undefined);
  return true;
}
