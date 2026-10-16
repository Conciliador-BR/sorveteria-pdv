import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const linhas = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: async () => ({ auth: { getClaims } }),
}));
vi.mock("@/db", () => ({
  getDb: () => ({ select: () => ({ from: () => ({ where: () => ({ limit: linhas }) }) }) }),
}));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    throw new Error(`redirect:${destino}`);
  },
}));

const { exigirDono, exigirFuncionario, exigirPermissao } = await import("./sessao");

const funcionario = {
  id: "u1",
  nome: "Joana",
  usuario: "joana",
  papel: "funcionario" as const,
  ativo: true,
  podeLancarEstoque: false,
  podeGerenciarProdutos: false,
  podeCancelarVenda: false,
  podeVerHistorico: false,
};

beforeEach(() => {
  getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
  linhas.mockResolvedValue([funcionario]);
});

describe("exigirFuncionario", () => {
  it("manda para /entrar sem sessão", async () => {
    getClaims.mockResolvedValue({ data: null });
    await expect(exigirFuncionario()).rejects.toThrow("redirect:/entrar");
  });

  it("manda para /entrar quando o login não tem cadastro", async () => {
    linhas.mockResolvedValue([]);
    await expect(exigirFuncionario()).rejects.toThrow("redirect:/entrar");
  });

  it("manda para /entrar quando o funcionário está desativado", async () => {
    linhas.mockResolvedValue([{ ...funcionario, ativo: false }]);
    await expect(exigirFuncionario()).rejects.toThrow("redirect:/entrar");
  });

  it("devolve o perfil do funcionário ativo", async () => {
    await expect(exigirFuncionario()).resolves.toMatchObject({ id: "u1", nome: "Joana" });
  });
});

describe("exigirPermissao e exigirDono", () => {
  it("manda para /caixa quem não tem a permissão", async () => {
    await expect(exigirPermissao("pode_lancar_estoque")).rejects.toThrow("redirect:/caixa");
  });

  it("libera quem tem a permissão ligada", async () => {
    linhas.mockResolvedValue([{ ...funcionario, podeLancarEstoque: true }]);
    await expect(exigirPermissao("pode_lancar_estoque")).resolves.toMatchObject({ id: "u1" });
  });

  it("manda para /caixa o funcionário que tenta a área do dono", async () => {
    await expect(exigirDono()).rejects.toThrow("redirect:/caixa");
  });
});
