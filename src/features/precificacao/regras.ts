// Cálculo puro da precificação. Percentuais guardados em centésimos de ponto (3000 = 30%).
// Os custos por unidade podem ter frações de centavo; só o preço final é arredondado.

export const PERCENTUAL_MAXIMO = 10_000;

export type UnidadeInsumo = "g" | "ml" | "un";
export type TipoVenda = "unidade" | "peso";

// "30" → 3000; "2,5" → 250; "12,75%" → 1275. Vazio ou inválido → null.
export function lerPercentual(texto: string): number | null {
  const limpo = texto.replace(/[%\s]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  return Math.round(Number(limpo) * 100);
}

// 3000 → "30%"; 250 → "2,5%".
export function formatarPercentual(centesimos: number) {
  return `${(centesimos / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

// Valor para preencher um campo de percentual ("2,5"), sem o símbolo.
export function percentualParaCampo(centesimos: number) {
  return (centesimos / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false });
}

export function rotuloUnidade(unidade: UnidadeInsumo) {
  return unidade === "un" ? "un" : unidade;
}

// Rendimento quando o produto ainda não foi configurado: a ficha é de 1 unidade (ou de 1 kg).
export const rendimentoPadrao = (tipoVenda: TipoVenda) => (tipoVenda === "peso" ? 1000 : 1);

export type ItemFicha = { quantidade: number; embalagemQuantidade: number; embalagemPrecoCentavos: number };

// Custo dos insumos de uma receita dividido pelo que ela rende.
// Produto por unidade: custo de 1 unidade. Produto por peso: custo de 1 kg (rendimento em gramas).
export function custoDaFicha(itens: readonly ItemFicha[], rendimento: number, tipoVenda: TipoVenda): number | null {
  if (itens.length === 0 || rendimento <= 0) return null;
  const custoReceita = itens.reduce((soma, item) => soma + (item.quantidade * item.embalagemPrecoCentavos) / item.embalagemQuantidade, 0);
  return tipoVenda === "peso" ? (custoReceita * 1000) / rendimento : custoReceita / rendimento;
}

// Depreciação linear: o que a máquina perde de valor por mês até o fim da vida útil.
export function depreciacaoMensal(maquina: { valorCompraCentavos: number; valorResidualCentavos: number; vidaUtilMeses: number }) {
  return Math.round((maquina.valorCompraCentavos - maquina.valorResidualCentavos) / maquina.vidaUtilMeses);
}

export type Parametros = {
  faturamentoMensalCentavos: number | null;
  impostoPercentual: number;
  taxaCartaoPercentual: number;
  parteCartaoPercentual: number;
  perdasPercentual: number;
};

// Quanto cada real vendido precisa separar para custos fixos, impostos, cartão e perdas.
export function despesasSobreVenda(p: Parametros, custosMensaisCentavos: number) {
  const fixo = p.faturamentoMensalCentavos ? (custosMensaisCentavos * PERCENTUAL_MAXIMO) / p.faturamentoMensalCentavos : 0;
  const cartao = (p.taxaCartaoPercentual * p.parteCartaoPercentual) / PERCENTUAL_MAXIMO;
  const partes = { fixo, imposto: p.impostoPercentual, cartao, perdas: p.perdasPercentual };
  return { ...partes, total: partes.fixo + partes.imposto + partes.cartao + partes.perdas };
}

// Preço pela margem sobre a venda: preço = custo ÷ (1 − despesas% − margem%).
// Arredonda para cima, para a margem nunca ficar abaixo da pedida.
export function precoSugerido(custoCentavos: number, despesasPercentual: number, margemPercentual: number): number | null {
  const sobra = PERCENTUAL_MAXIMO - despesasPercentual - margemPercentual;
  if (sobra <= 0) return null;
  return Math.ceil((custoCentavos * PERCENTUAL_MAXIMO) / sobra - 1e-9);
}

// Lucro que sobra de um preço depois do custo dos insumos e das despesas sobre a venda.
export function lucroDoPreco(precoCentavos: number, custoCentavos: number, despesasPercentual: number) {
  const lucroCentavos = precoCentavos - custoCentavos - (precoCentavos * despesasPercentual) / PERCENTUAL_MAXIMO;
  const margemPercentual = precoCentavos > 0 ? (lucroCentavos * PERCENTUAL_MAXIMO) / precoCentavos : 0;
  return { lucroCentavos: Math.round(lucroCentavos), margemPercentual: Math.round(margemPercentual) };
}

// Quanto o preço está acima do custo ("markup"): 4,60 sobre 2,30 = 100%.
export function markupPercentual(precoCentavos: number, custoCentavos: number) {
  return custoCentavos > 0 ? Math.round(((precoCentavos - custoCentavos) * PERCENTUAL_MAXIMO) / custoCentavos) : 0;
}

// Comparação didática: o preço de quem só soma a margem em cima do custo.
export function precoSomandoNoCusto(custoCentavos: number, margemPercentual: number) {
  return Math.round(custoCentavos * (1 + margemPercentual / PERCENTUAL_MAXIMO));
}

export type ProdutoAnalise = { tipoVenda: TipoVenda; rendimento: number; margemPercentual: number; itens: readonly ItemFicha[] };

// Tudo que a tela e o servidor precisam para um produto: custo, despesas e preço sugerido.
export function analisarProduto(produto: ProdutoAnalise, parametros: Parametros, custosMensaisCentavos: number) {
  const custo = custoDaFicha(produto.itens, produto.rendimento, produto.tipoVenda);
  const despesas = despesasSobreVenda(parametros, custosMensaisCentavos);
  const preco = custo === null ? null : precoSugerido(custo, despesas.total, produto.margemPercentual);
  return { custo, despesas, preco };
}

// Custo do insumo numa medida fácil de conferir: por kg, por litro ou por unidade.
export function custoDeReferencia(insumo: { unidade: UnidadeInsumo; embalagemQuantidade: number; embalagemPrecoCentavos: number }) {
  const fator = insumo.unidade === "un" ? 1 : 1000;
  const medida = { g: "kg", ml: "litro", un: "unidade" }[insumo.unidade];
  return { centavos: Math.round((insumo.embalagemPrecoCentavos * fator) / insumo.embalagemQuantidade), medida };
}
