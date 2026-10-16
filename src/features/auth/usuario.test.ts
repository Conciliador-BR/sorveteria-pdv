import { describe, expect, it } from "vitest";
import { loginSchema, usuarioParaEmail } from "./usuario";

describe("usuarioParaEmail", () => {
  it("normaliza o usuário e monta o e-mail técnico", () => {
    expect(usuarioParaEmail("  Joana.Silva ")).toBe("joana.silva@sorveteria.local");
  });

  it("recusa usuário com caracteres que mudariam o e-mail", () => {
    expect(() => usuarioParaEmail("joana@outro.com")).toThrow();
    expect(() => usuarioParaEmail("jo")).toThrow();
  });
});

describe("loginSchema", () => {
  it("exige senha com pelo menos 6 caracteres", () => {
    expect(loginSchema.safeParse({ usuario: "joana", senha: "12345" }).success).toBe(false);
    expect(loginSchema.safeParse({ usuario: "joana", senha: "123456" }).success).toBe(true);
  });
});
