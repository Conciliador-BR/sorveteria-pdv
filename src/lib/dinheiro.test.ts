import { describe, expect, it } from "vitest";
import { digitosParaCentavos, formatarPeso, formatarReais, gramasPorValor, lerReais, totalPorPeso, troco } from "./dinheiro";

describe("dinheiro", () => {
  it("formata em reais", () => {
    expect(formatarReais(2580)).toBe("R$ 25,80");
    expect(formatarReais(123456)).toBe("R$ 1.234,56");
  });

  it("lê valores digitados", () => {
    expect(lerReais("25,80")).toBe(2580);
    expect(lerReais("R$ 1.234,5")).toBe(123450);
    expect(lerReais("1.234")).toBe(123400);
    expect(lerReais("25.80")).toBeNull();
    expect(lerReais("25.8")).toBeNull();
    expect(lerReais("30")).toBe(3000);
    expect(lerReais("abc")).toBeNull();
    expect(lerReais("")).toBeNull();
  });

  it("lê digitação contínua em centavos", () => {
    expect(digitosParaCentavos("2580")).toBe(2580);
    expect(digitosParaCentavos("")).toBe(0);
  });

  it("calcula troco da venda de R$ 25,80 paga com R$ 30,00 (critério de aceite)", () => {
    expect(troco(3000, 2580)).toBe(420);
    expect(troco(2000, 2580)).toBe(0);
  });

  it("calcula 350 g a R$ 59,90/kg = R$ 20,97 (critério de aceite)", () => {
    expect(totalPorPeso(5990, 350)).toBe(2097);
  });

  it("estima as gramas pelo valor da balança", () => {
    expect(gramasPorValor(5990, 2097)).toBe(350);
    expect(gramasPorValor(5990, 2000)).toBe(334);
    expect(gramasPorValor(5990, 1)).toBe(1);
  });

  it("arredonda meio centavo para cima", () => {
    expect(totalPorPeso(1001, 500)).toBe(501);
  });

  it("formata peso", () => {
    expect(formatarPeso(350)).toBe("350 g");
    expect(formatarPeso(1250)).toBe("1,25 kg");
  });
});
