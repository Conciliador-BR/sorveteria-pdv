import { describe, expect, it } from "vitest";
import { montarCsv, reaisCsv, textoSeguro, type VendaCsv } from "./csv";

const venda: VendaCsv = {
  numero: 42,
  tipo: "comanda",
  identificacao: "Mesa 3",
  status: "cancelada",
  totalCentavos: 2580,
  trocoCentavos: 420,
  abertaEm: new Date("2026-10-17T14:00:00Z"),
  concluidaEm: new Date("2026-10-17T15:05:00Z"),
  funcionario: "Joana",
  canceladaPor: "Dono",
  motivoCancelamento: "=1+1",
  formas: "dinheiro, credito",
};

describe("reaisCsv", () => {
  it("escreve reais com vírgula e dois decimais, sem símbolo", () => {
    expect(reaisCsv(2580)).toBe("25,80");
    expect(reaisCsv(5)).toBe("0,05");
    expect(reaisCsv(123456)).toBe("1234,56");
  });
});

describe("textoSeguro", () => {
  it("neutraliza fórmulas do Excel", () => {
    expect(textoSeguro("=HYPERLINK()")).toBe("'=HYPERLINK()");
    expect(textoSeguro("Joana")).toBe("Joana");
    expect(textoSeguro(null)).toBe("");
  });
});

describe("montarCsv", () => {
  it("começa com BOM, usa ; e data/hora de São Paulo", () => {
    const csv = montarCsv([venda]);
    expect(csv.startsWith("﻿\"Número\";")).toBe(true);
    const [, linha] = csv.slice(1).split("\r\n");
    expect(linha).toBe('"42";"17/10/2026";"12:05";"Joana";"Comanda Mesa 3";"Cancelada";"Dinheiro, Crédito";"25,80";"4,20";"Dono";"\'=1+1"');
  });

  it("usa a abertura quando a venda não foi concluída", () => {
    const csv = montarCsv([{ ...venda, status: "aberta", concluidaEm: null }]);
    expect(csv).toContain('"11:00"');
  });
});
