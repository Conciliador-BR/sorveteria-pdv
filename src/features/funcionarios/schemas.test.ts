import { describe, expect, it } from "vitest";
import { errosPorCampo } from "@/lib/formulario";
import { criarFuncionarioSchema, editarFuncionarioSchema } from "./schemas";

describe("criarFuncionarioSchema", () => {
  it("normaliza o usuário e lê as caixas marcadas do formulário", () => {
    const dados = criarFuncionarioSchema.parse({ nome: " Joana ", usuario: "Joana.S", senha: "123456", podeLancarEstoque: "on" });
    expect(dados).toMatchObject({ nome: "Joana", usuario: "joana.s", papel: "funcionario", podeLancarEstoque: true, podeVerHistorico: false });
  });

  it("aponta o campo com problema", () => {
    const resultado = criarFuncionarioSchema.safeParse({ nome: "J", usuario: "jo", senha: "1" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) expect(Object.keys(errosPorCampo(resultado.error)).sort()).toEqual(["nome", "senha", "usuario"]);
  });
});

describe("editarFuncionarioSchema", () => {
  it("trata caixa desmarcada (ausente) como falso", () => {
    const dados = editarFuncionarioSchema.parse({ id: "6f1c1b7e-8a5b-4b8e-9a52-0c9a8f6c2d11", nome: "Joana", papel: "funcionario" });
    expect(dados.ativo).toBe(false);
  });
});
