import { describe, expect, it } from "vitest";
import { barrasPorDia, barrasPorHora, escalaBarra, maiorValor } from "./graficos";

describe("escalaBarra", () => {
  it("proporcional ao maior valor", () => {
    expect(escalaBarra(500, 1000)).toBe(50);
    expect(escalaBarra(1000, 1000)).toBe(100);
  });

  it("valor pequeno continua visível e zero fica zero", () => {
    expect(escalaBarra(1, 100000)).toBe(2);
    expect(escalaBarra(0, 1000)).toBe(0);
    expect(escalaBarra(10, 0)).toBe(0);
  });
});

describe("maiorValor", () => {
  it("zero sem barras", () => {
    expect(maiorValor([])).toBe(0);
    expect(maiorValor([{ valorCentavos: 3 }, { valorCentavos: 9 }])).toBe(9);
  });
});

describe("barrasPorDia", () => {
  it("preenche os dias sem venda até hoje", () => {
    const barras = barrasPorDia([{ dia: "2026-10-15", valorCentavos: 900 }], "2026-10-17", 3);
    expect(barras).toEqual([
      { chave: "2026-10-15", rotulo: "15/10", valorCentavos: 900 },
      { chave: "2026-10-16", rotulo: "16/10", valorCentavos: 0 },
      { chave: "2026-10-17", rotulo: "17/10", valorCentavos: 0 },
    ]);
  });

  it("atravessa a virada do mês e inclui dia mais antigo vindo da consulta", () => {
    const barras = barrasPorDia([{ dia: "2026-09-29", valorCentavos: 100 }], "2026-10-01", 2);
    expect(barras.map((barra) => barra.chave)).toEqual(["2026-09-29", "2026-09-30", "2026-10-01"]);
  });
});

describe("barrasPorHora", () => {
  it("vazio sem vendas", () => {
    expect(barrasPorHora([])).toEqual([]);
  });

  it("preenche horas vazias entre a primeira e a última", () => {
    const barras = barrasPorHora([{ hora: 9, valorCentavos: 100 }, { hora: 11, valorCentavos: 300 }]);
    expect(barras.map((barra) => [barra.rotulo, barra.valorCentavos])).toEqual([["09h", 100], ["10h", 0], ["11h", 300]]);
  });
});
