import { describe, expect, it } from "vitest";
import { aliquotaSimples, impostoDaLoja, type ParametrosImposto } from "./imposto";
import { despesasSobreVenda } from "./regras";

const base: ParametrosImposto = {
  regime: "percentual",
  impostoPercentual: 600,
  anexoSimples: "I",
  receita12MesesCentavos: null,
  dasMensalCentavos: null,
  faturamentoMensalCentavos: 5_000_000,
};

describe("Simples Nacional", () => {
  it("na primeira faixa a alíquota efetiva é a nominal", () => {
    expect(aliquotaSimples("I", 10_000_000)).toMatchObject({ faixa: 1, efetiva: 400 });
    expect(aliquotaSimples("II", 10_000_000)).toMatchObject({ faixa: 1, efetiva: 450 });
  });

  it("desconta a parcela a deduzir nas faixas seguintes", () => {
    // R$ 300.000 no Anexo I: (300.000 × 7,3% − 5.940) ÷ 300.000 = 5,32%.
    expect(aliquotaSimples("I", 30_000_000)).toMatchObject({ faixa: 2, nominal: 730 });
    expect(aliquotaSimples("I", 30_000_000).efetiva).toBeCloseTo(532);
    // Mesmo valor no Anexo II (indústria): (300.000 × 7,8% − 5.940) ÷ 300.000 = 5,82%.
    expect(aliquotaSimples("II", 30_000_000).efetiva).toBeCloseTo(582);
    // R$ 1.000.000 no Anexo I: (1.000.000 × 10,7% − 22.500) ÷ 1.000.000 = 8,45%.
    expect(aliquotaSimples("I", 100_000_000)).toMatchObject({ faixa: 4 });
    expect(aliquotaSimples("I", 100_000_000).efetiva).toBeCloseTo(845);
  });

  it("o limite exato da faixa ainda é dela", () => {
    expect(aliquotaSimples("I", 18_000_000).faixa).toBe(1);
    expect(aliquotaSimples("I", 18_000_001).faixa).toBe(2);
  });

  it("acima de R$ 4,8 milhões avisa que passou do limite", () => {
    expect(aliquotaSimples("I", 500_000_000)).toMatchObject({ faixa: 6, acimaDoLimite: true });
  });
});

describe("imposto da loja", () => {
  it("percentual digitado vale como está", () => {
    expect(impostoDaLoja(base)).toEqual({ percentual: 600, fixoMensalCentavos: 0, simples: null });
  });

  it("Simples sem receita de 12 meses estima pelo faturamento do mês × 12", () => {
    // R$ 50.000 × 12 = R$ 600.000 no Anexo I: (600.000 × 9,5% − 13.860) ÷ 600.000 = 7,19%.
    expect(impostoDaLoja({ ...base, regime: "simples" }).percentual).toBeCloseTo(719);
    expect(impostoDaLoja({ ...base, regime: "simples", receita12MesesCentavos: 30_000_000 }).percentual).toBeCloseTo(532);
  });

  it("MEI não cobra percentual: o DAS entra nos custos fixos do mês", () => {
    const parametros = { ...base, regime: "mei" as const, dasMensalCentavos: 8_000, taxaCartaoPercentual: 0, parteCartaoPercentual: 0, perdasPercentual: 0 };
    const despesas = despesasSobreVenda(parametros, 642_000);
    expect(despesas.imposto).toBe(0);
    // (R$ 6.420 + R$ 80 de DAS) ÷ R$ 50.000 = 13%.
    expect(despesas.fixo).toBe(1300);
  });
});
