import { FUSO_LOJA } from "./filtros";

// Textos de exibição do histórico. Valores do banco ficam como estão; aqui só o rótulo.
export const rotulosForma = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito",
} as const;

export type FormaPagamento = keyof typeof rotulosForma;

export const rotulosStatus = {
  concluida: "Concluída",
  cancelada: "Cancelada",
  aberta: "Comanda aberta",
} as const;

export type StatusVenda = keyof typeof rotulosStatus;

export function rotuloForma(forma: string) {
  return rotulosForma[forma as FormaPagamento] ?? forma;
}

// "dinheiro, pix" (vindo do string_agg) → "Dinheiro, Pix".
export function rotuloFormas(formas: string | null) {
  if (!formas) return "";
  return formas.split(",").map((forma) => rotuloForma(forma.trim())).join(", ");
}

export function rotuloTipo(tipo: "balcao" | "comanda", identificacao: string | null) {
  if (tipo === "balcao") return "Balcão";
  return identificacao ? `Comanda ${identificacao}` : "Comanda";
}

export const formatoData = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_LOJA, day: "2-digit", month: "2-digit", year: "numeric" });
export const formatoHora = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_LOJA, hour: "2-digit", minute: "2-digit" });
