import { describe, expect, it } from "vitest";
import { alteracaoTrancaODono } from "./regras";

describe("alteracaoTrancaODono", () => {
  const base = { idEditado: "d1", idDono: "d1", novoPapel: "dono" as const, novoAtivo: true };

  it("impede o dono de virar funcionário ou se desativar", () => {
    expect(alteracaoTrancaODono({ ...base, novoPapel: "funcionario" })).toBe(true);
    expect(alteracaoTrancaODono({ ...base, novoAtivo: false })).toBe(true);
  });

  it("permite editar o próprio nome e permissões", () => {
    expect(alteracaoTrancaODono(base)).toBe(false);
  });

  it("permite desativar outro funcionário", () => {
    expect(alteracaoTrancaODono({ ...base, idEditado: "f2", novoPapel: "funcionario", novoAtivo: false })).toBe(false);
  });
});
