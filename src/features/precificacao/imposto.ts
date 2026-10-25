// Imposto sobre a venda conforme o regime da loja. Percentuais em centésimos de ponto (600 = 6%).
// Simples Nacional: tabelas dos Anexos I (comércio) e II (indústria) da LC 123/2006, na redação da LC 155/2016.

export type RegimeImposto = "percentual" | "simples" | "mei";
export type AnexoSimples = "I" | "II";

type Faixa = { ateCentavos: number; aliquota: number; deducaoCentavos: number };

// Receita bruta dos 12 meses até o fim da faixa, alíquota nominal e parcela a deduzir.
export const TABELAS_SIMPLES: Record<AnexoSimples, readonly Faixa[]> = {
  I: [
    { ateCentavos: 18_000_000, aliquota: 400, deducaoCentavos: 0 },
    { ateCentavos: 36_000_000, aliquota: 730, deducaoCentavos: 594_000 },
    { ateCentavos: 72_000_000, aliquota: 950, deducaoCentavos: 1_386_000 },
    { ateCentavos: 180_000_000, aliquota: 1070, deducaoCentavos: 2_250_000 },
    { ateCentavos: 360_000_000, aliquota: 1430, deducaoCentavos: 8_730_000 },
    { ateCentavos: 480_000_000, aliquota: 1900, deducaoCentavos: 37_800_000 },
  ],
  II: [
    { ateCentavos: 18_000_000, aliquota: 450, deducaoCentavos: 0 },
    { ateCentavos: 36_000_000, aliquota: 780, deducaoCentavos: 594_000 },
    { ateCentavos: 72_000_000, aliquota: 1000, deducaoCentavos: 1_386_000 },
    { ateCentavos: 180_000_000, aliquota: 1120, deducaoCentavos: 2_250_000 },
    { ateCentavos: 360_000_000, aliquota: 1470, deducaoCentavos: 8_550_000 },
    { ateCentavos: 480_000_000, aliquota: 3000, deducaoCentavos: 72_000_000 },
  ],
};

export const LIMITE_SIMPLES_CENTAVOS = 480_000_000;

// Alíquota efetiva = (receita de 12 meses × alíquota nominal − parcela a deduzir) ÷ receita de 12 meses.
// Acima do limite do Simples, usa a última faixa e avisa (`acimaDoLimite`).
export function aliquotaSimples(anexo: AnexoSimples, receita12MesesCentavos: number) {
  const tabela = TABELAS_SIMPLES[anexo];
  const indice = tabela.findIndex((faixa) => receita12MesesCentavos <= faixa.ateCentavos);
  const posicao = indice === -1 ? tabela.length - 1 : indice;
  const faixa = tabela[posicao];
  const efetiva =
    receita12MesesCentavos <= 0
      ? faixa.aliquota
      : (receita12MesesCentavos * faixa.aliquota - faixa.deducaoCentavos * 10_000) / receita12MesesCentavos;
  return { faixa: posicao + 1, nominal: faixa.aliquota, efetiva, acimaDoLimite: receita12MesesCentavos > LIMITE_SIMPLES_CENTAVOS };
}

export type ParametrosImposto = {
  regime: RegimeImposto;
  impostoPercentual: number;
  anexoSimples: AnexoSimples;
  receita12MesesCentavos: number | null;
  dasMensalCentavos: number | null;
  faturamentoMensalCentavos: number | null;
};

// Receita de 12 meses informada; sem ela, estima pelo faturamento médio do mês × 12.
export function receitaDoze(p: ParametrosImposto) {
  return p.receita12MesesCentavos ?? (p.faturamentoMensalCentavos ? p.faturamentoMensalCentavos * 12 : 0);
}

// Percentual sobre cada venda e valor fixo do mês (DAS do MEI, que entra junto dos custos fixos).
export function impostoDaLoja(p: ParametrosImposto) {
  if (p.regime === "mei") return { percentual: 0, fixoMensalCentavos: p.dasMensalCentavos ?? 0, simples: null };
  if (p.regime === "simples") {
    const simples = aliquotaSimples(p.anexoSimples, receitaDoze(p));
    return { percentual: simples.efetiva, fixoMensalCentavos: 0, simples };
  }
  return { percentual: p.impostoPercentual, fixoMensalCentavos: 0, simples: null };
}
