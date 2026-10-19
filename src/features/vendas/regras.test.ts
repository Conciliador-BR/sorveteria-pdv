import { describe, expect, it } from "vitest";
import {
  novoIdVenda,
  adicionarAoCarrinho,
  calcularItem,
  ErroItem,
  alterarQuantidade,
  carrinhoPronto,
  conferirPagamentos,
  definirModoPeso,
  definirPeso,
  definirValorPeso,
  formatarDataHora,
  itensParaEnvio,
  tempoAberta,
  totalDaVenda,
  totalDoCarrinho,
  totalDoItem,
} from "./regras";

describe("totalDoItem", () => {
  it("multiplica unidades e calcula peso", () => {
    expect(totalDoItem({ tipoVenda: "unidade", precoCentavos: 850, quantidade: 3 })).toBe(2550);
    expect(totalDoItem({ tipoVenda: "peso", precoCentavos: 5990, pesoGramas: 350 })).toBe(2097);
  });

  it("soma o total da venda", () => {
    expect(totalDaVenda([{ totalCentavos: 2097 }, { totalCentavos: 483 }])).toBe(2580);
  });
});

describe("conferirPagamentos", () => {
  it("R$ 25,80 pago com R$ 30,00 em dinheiro dá troco de R$ 4,20 (critério de aceite)", () => {
    expect(conferirPagamentos(2580, [{ forma: "dinheiro", valorCentavos: 2580, recebidoCentavos: 3000 }])).toEqual({ ok: true, trocoCentavos: 420 });
  });

  it("bloqueia valor recebido menor que a parte em dinheiro", () => {
    expect(conferirPagamentos(2580, [{ forma: "dinheiro", valorCentavos: 2580, recebidoCentavos: 2000 }]).ok).toBe(false);
  });

  it("aceita pagamento dividido que fecha o total", () => {
    const resultado = conferirPagamentos(5000, [
      { forma: "debito", valorCentavos: 3000, bandeiraId: "b1" },
      { forma: "dinheiro", valorCentavos: 2000, recebidoCentavos: 5000 },
    ]);
    expect(resultado).toEqual({ ok: true, trocoCentavos: 3000 });
  });

  it("recusa soma diferente do total e venda vazia", () => {
    expect(conferirPagamentos(5000, [{ forma: "pix", valorCentavos: 4000 }]).ok).toBe(false);
    expect(conferirPagamentos(0, [{ forma: "pix", valorCentavos: 0 }]).ok).toBe(false);
  });
});

describe("carrinho", () => {
  const casquinha = { id: "p1", nome: "Casquinha", tipoVenda: "unidade" as const, precoCentavos: 850 };
  const sorveteKg = { id: "p2", nome: "Sorvete kg", tipoVenda: "peso" as const, precoCentavos: 5990 };

  it("soma unidades na mesma linha e abre linha nova para cada peso", () => {
    let linhas = adicionarAoCarrinho([], casquinha, "a");
    linhas = adicionarAoCarrinho(linhas, casquinha, "b");
    linhas = adicionarAoCarrinho(linhas, sorveteKg, "c");
    linhas = adicionarAoCarrinho(linhas, sorveteKg, "d");
    expect(linhas.map((linha) => [linha.chave, linha.quantidade])).toEqual([["a", 2], ["c", 1], ["d", 1]]);
  });

  it("350 g a R$ 59,90/kg dá R$ 20,97 e só fica pronto com peso", () => {
    let linhas = adicionarAoCarrinho([], sorveteKg, "c");
    expect(carrinhoPronto(linhas)).toBe(false);
    expect(totalDoCarrinho(linhas)).toBe(0);
    linhas = definirPeso(linhas, "c", 350);
    expect(carrinhoPronto(linhas)).toBe(true);
    expect(totalDoCarrinho(linhas)).toBe(2097);
    expect(itensParaEnvio(linhas)).toEqual([{ produtoId: "p2", pesoGramas: 350 }]);
  });

  it("no modo valor cobra o que a balança mostrou e envia o valor", () => {
    let linhas = adicionarAoCarrinho([], sorveteKg, "c", "valor");
    expect(carrinhoPronto(linhas)).toBe(false);
    linhas = definirValorPeso(linhas, "c", 2000);
    expect(carrinhoPronto(linhas)).toBe(true);
    expect(totalDoCarrinho(linhas)).toBe(2000);
    expect(itensParaEnvio(linhas)).toEqual([{ produtoId: "p2", valorCentavos: 2000 }]);
  });

  it("trocar o modo usa só o campo do modo escolhido", () => {
    let linhas = definirPeso(adicionarAoCarrinho([], sorveteKg, "c"), "c", 350);
    linhas = definirModoPeso(linhas, "c", "valor");
    expect(carrinhoPronto(linhas)).toBe(false);
    expect(totalDoCarrinho(linhas)).toBe(0);
    linhas = definirModoPeso(linhas, "c", "gramas");
    expect(itensParaEnvio(linhas)).toEqual([{ produtoId: "p2", pesoGramas: 350 }]);
  });

  it("quantidade zero remove a linha", () => {
    const linhas = adicionarAoCarrinho([], casquinha, "a");
    expect(alterarQuantidade(linhas, "a", 0)).toEqual([]);
    expect(itensParaEnvio(alterarQuantidade(linhas, "a", 3))).toEqual([{ produtoId: "p1", quantidade: 3 }]);
  });
});

