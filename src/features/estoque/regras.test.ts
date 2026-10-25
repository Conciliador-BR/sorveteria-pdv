import { describe, expect, it } from "vitest";
import { formatarQuantidade, movimentoDoLancamento, situacaoEstoque, valorEmEstoque } from "./regras";

describe("movimentoDoLancamento", () => {
  it("entrada soma e saída subtrai", () => {
    expect(movimentoDoLancamento({ tipo: "entrada", motivo: "compra", quantidade: 10 }, 5)).toEqual({ tipo: "entrada", motivo: "compra", quantidade: 10 });
    expect(movimentoDoLancamento({ tipo: "saida", motivo: "perda", quantidade: 3 }, 5)).toEqual({ tipo: "saida", motivo: "perda", quantidade: -3 });
  });

  it("ajuste grava só a diferença até o valor contado", () => {
    expect(movimentoDoLancamento({ tipo: "ajuste", contado: 8 }, 10)).toEqual({ tipo: "ajuste", motivo: "ajuste_contagem", quantidade: -2 });
    expect(movimentoDoLancamento({ tipo: "ajuste", contado: 10 }, 10)).toBeNull();
  });
});

describe("situacaoEstoque", () => {
  it("alerta negativo e abaixo do mínimo", () => {
    expect(situacaoEstoque(-1, 5)).toBe("negativo");
    expect(situacaoEstoque(5, 5)).toBe("baixo");
    expect(situacaoEstoque(6, 5)).toBe("ok");
  });
});

describe("formatarQuantidade", () => {
  it("mostra unidades ou quilos", () => {
    expect(formatarQuantidade(12, "unidade")).toBe("12 un");
    expect(formatarQuantidade(2500, "peso")).toBe("2,5 kg");
  });
});

describe("valorEmEstoque", () => {
  it("multiplica o saldo pelo preço de venda", () => {
    expect(valorEmEstoque(12, 850, "unidade")).toBe(10200);
    expect(valorEmEstoque(2500, 6990, "peso")).toBe(17475);
  });

  it("saldo zerado ou negativo não vale nada", () => {
    expect(valorEmEstoque(0, 850, "unidade")).toBe(0);
    expect(valorEmEstoque(-3, 850, "unidade")).toBe(0);
  });
});
