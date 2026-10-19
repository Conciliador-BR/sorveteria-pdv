// Decide o que pular: confere só se as variáveis existem, nunca lê nem mostra os valores.

// Usadas por /entrar e pela área logada para ler a sessão (Supabase Auth no servidor).
export const VARIAVEIS_AUTH = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"] as const;
// Fluxos com login: sessão, perfil do funcionário e dados no banco de desenvolvimento.
export const VARIAVEIS_BANCO = ["DATABASE_URL", ...VARIAVEIS_AUTH] as const;

function faltando(nomes: readonly string[]) {
  return nomes.filter((nome) => !process.env[nome]);
}

/** Motivo do pulo quando falta alguma variável; `undefined` quando todas existem. */
export function motivoParaPular(nomes: readonly string[]) {
  const ausentes = faltando(nomes);
  if (ausentes.length === 0) return undefined;
  return `Faltam variáveis de ambiente: ${ausentes.join(", ")}. Veja "Testes E2E" em docs/quality.md.`;
}

/** Credencial vinda do ambiente; só chame depois de conferir com `motivoParaPular`. */
export function credencial(prefixo: "E2E_DONO" | "E2E_FUNCIONARIO") {
  return { usuario: process.env[`${prefixo}_USUARIO`] ?? "", senha: process.env[`${prefixo}_SENHA`] ?? "" };
}
