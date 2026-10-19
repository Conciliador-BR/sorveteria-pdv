// Toda conta de dinheiro em centavos inteiros. Formatação só aqui.
const formatoReal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarReais(centavos: number) {
  return formatoReal.format(centavos / 100).replace(/ /g, " ");
}

// "2580" → 2580; "25,80" → 2580; "R$ 1.234,5" → 123450. Vazio ou inválido → null.
export function lerReais(texto: string): number | null {
  // "25.80" é ambíguo (ponto decimal ou de milhar): recusa em vez de virar R$ 2.580,00.
  if (/\.\d{1,2}\s*$/.test(texto)) return null;
  const limpo = texto.replace(/[R$\s.]/g, "").trim();
  if (!limpo) return null;
  if (/^\d+$/.test(limpo)) return Number(limpo) * 100;
  const partes = /^(\d+),(\d{1,2})$/.exec(limpo);
  if (!partes) return null;
  return Number(partes[1]) * 100 + Number(partes[2].padEnd(2, "0"));
}

// Digitação contínua do caixa: só dígitos, lidos como centavos ("2580" → R$ 25,80).
export function digitosParaCentavos(digitos: string) {
  const numeros = digitos.replace(/\D/g, "").slice(0, 9);
  return numeros ? Number(numeros) : 0;
}

// Preço do kg × gramas ÷ 1000, arredondado ao centavo (meio centavo para cima).
export function totalPorPeso(precoKgCentavos: number, gramas: number) {
  return Math.floor((precoKgCentavos * gramas + 500) / 1000);
}

// Caminho inverso, para quando o funcionário digita o valor que a balança mostrou:
// gramas aproximadas (para o estoque) a partir do preço do kg. Pelo menos 1 g.
export function gramasPorValor(precoKgCentavos: number, valorCentavos: number) {
  return Math.max(1, Math.round((valorCentavos * 1000) / precoKgCentavos));
}

export function troco(recebidoCentavos: number, parteDinheiroCentavos: number) {
  return Math.max(0, recebidoCentavos - parteDinheiroCentavos);
}

export function formatarPeso(gramas: number) {
  return gramas >= 1000 ? `${(gramas / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg` : `${gramas} g`;
}
