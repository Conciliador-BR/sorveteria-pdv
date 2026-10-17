import { expect, it } from "vitest";
import { codigoPostgres, violouUnico } from "./erros";

it("lê o código do Postgres dentro do erro do Drizzle ou direto", () => {
  expect(codigoPostgres({ message: "Failed query", cause: { code: "23505" } })).toBe("23505");
  expect(codigoPostgres({ code: "23503" })).toBe("23503");
  expect(codigoPostgres(null)).toBeUndefined();
  expect(violouUnico({ cause: { code: "23505" } })).toBe(true);
});
