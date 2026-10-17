export type LancamentoManual =
  | { tipo: "entrada"; motivo: "compra" | "outro"; quantidade: number }
  | { tipo: "saida"; motivo: "perda" | "consumo_interno" | "outro"; quantidade: number }
  | { tipo: "ajuste"; contado: number };

// Converte o lançamento da tela no movimento com sinal. Ajuste grava a diferença até o valor contado.
export function movimentoDoLancamento(lancamento: LancamentoManual, saldoAtual: number) {
  if (lancamento.tipo === "entrada") return { tipo: "entrada" as const, motivo: lancamento.motivo, quantidade: lancamento.quantidade };
  if (lancamento.tipo === "saida") return { tipo: "saida" as const, motivo: lancamento.motivo, quantidade: -lancamento.quantidade };
  const diferenca = lancamento.contado - saldoAtual;
  return diferenca === 0 ? null : { tipo: "ajuste" as const, motivo: "ajuste_contagem" as const, quantidade: diferenca };
}

export type SituacaoEstoque = "negativo" | "baixo" | "ok";

export function situacaoEstoque(saldo: number, minimo: number): SituacaoEstoque {
  if (saldo < 0) return "negativo";
  if (saldo <= minimo) return "baixo";
  return "ok";
}

// Quantidade na unidade do produto: unidades inteiras ou gramas.
export function formatarQuantidade(quantidade: number, tipoVenda: "unidade" | "peso") {
  if (tipoVenda === "unidade") return `${quantidade} un`;
  const kg = quantidade / 1000;
  return `${kg.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg`;
}
