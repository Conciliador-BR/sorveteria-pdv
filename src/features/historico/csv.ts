import { linhaCsv } from "./filtros";
import { formatoData, formatoHora, rotuloFormas, rotulosStatus, rotuloTipo } from "./rotulos";

export const LIMITE_CSV = 5000;

// Campos usados no CSV; listarVendas devolve um superconjunto disto.
export type VendaCsv = {
  numero: number;
  tipo: "balcao" | "comanda";
  identificacao: string | null;
  status: keyof typeof rotulosStatus;
  totalCentavos: number;
  trocoCentavos: number;
  abertaEm: Date;
  concluidaEm: Date | null;
  funcionario: string;
  canceladaPor: string | null;
  motivoCancelamento: string | null;
  formas: string | null;
};

// Valor em reais sem símbolo, com vírgula: o Excel em português lê como número.
export function reaisCsv(centavos: number) {
  const sinal = centavos < 0 ? "-" : "";
  const absoluto = Math.abs(centavos);
  return `${sinal}${Math.trunc(absoluto / 100)},${String(absoluto % 100).padStart(2, "0")}`;
}

// Texto livre começando com = + - @ vira fórmula no Excel; o apóstrofo o mantém como texto.
export function textoSeguro(texto: string | null) {
  if (!texto) return "";
  return /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
}

const cabecalho = ["Número", "Data", "Hora", "Funcionário", "Tipo", "Status", "Formas", "Total (R$)", "Troco (R$)", "Cancelada por", "Motivo do cancelamento"];

// BOM no início para o Excel reconhecer UTF-8 (acentos); linhas com CRLF.
export function montarCsv(vendas: VendaCsv[]) {
  const linhas = vendas.map((venda) => {
    const momento = venda.concluidaEm ?? venda.abertaEm;
    return linhaCsv([
      venda.numero,
      formatoData.format(momento),
      formatoHora.format(momento),
      textoSeguro(venda.funcionario),
      textoSeguro(rotuloTipo(venda.tipo, venda.identificacao)),
      rotulosStatus[venda.status],
      rotuloFormas(venda.formas),
      reaisCsv(venda.totalCentavos),
      reaisCsv(venda.trocoCentavos),
      textoSeguro(venda.canceladaPor),
      textoSeguro(venda.motivoCancelamento),
    ]);
  });
  return `\uFEFF${[linhaCsv(cabecalho), ...linhas].join("\r\n")}\r\n`;
}
