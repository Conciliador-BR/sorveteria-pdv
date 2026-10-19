// Dinheiro esperado na gaveta = fundo + vendas em dinheiro (já sem o troco) + suprimentos − sangrias.
// Pix e cartão aparecem no resumo, mas não entram na gaveta.
export function dinheiroEsperado(valores: {
  fundoCentavos: number;
  vendasDinheiroCentavos: number;
  suprimentosCentavos: number;
  sangriasCentavos: number;
}) {
  return valores.fundoCentavos + valores.vendasDinheiroCentavos + valores.suprimentosCentavos - valores.sangriasCentavos;
}

export type ResultadoConferencia = { diferencaCentavos: number; situacao: "certo" | "sobra" | "falta" };

export function conferir(esperadoCentavos: number, contadoCentavos: number): ResultadoConferencia {
  const diferencaCentavos = contadoCentavos - esperadoCentavos;
  return { diferencaCentavos, situacao: diferencaCentavos === 0 ? "certo" : diferencaCentavos > 0 ? "sobra" : "falta" };
}

// Observação é obrigatória quando há diferença no fechamento.
export function observacaoObrigatoria(diferencaCentavos: number) {
  return diferencaCentavos !== 0;
}

type PagamentoResumo = { forma: "dinheiro" | "pix" | "debito" | "credito"; bandeira: string | null; valorCentavos: number };

// Totais por forma e, no cartão, por bandeira ("Débito Visa").
export function resumirPagamentos(pagamentos: PagamentoResumo[]) {
  const porForma = { dinheiro: 0, pix: 0, debito: 0, credito: 0 };
  const porBandeira = new Map<string, number>();
  for (const pagamento of pagamentos) {
    porForma[pagamento.forma] += pagamento.valorCentavos;
    if (pagamento.bandeira) {
      const chave = `${pagamento.forma === "debito" ? "Débito" : "Crédito"} ${pagamento.bandeira}`;
      porBandeira.set(chave, (porBandeira.get(chave) ?? 0) + pagamento.valorCentavos);
    }
  }
  const total = porForma.dinheiro + porForma.pix + porForma.debito + porForma.credito;
  return { porForma, porBandeira: [...porBandeira].map(([nome, valorCentavos]) => ({ nome, valorCentavos })), total };
}
