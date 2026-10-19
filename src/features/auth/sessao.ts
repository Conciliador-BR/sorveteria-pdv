import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { funcionarios } from "@/db/schema";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ehDono, temPermissao, type Permissao } from "./permissoes";

const colunasSessao = {
  id: funcionarios.id,
  nome: funcionarios.nome,
  usuario: funcionarios.usuario,
  papel: funcionarios.papel,
  ativo: funcionarios.ativo,
  podeLancarEstoque: funcionarios.podeLancarEstoque,
  podeGerenciarProdutos: funcionarios.podeGerenciarProdutos,
  podeCancelarVenda: funcionarios.podeCancelarVenda,
  podeVerHistorico: funcionarios.podeVerHistorico,
};

export async function buscarFuncionarioAtivo(id: string) {
  const [linha] = await getDb().select(colunasSessao).from(funcionarios).where(eq(funcionarios.id, id)).limit(1);
  return linha?.ativo ? linha : null;
}

// Identidade verificada pelo token (getClaims), perfil e permissões vindos do banco.
// `cache` evita repetir a consulta quando layout e página checam no mesmo request.
export const getFuncionarioAtual = cache(async () => {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;
  return buscarFuncionarioAtivo(id);
});

// Chame os `exigir*` na primeira linha da página ou Server Action, fora de try/catch:
// o redirect funciona lançando uma exceção, e um catch o engoliria.
export async function exigirFuncionario() {
  const funcionario = await getFuncionarioAtual();
  if (!funcionario) redirect("/entrar");
  return funcionario;
}

export async function exigirPermissao(permissao: Permissao) {
  const funcionario = await exigirFuncionario();
  if (!temPermissao(funcionario, permissao)) redirect("/caixa");
  return funcionario;
}

export async function exigirDono() {
  const funcionario = await exigirFuncionario();
  if (!ehDono(funcionario)) redirect("/caixa");
  return funcionario;
}
