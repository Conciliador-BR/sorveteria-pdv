import { describe, expect, it } from "vitest";
import { nomeDaLoja, NOME_PADRAO_LOJA, rotuloTipoBandeira } from "./regras";

describe("nomeDaLoja", () => {
  it("usa o nome salvo pelo dono", () => {
    expect(nomeDaLoja("Sorveteria do Morro")).toBe("Sorveteria do Morro");
  });

  it("volta ao nome do sistema sem nome salvo", () => {
    expect(nomeDaLoja(null)).toBe(NOME_PADRAO_LOJA);
    expect(nomeDaLoja(undefined)).toBe("Sorveteria PDV");
    expect(nomeDaLoja("   ")).toBe("Sorveteria PDV");
  });
});

describe("rotuloTipoBandeira", () => {
  it("traduz o tipo para a interface", () => {
    expect(rotuloTipoBandeira("debito")).toBe("Débito");
    expect(rotuloTipoBandeira("credito")).toBe("Crédito");
  });
});
