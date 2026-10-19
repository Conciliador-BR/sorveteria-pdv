// O Drizzle 0.45 embrulha o erro do Postgres em DrizzleQueryError; o código fica em `cause.code`.
export function codigoPostgres(erro: unknown) {
  const { code, cause } = (erro ?? {}) as { code?: string; cause?: { code?: string } };
  return cause?.code ?? code;
}

export const violouUnico = (erro: unknown) => codigoPostgres(erro) === "23505";
export const violouReferencia = (erro: unknown) => codigoPostgres(erro) === "23503";
