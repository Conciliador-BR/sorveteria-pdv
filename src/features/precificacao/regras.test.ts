import { describe, expect, it } from "vitest";
import {
  analisarProduto,
  custoDeReferencia,
  custoDaFicha,
  depreciacaoMensal,
  despesasSobreVenda,
  formatarPercentual,
  lerPercentual,
  lucroDoPreco,
  markupPercentual,
  percentualParaCampo,
  precoSomandoNoCusto,
  precoSugerido,
} from "./regras";

// Exemplo de PRODUCT.md: casquinha com 100 g de base (balde de 1 kg a R$ 20,00) e 1 casquinha (caixa de 100 a R$ 30,00).
const fichaCasquinha = [
  { quantidade: 100, embalagemQuantidade: 1000, embalagemPrecoCentavos: 2000 },
  { quantidade: 1, embalagemQuantidade: 100, embalagemPrecoCentavos: 3000 },
];

const parametros = {
  faturamentoMensalCentavos: 5_000_000,
  impostoPercentual: 600,
  taxaCartaoPercentual: 200,
  parteCartaoPercentual: 5000,
  perdasPercentual: 0,
};

describe("percentual", () => {
  it("lê inteiro, vírgula e símbolo", () => {
    expect(lerPercentual("30")).toBe(3000);
    expect(lerPercentual("2,5")).toBe(250);
    expect(lerPercentual(" 12,75 % ")).toBe(1275);
    expect(lerPercentual("0")).toBe(0);
  });

  it("recusa vazio, negativo e texto", () => {
    expect(lerPercentual("")).toBeNull();
    expect(lerPercentual("-5")).toBeNull();
    expect(lerPercentual("trinta")).toBeNull();
    expect(lerPercentual("1,234")).toBeNull();
  });

  it("formata sem casas desnecessárias", () => {
    expect(formatarPercentual(3000)).toBe("30%");
    expect(formatarPercentual(250)).toBe("2,5%");
    expect(percentualParaCampo(1275)).toBe("12,75");
  });
});

describe("custo da ficha técnica", () => {
  it("soma os insumos proporcionalmente à embalagem", () => {
    expect(custoDaFicha(fichaCasquinha, 1, "unidade")).toBe(230);
  });

  it("divide a receita pelo rendimento em unidades", () => {
    // Receita de 24 picolés: 2 kg de base (R$ 40,00) + 24 palitos (caixa de 500 a R$ 25,00) = R$ 41,20.
    const receita = [
      { quantidade: 2000, embalagemQuantidade: 1000, embalagemPrecoCentavos: 2000 },
      { quantidade: 24, embalagemQuantidade: 500, embalagemPrecoCentavos: 2500 },
    ];
    expect(custoDaFicha(receita, 24, "unidade")).toBeCloseTo(4120 / 24);
  });

  it("produto por peso dá o custo do kg", () => {
    // 5 L de leite (R$ 5,00/L) + 1 kg de açúcar (R$ 4,50) rendem 6 kg de sorvete: R$ 29,50 ÷ 6 por kg.
    const receita = [
      { quantidade: 5000, embalagemQuantidade: 1000, embalagemPrecoCentavos: 500 },
      { quantidade: 1000, embalagemQuantidade: 1000, embalagemPrecoCentavos: 450 },
    ];
    expect(custoDaFicha(receita, 6000, "peso")).toBeCloseTo(2950 / 6);
  });

  it("sem itens ou sem rendimento não tem custo", () => {
    expect(custoDaFicha([], 1, "unidade")).toBeNull();
    expect(custoDaFicha(fichaCasquinha, 0, "unidade")).toBeNull();
  });
});

describe("custos fixos e despesas", () => {
  it("deprecia a máquina pelo valor que ela perde por mês", () => {
    expect(depreciacaoMensal({ valorCompraCentavos: 3_000_000, valorResidualCentavos: 0, vidaUtilMeses: 60 })).toBe(50_000);
    expect(depreciacaoMensal({ valorCompraCentavos: 1_200_000, valorResidualCentavos: 200_000, vidaUtilMeses: 48 })).toBe(20_833);
  });

  it("rateia os fixos pelo faturamento e aplica a taxa só na parte em cartão", () => {
    // R$ 6.000 de fixos + R$ 500 de depreciação sobre R$ 50.000 de faturamento = 13%.
    const despesas = despesasSobreVenda(parametros, 650_000);
    expect(despesas.fixo).toBe(1300);
    expect(despesas.cartao).toBe(100);
    expect(despesas.total).toBe(2000);
  });

  it("sem faturamento informado, não rateia os fixos", () => {
    expect(despesasSobreVenda({ ...parametros, faturamentoMensalCentavos: null }, 650_000).fixo).toBe(0);
  });
});

describe("preço sugerido", () => {
  it("custo R$ 2,30, despesas 20% e margem 30% dão R$ 4,60", () => {
    expect(precoSugerido(230, 2000, 3000)).toBe(460);
  });

  it("o preço sugerido entrega a margem pedida", () => {
    expect(lucroDoPreco(460, 230, 2000)).toEqual({ lucroCentavos: 138, margemPercentual: 3000 });
  });

  it("arredonda para cima ao centavo", () => {
    // 100 ÷ 0,7 = 142,86 → R$ 1,43.
    expect(precoSugerido(100, 0, 3000)).toBe(143);
    expect(precoSugerido(100, 0, 5000)).toBe(200);
  });

  it("despesas mais margem de 100% ou mais não têm preço possível", () => {
    expect(precoSugerido(230, 2000, 8000)).toBeNull();
    expect(precoSugerido(230, 6000, 5000)).toBeNull();
  });

  it("mostra o markup equivalente e o erro de somar a margem no custo", () => {
    expect(markupPercentual(460, 230)).toBe(10_000);
    expect(precoSomandoNoCusto(230, 3000)).toBe(299);
    // Somando 30% no custo, sobra só cerca de 3% de lucro depois das despesas.
    expect(lucroDoPreco(299, 230, 2000)).toEqual({ lucroCentavos: 9, margemPercentual: 308 });
  });

  it("preço atual abaixo do custo dá prejuízo", () => {
    expect(lucroDoPreco(200, 230, 2000).lucroCentavos).toBe(-70);
  });
});

describe("análise do produto", () => {
  it("junta ficha, despesas e margem no preço sugerido", () => {
    const analise = analisarProduto({ tipoVenda: "unidade", rendimento: 1, margemPercentual: 3000, itens: fichaCasquinha }, parametros, 650_000);
    expect(analise.custo).toBe(230);
    expect(analise.despesas.total).toBe(2000);
    expect(analise.preco).toBe(460);
  });

  it("sem ficha não sugere preço", () => {
    expect(analisarProduto({ tipoVenda: "unidade", rendimento: 1, margemPercentual: 3000, itens: [] }, parametros, 0).preco).toBeNull();
  });
});

describe("custo de referência do insumo", () => {
  it("mostra por kg, litro ou unidade", () => {
    expect(custoDeReferencia({ unidade: "g", embalagemQuantidade: 395, embalagemPrecoCentavos: 699 })).toEqual({ centavos: 1770, medida: "kg" });
    expect(custoDeReferencia({ unidade: "ml", embalagemQuantidade: 1000, embalagemPrecoCentavos: 500 })).toEqual({ centavos: 500, medida: "litro" });
    expect(custoDeReferencia({ unidade: "un", embalagemQuantidade: 100, embalagemPrecoCentavos: 3000 })).toEqual({ centavos: 30, medida: "unidade" });
  });
});
