import { describe, expect, it } from "vitest";
import { itensDoMenu, rotuloDoPapel } from "./menu";
import type { PerfilAcesso } from "./permissoes";

const funcionario: PerfilAcesso = {
  papel: "funcionario",
  ativo: true,
  podeLancarEstoque: false,
  podeGerenciarProdutos: false,
  podeCancelarVenda: false,
  podeVerHistorico: false,
};

const rotulos = (perfil: PerfilAcesso) => itensDoMenu(perfil).map((item) => item.rotulo);

describe("itensDoMenu", () => {
  it("mostra só o básico ao funcionário sem permissões extras, com as próprias vendas", () => {
    expect(rotulos(funcionario)).toEqual(["Caixa", "Vender", "Comandas", "Histórico"]);
  });

  it("acrescenta cada item conforme a permissão ligada", () => {
    expect(rotulos({ ...funcionario, podeLancarEstoque: true })).toContain("Estoque");
    expect(rotulos({ ...funcionario, podeGerenciarProdutos: true })).toContain("Produtos");
  });

  it("não mostra itens do dono a funcionário com todas as permissões", () => {
    const completo = {
      ...funcionario,
      podeLancarEstoque: true,
      podeGerenciarProdutos: true,
      podeCancelarVenda: true,
      podeVerHistorico: true,
    };
    expect(rotulos(completo)).toEqual(["Caixa", "Vender", "Comandas", "Estoque", "Produtos", "Histórico"]);
  });

  it("mostra tudo ao dono, na ordem do menu", () => {
    expect(rotulos({ ...funcionario, papel: "dono" })).toEqual([
      "Caixa",
      "Vender",
      "Comandas",
      "Estoque",
      "Produtos",
      "Histórico",
      "Dashboard",
      "Funcionários",
      "Configurações",
    ]);
  });

  it("não mostra nada a quem está desativado", () => {
    expect(itensDoMenu({ ...funcionario, papel: "dono", ativo: false })).toEqual([]);
  });

  it("aponta o histórico para /vendas e não vaza a regra interna", () => {
    const [historico] = itensDoMenu({ ...funcionario, podeVerHistorico: true }).filter((i) => i.icone === "historico");
    expect(historico).toEqual({ href: "/vendas", rotulo: "Histórico", icone: "historico" });
  });
});

describe("rotuloDoPapel", () => {
  it("traduz o papel para a interface", () => {
    expect(rotuloDoPapel({ papel: "dono" })).toBe("Dono");
    expect(rotuloDoPapel({ papel: "funcionario" })).toBe("Funcionário");
  });
});
