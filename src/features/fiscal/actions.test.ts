import { beforeEach, describe, expect, it, vi } from "vitest";

const exigirFuncionario = vi.fn();
const buscarVendaPorId = vi.fn();
const emitirNfce = vi.fn();

vi.mock("@/features/auth/sessao", () => ({ exigirFuncionario }));
vi.mock("@/features/historico/queries", () => ({ buscarVendaPorId }));
vi.mock("./emissao", () => ({ emitirNfce }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { emitirNotaDaVenda } = await import("./actions");

const vendaId = "6f1c1b7e-8a5b-4b8e-9a52-0c9a8f6c2d11";
const funcionario = { id: "func-1", papel: "funcionario", ativo: true, podeVerHistorico: false };

function formulario(id: string) {
  const dados = new FormData();
  dados.set("vendaId", id);
  return dados;
}

beforeEach(() => {
  vi.clearAllMocks();
  exigirFuncionario.mockResolvedValue(funcionario);
  buscarVendaPorId.mockResolvedValue({ id: vendaId });
});

describe("emitirNotaDaVenda", () => {
  it("recusa sem sessão antes de emitir", async () => {
    exigirFuncionario.mockRejectedValue(new Error("redirect:/entrar"));
    await expect(emitirNotaDaVenda({}, formulario(vendaId))).rejects.toThrow("redirect:/entrar");
    expect(emitirNfce).not.toHaveBeenCalled();
  });

  it("recusa id inválido", async () => {
    expect(await emitirNotaDaVenda({}, formulario("abc"))).toEqual({ erro: "Venda inválida. Recarregue a página.", envio: 1 });
    expect(emitirNfce).not.toHaveBeenCalled();
  });

  it("sem permissão de histórico, só procura a venda do próprio funcionário", async () => {
    buscarVendaPorId.mockResolvedValue(null);
    expect(await emitirNotaDaVenda({}, formulario(vendaId))).toEqual({ erro: "Venda não encontrada.", envio: 1 });
    expect(buscarVendaPorId).toHaveBeenCalledWith(vendaId, "func-1");
    expect(emitirNfce).not.toHaveBeenCalled();
  });

  it("emite em nome de quem pediu e avisa quando a emissão está desligada", async () => {
    emitirNfce.mockResolvedValueOnce("emitida").mockResolvedValueOnce("desligada");
    expect(await emitirNotaDaVenda({}, formulario(vendaId))).toEqual({ ok: "NFC-e emitida.", envio: 1 });
    expect(emitirNfce).toHaveBeenCalledWith(vendaId, "func-1");
    expect((await emitirNotaDaVenda({}, formulario(vendaId))).erro).toBe("A emissão de NFC-e está desligada em Configurações.");
  });
});
