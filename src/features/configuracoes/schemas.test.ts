import { describe, expect, it } from "vitest";
import { errosPorCampo } from "@/lib/formulario";
import { editarBandeiraSchema, nomeLojaSchema, novaBandeiraSchema } from "./schemas";

const erros = (resultado: { success: boolean; error?: Parameters<typeof errosPorCampo>[0] }) =>
  resultado.success || !resultado.error ? {} : errosPorCampo(resultado.error);

describe("nomeLojaSchema", () => {
  it("tira os espaços das pontas", () => {
    expect(nomeLojaSchema.parse({ nomeLoja: "  Sorveteria do Morro  " })).toEqual({ nomeLoja: "Sorveteria do Morro" });
  });

  it("recusa nome vazio ou só com espaços", () => {
    expect(erros(nomeLojaSchema.safeParse({ nomeLoja: "   " }))).toEqual({ nomeLoja: "Informe o nome da loja." });
    expect(erros(nomeLojaSchema.safeParse({}))).toEqual({ nomeLoja: "Informe o nome da loja." });
  });

  it("aceita 60 caracteres e recusa 61", () => {
    expect(nomeLojaSchema.safeParse({ nomeLoja: "a".repeat(60) }).success).toBe(true);
    expect(erros(nomeLojaSchema.safeParse({ nomeLoja: "a".repeat(61) }))).toEqual({ nomeLoja: "Use até 60 caracteres." });
  });
});

describe("novaBandeiraSchema", () => {
  it("aceita nome e tipo do formulário", () => {
    expect(novaBandeiraSchema.parse({ nome: " Sorocred ", tipo: "credito" })).toEqual({ nome: "Sorocred", tipo: "credito" });
  });

  it("aponta nome curto e tipo fora de débito/crédito", () => {
    expect(Object.keys(erros(novaBandeiraSchema.safeParse({ nome: "V", tipo: "pix" }))).sort()).toEqual(["nome", "tipo"]);
  });
});

describe("editarBandeiraSchema", () => {
  const id = "6f1c1b7e-8a5b-4b8e-9a52-0c9a8f6c2d11";

  it("trata a caixa Ativa desmarcada (ausente) como desativada", () => {
    expect(editarBandeiraSchema.parse({ id, nome: "Elo" })).toEqual({ id, nome: "Elo", ativo: false });
    expect(editarBandeiraSchema.parse({ id, nome: "Elo", ativo: "on" }).ativo).toBe(true);
  });

  it("ignora tentativa de trocar o tipo na edição", () => {
    expect(editarBandeiraSchema.parse({ id, nome: "Elo", tipo: "debito", ativo: "on" })).not.toHaveProperty("tipo");
  });

  it("recusa id que não é UUID", () => {
    expect(erros(editarBandeiraSchema.safeParse({ id: "1", nome: "Elo" }))).toHaveProperty("id");
  });
});
