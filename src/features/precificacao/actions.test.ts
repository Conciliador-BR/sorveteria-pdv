import { beforeEach, describe, expect, it, vi } from "vitest";

const exigirDono = vi.fn();
const getDb = vi.fn();
const revalidatePath = vi.fn();
const buscarParametros = vi.fn();
const custosMensais = vi.fn();
const listarItensFicha = vi.fn();

vi.mock("@/features/auth/sessao", () => ({ exigirDono }));
vi.mock("@/db", () => ({ getDb }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("./queries", () => ({ buscarParametros, custosMensais, listarItensFicha }));

const acoes = await import("./actions");
const acoesFicha = await import("./actions-ficha");

function formulario(campos: Record<string, string>) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) dados.set(campo, valor);
  return dados;
}

const id = "6f1c1b7e-8a5b-4b8e-9a52-0c9a8f6c2d11";
const produtoId = "7a2d2c8f-9b6c-4c9f-8b63-1d0b9a7d3e22";
const envios = [
  ["salvarInsumo", () => acoes.salvarInsumo({}, formulario({ nome: "Leite", unidade: "ml", embalagemQuantidade: "1000", embalagemPrecoCentavos: "5,00" }))],
  ["excluirInsumo", () => acoes.excluirInsumo({}, formulario({ id }))],
  ["salvarCustoFixo", () => acoes.salvarCustoFixo({}, formulario({ nome: "Aluguel", valorMensalCentavos: "3500,00" }))],
  ["excluirCustoFixo", () => acoes.excluirCustoFixo({}, formulario({ id }))],
  ["salvarMaquina", () => acoes.salvarMaquina({}, formulario({ nome: "Freezer", valorCompraCentavos: "3000,00", vidaUtilAnos: "5" }))],
  ["excluirMaquina", () => acoes.excluirMaquina({}, formulario({ id }))],
  ["salvarParametros", () => acoes.salvarParametros({}, formulario({ impostoPercentual: "6", taxaCartaoPercentual: "2", parteCartaoPercentual: "50", perdasPercentual: "0", margemPadraoPercentual: "30" }))],
  ["salvarItemFicha", () => acoesFicha.salvarItemFicha({}, formulario({ produtoId, insumoId: id, quantidade: "100" }))],
  ["removerItemFicha", () => acoesFicha.removerItemFicha({}, formulario({ id }))],
  ["salvarProdutoPrecificacao", () => acoesFicha.salvarProdutoPrecificacao({}, formulario({ produtoId, rendimento: "1", margemPercentual: "", aplicar: "sim", precoCentavos: "460" }))],
] as const;

// Consulta do tipo de venda do produto: select().from().where().limit().
function produtoNoBanco(tipoVenda: "unidade" | "peso" | null) {
  const consulta = { from: () => consulta, where: () => consulta, limit: async () => (tipoVenda ? [{ tipoVenda }] : []) };
  getDb.mockReturnValue({ select: () => consulta, transaction: vi.fn() });
}

beforeEach(() => {
  vi.clearAllMocks();
  exigirDono.mockResolvedValue({ id: "dono-1" });
  buscarParametros.mockResolvedValue({
    faturamentoMensalCentavos: 5_000_000,
    impostoPercentual: 600,
    taxaCartaoPercentual: 200,
    parteCartaoPercentual: 5000,
    perdasPercentual: 0,
    margemPadraoPercentual: 3000,
  });
  custosMensais.mockResolvedValue({ total: 650_000 });
  listarItensFicha.mockResolvedValue([
    { produtoId, quantidade: 100, embalagemQuantidade: 1000, embalagemPrecoCentavos: 2000 },
    { produtoId, quantidade: 1, embalagemQuantidade: 100, embalagemPrecoCentavos: 3000 },
  ]);
});

describe("ações da precificação", () => {
  it.each(envios)("%s recusa quem não é dono antes de tocar no banco", async (_nome, enviar) => {
    exigirDono.mockRejectedValue(new Error("redirect:/caixa"));
    await expect(enviar()).rejects.toThrow("redirect:/caixa");
    expect(getDb).not.toHaveBeenCalled();
  });

  it("devolve o erro junto do campo quando o valor residual passa do valor de compra", async () => {
    const estado = await acoes.salvarMaquina({}, formulario({ nome: "Freezer", valorCompraCentavos: "1000,00", valorResidualCentavos: "2000,00", vidaUtilAnos: "5" }));
    expect(estado.campos).toEqual({ valorResidualCentavos: "O valor no fim não pode passar do valor de compra." });
    expect(getDb).not.toHaveBeenCalled();
  });

  it("não troca o preço do caixa quando o sugerido mudou desde que a tela abriu", async () => {
    produtoNoBanco("unidade");
    const estado = await acoesFicha.salvarProdutoPrecificacao({}, formulario({ produtoId, rendimento: "1", margemPercentual: "", aplicar: "sim", precoCentavos: "450" }));
    expect(estado.erro).toBe("Os custos mudaram e o preço sugerido agora é R$ 4,60. Confira e aplique de novo.");
    expect(getDb().transaction).not.toHaveBeenCalled();
  });

  it("recusa preço sugerido acima do teto do cadastro", async () => {
    produtoNoBanco("unidade");
    listarItensFicha.mockResolvedValue([{ produtoId, quantidade: 1, embalagemQuantidade: 1, embalagemPrecoCentavos: 90_000_00 }]);
    const estado = await acoesFicha.salvarProdutoPrecificacao({}, formulario({ produtoId, rendimento: "1", margemPercentual: "", aplicar: "sim", precoCentavos: "999" }));
    expect(estado.erro).toMatch(/passa de R\$ 100\.000,00/);
  });
});
