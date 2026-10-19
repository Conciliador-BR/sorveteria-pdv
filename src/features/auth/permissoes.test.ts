import { describe, expect, it } from "vitest";
import { ehDono, paginaInicial, temPermissao, type PerfilAcesso } from "./permissoes";

const funcionario: PerfilAcesso = {
  papel: "funcionario",
  ativo: true,
  podeLancarEstoque: false,
  podeGerenciarProdutos: false,
  podeCancelarVenda: false,
  podeVerHistorico: false,
};

describe("temPermissao", () => {
  it("nega permissão extra que o dono não ligou", () => {
    expect(temPermissao(funcionario, "pode_lancar_estoque")).toBe(false);
  });

  it("concede só a permissão ligada", () => {
    const comEstoque = { ...funcionario, podeLancarEstoque: true };
    expect(temPermissao(comEstoque, "pode_lancar_estoque")).toBe(true);
    expect(temPermissao(comEstoque, "pode_cancelar_venda")).toBe(false);
  });

  it("dá tudo ao dono ativo", () => {
    expect(temPermissao({ ...funcionario, papel: "dono" }, "pode_ver_historico")).toBe(true);
  });

  it("nega tudo a quem está desativado, inclusive o dono", () => {
    const donoInativo = { ...funcionario, papel: "dono" as const, ativo: false };
    expect(temPermissao(donoInativo, "pode_ver_historico")).toBe(false);
    expect(ehDono(donoInativo)).toBe(false);
  });
});

describe("paginaInicial", () => {
  it("leva o dono ao dashboard e o funcionário ao caixa", () => {
    expect(paginaInicial({ ...funcionario, papel: "dono" })).toBe("/dashboard");
    expect(paginaInicial(funcionario)).toBe("/caixa");
  });
});
