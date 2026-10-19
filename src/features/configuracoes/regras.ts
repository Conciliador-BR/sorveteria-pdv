export const NOME_PADRAO_LOJA = "Sorveteria PDV";

// Nome mostrado na área logada: o que o dono salvou ou, sem ele, o nome do sistema.
export function nomeDaLoja(salvo: string | null | undefined) {
  const nome = salvo?.trim();
  return nome ? nome : NOME_PADRAO_LOJA;
}

export function rotuloTipoBandeira(tipo: "debito" | "credito") {
  return tipo === "debito" ? "Débito" : "Crédito";
}
