import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const buscarFuncionarioAtivo = vi.fn();
const apagarCookie = vi.fn();

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: async () => ({ auth: { signInWithPassword, signOut } }),
}));
vi.mock("./sessao", () => ({ buscarFuncionarioAtivo }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [{ name: "sb-x-auth-token" }, { name: "outro" }], delete: apagarCookie }),
}));
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => {
    throw new Error(`redirect:${destino}`);
  },
}));

const { entrar, sair } = await import("./actions");

function formulario(usuario: string, senha: string) {
  const dados = new FormData();
  dados.set("usuario", usuario);
  dados.set("senha", senha);
  return dados;
}

beforeEach(() => {
  vi.clearAllMocks();
  signInWithPassword.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  signOut.mockResolvedValue({ error: null });
  buscarFuncionarioAtivo.mockResolvedValue({ id: "u1", papel: "funcionario", ativo: true });
});

describe("entrar", () => {
  it("usa o e-mail técnico e leva o funcionário ao caixa", async () => {
    await expect(entrar({}, formulario("Joana", "123456"))).rejects.toThrow("redirect:/caixa");
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "joana@sorveteria.local", password: "123456" });
  });

  it("recusa senha errada com a mensagem genérica", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { status: 400, code: "invalid_credentials" } });
    const estado = await entrar({}, formulario("joana", "errada1"));
    expect(estado).toMatchObject({ erro: "Usuário ou senha incorretos.", usuario: "joana", tentativa: 1 });
  });

  it("desfaz o login de funcionário desativado ou sem cadastro", async () => {
    buscarFuncionarioAtivo.mockResolvedValue(null);
    const estado = await entrar({ tentativa: 1 }, formulario("joana", "123456"));
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(estado).toMatchObject({ erro: "Usuário ou senha incorretos.", tentativa: 2 });
  });

  it("desfaz o login quando o banco falha", async () => {
    buscarFuncionarioAtivo.mockRejectedValue(new Error("banco fora"));
    const estado = await entrar({}, formulario("joana", "123456"));
    expect(signOut).toHaveBeenCalled();
    expect(estado.erro).toBe("Não foi possível entrar agora. Tente de novo.");
  });

  it("avisa quando o Supabase limita as tentativas", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { status: 429 } });
    const estado = await entrar({}, formulario("joana", "123456"));
    expect(estado.erro).toMatch(/Muitas tentativas/);
  });
});

describe("sair", () => {
  it("apaga os cookies de sessão quando o Supabase não responde", async () => {
    signOut.mockResolvedValue({ error: { status: 500 } });
    await expect(sair()).rejects.toThrow("redirect:/entrar");
    expect(apagarCookie).toHaveBeenCalledWith("sb-x-auth-token");
    expect(apagarCookie).not.toHaveBeenCalledWith("outro");
  });
});