describe("calcularItem (regra usada pelo servidor)", () => {
  const sorveteKg = { nome: "Sorvete kg", tipoVenda: "peso" as const, precoCentavos: 5990 };
  const picole = { nome: "Picolé", tipoVenda: "unidade" as const, precoCentavos: 800 };

  it("por unidade e por gramas calcula pelo cadastro", () => {
    expect(calcularItem(picole, { quantidade: 3 })).toEqual({ quantidade: 3, pesoGramas: null, totalCentavos: 2400 });
    expect(calcularItem(sorveteKg, { pesoGramas: 350 })).toEqual({ quantidade: 1, pesoGramas: 350, totalCentavos: 2097 });
  });

  it("pelo valor da balança cobra o valor e estima as gramas", () => {
    expect(calcularItem(sorveteKg, { valorCentavos: 2000 })).toEqual({ quantidade: 1, pesoGramas: 334, totalCentavos: 2000 });
    expect(calcularItem(sorveteKg, { valorCentavos: 1 })).toEqual({ quantidade: 1, pesoGramas: 1, totalCentavos: 1 });
  });

  it("recusa valor em produto sem preço do kg e acima de 100 kg", () => {
    expect(() => calcularItem({ ...sorveteKg, precoCentavos: 0 }, { valorCentavos: 2000 })).toThrow(ErroItem);
    expect(() => calcularItem(sorveteKg, { valorCentavos: 600_000 })).toThrow("passa de 100 kg");
  });

  it("recusa forma que não combina com o tipo do produto", () => {
    expect(() => calcularItem(picole, { valorCentavos: 100 })).toThrow("Informe a quantidade");
    expect(() => calcularItem(sorveteKg, { quantidade: 1 })).toThrow("Informe o peso");
  });
});

describe("tempoAberta", () => {
  it("escreve minutos e horas", () => {
    expect(tempoAberta(0)).toBe("agora há pouco");
    expect(tempoAberta(5)).toBe("há 5 min");
    expect(tempoAberta(80)).toBe("há 1 h 20 min");
    expect(tempoAberta(120)).toBe("há 2 h");
  });
});

describe("formatarDataHora", () => {
  it("usa o fuso de São Paulo", () => {
    expect(formatarDataHora(new Date("2026-10-17T17:32:00Z"))).toBe("17/10/2026 14:32");
  });
});

describe("novoIdVenda", () => {
  it("gera UUID v4 diferente a cada venda", () => {
    const formato = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    const a = novoIdVenda();
    expect(a).toMatch(formato);
    expect(novoIdVenda()).not.toBe(a);
  });
});
