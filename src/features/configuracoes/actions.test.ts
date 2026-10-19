import { beforeEach, describe, expect, it, vi } from "vitest";

const exigirDono = vi.fn();
const transaction = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/features/auth/sessao", () => ({ exigirDono }));
vi.mock("@/db", () => ({ getDb: () => ({ transaction }) }));
vi.mock("next/cache", () => ({ revalidatePath }));

const { criarBandeira, editarBandeira, salvarNomeLoja } = await import("./actions");

function formulario(campos: Record<string, string>) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) dados.set(campo, valor);
  return dados;
}

const id = "6f1c1b7e-8a5b-4b8e-9a52-0c9a8f6c2d11";
const envios = [
  ["salvarNomeLoja", () => salvarNomeLoja({}, formulario({ nomeLoja: "Loja" }))],
  ["criarBandeira", () => criarBandeira({}, formulario({ nome: "Elo", tipo: "debito" }))],
  ["editarBandeira", () => editarBandeira({}, formulario({ id, nome: "Elo", ativo: "on" }))],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  exigirDono.mockResolvedValue({ id: "dono-1" });
});

describe("ações de configurações", () => {
  it.each(envios)("%s recusa quem não é dono antes de tocar no banco", async (_nome, enviar) => {
    exigirDono.mockRejectedValue(new Error("redirect:/caixa"));
    await expect(enviar()).rejects.toThrow("redirect:/caixa");
    expect(transaction).not.toHaveBeenCalled();
  });

  it("devolve o erro junto do campo sem gravar quando o nome é inválido", async () => {
    const estado = await salvarNomeLoja({ envio: 2 }, formulario({ nomeLoja: "  " }));
    expect(estado).toEqual({ campos: { nomeLoja: "Informe o nome da loja." }, envio: 3 });
    expect(transaction).not.toHaveBeenCalled();
  });

  it("traduz bandeira repetida no mesmo tipo em mensagem amigável", async () => {
    transaction.mockRejectedValue({ cause: { code: "23505" } });
    const estado = await criarBandeira({}, formulario({ nome: "visa", tipo: "credito" }));
    expect(estado.campos).toEqual({ nome: "Já existe uma bandeira com esse nome nesse tipo." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("avisa quando a bandeira editada não existe mais", async () => {
    transaction.mockResolvedValue("nao_encontrada");
    const estado = await editarBandeira({}, formulario({ id, nome: "Elo" }));
    expect(estado.erro).toBe("Bandeira não encontrada. Recarregue a página.");
  });

  it("avisa que a bandeira desativada sai do pagamento", async () => {
    transaction.mockResolvedValue("ok");
    const estado = await editarBandeira({}, formulario({ id, nome: "Elo" }));
    expect(estado.ok).toMatch(/não aparece mais no pagamento/);
    expect(revalidatePath).toHaveBeenCalledWith("/configuracoes");
  });
});
