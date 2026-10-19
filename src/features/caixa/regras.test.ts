import { describe, expect, it } from "vitest";
import { conferir, dinheiroEsperado, observacaoObrigatoria, resumirPagamentos } from "./regras";

describe("dinheiroEsperado", () => {
  it("fundo de R$ 300 + R$ 400 vendidos em dinheiro = R$ 700 (critério de aceite)", () => {
    expect(dinheiroEsperado({ fundoCentavos: 30000, vendasDinheiroCentavos: 40000, suprimentosCentavos: 0, sangriasCentavos: 0 })).toBe(70000);
  });

  it("soma suprimentos e desconta sangrias", () => {
    expect(dinheiroEsperado({ fundoCentavos: 10000, vendasDinheiroCentavos: 5000, suprimentosCentavos: 2000, sangriasCentavos: 8000 })).toBe(9000);
  });
});

describe("conferir", () => {
  it("contando R$ 695 com R$ 700 esperados mostra falta de R$ 5 e exige observação (critério de aceite)", () => {
    const resultado = conferir(70000, 69500);
    expect(resultado).toEqual({ diferencaCentavos: -500, situacao: "falta" });
    expect(observacaoObrigatoria(resultado.diferencaCentavos)).toBe(true);
  });

  it("reconhece caixa certo e sobra", () => {
    expect(conferir(70000, 70000).situacao).toBe("certo");
    expect(observacaoObrigatoria(0)).toBe(false);
    expect(conferir(70000, 70100).situacao).toBe("sobra");
  });
});

describe("resumirPagamentos", () => {
  it("totaliza por forma e por bandeira", () => {
    const resumo = resumirPagamentos([
      { forma: "dinheiro", bandeira: null, valorCentavos: 2580 },
      { forma: "debito", bandeira: "Visa", valorCentavos: 5000 },
      { forma: "debito", bandeira: "Visa", valorCentavos: 1000 },
      { forma: "credito", bandeira: "Elo", valorCentavos: 3000 },
      { forma: "pix", bandeira: null, valorCentavos: 1500 },
    ]);
    expect(resumo.porForma).toEqual({ dinheiro: 2580, pix: 1500, debito: 6000, credito: 3000 });
    expect(resumo.porBandeira).toEqual([
      { nome: "Débito Visa", valorCentavos: 6000 },
      { nome: "Crédito Elo", valorCentavos: 3000 },
    ]);
    expect(resumo.total).toBe(13080);
  });
});
