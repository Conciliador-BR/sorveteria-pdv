// Regras da NFC-e (modelo 65) sem banco: CNPJ, UF e chave de acesso.

// Código IBGE da UF: os dois primeiros dígitos da chave de acesso.
export const CODIGOS_UF = {
  RO: 11, AC: 12, AM: 13, RR: 14, PA: 15, AP: 16, TO: 17,
  MA: 21, PI: 22, CE: 23, RN: 24, PB: 25, PE: 26, AL: 27, SE: 28, BA: 29,
  MG: 31, ES: 32, RJ: 33, SP: 35,
  PR: 41, SC: 42, RS: 43,
  MS: 50, MT: 51, GO: 52, DF: 53,
} as const;

export type Uf = keyof typeof CODIGOS_UF;
export const UFS = Object.keys(CODIGOS_UF).sort() as Uf[];

// Valor de cada caractere no cálculo dos dígitos: código ASCII − 48 ("0" = 0, "A" = 17).
// Vale para o CNPJ numérico e para o alfanumérico (Receita Federal, a partir de julho de 2026).
const valor = (caractere: string) => caractere.charCodeAt(0) - 48;

function digitoCnpj(base: string) {
  const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const resto = [...base].reduce((soma, caractere, i) => soma + valor(caractere) * pesos[i], 0) % 11;
  return resto < 2 ? 0 : 11 - resto;
}

// Só letras maiúsculas e dígitos: "12.ABC.345/01DE-35" → "12ABC34501DE35".
export function limparCnpj(texto: string) {
  return texto.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function cnpjValido(texto: string) {
  const cnpj = limparCnpj(texto);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(cnpj)) return false;
  // Todos os caracteres iguais passa no cálculo, mas não existe.
  if (/^(.)\1+$/.test(cnpj)) return false;
  const primeiro = digitoCnpj(cnpj.slice(0, 12));
  const segundo = digitoCnpj(cnpj.slice(0, 12) + primeiro);
  return cnpj.endsWith(`${primeiro}${segundo}`);
}

export function formatarCnpj(cnpj: string) {
  const c = limparCnpj(cnpj);
  return c.length === 14 ? `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}` : c;
}

// Dígito verificador da chave de acesso: módulo 11 com pesos 2 a 9 da direita para a esquerda.
export function digitoChave(chave43: string) {
  const soma = [...chave43].reverse().reduce((total, caractere, i) => total + valor(caractere) * ((i % 8) + 2), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

type DadosChave = {
  uf: Uf;
  /** Ano e mês da emissão no fuso da loja. */
  ano: number;
  mes: number;
  cnpj: string;
  serie: number;
  numero: number;
  /** Código numérico aleatório de 8 dígitos, diferente do número da nota. */
  codigo: number;
};

// 44 caracteres: UF, AAMM, CNPJ, modelo 65, série, número, tipo de emissão 1 (normal), código e dígito.
export function montarChaveAcesso({ uf, ano, mes, cnpj, serie, numero, codigo }: DadosChave) {
  const partes = [
    String(CODIGOS_UF[uf]),
    String(ano % 100).padStart(2, "0"),
    String(mes).padStart(2, "0"),
    limparCnpj(cnpj),
    "65",
    String(serie).padStart(3, "0"),
    String(numero).padStart(9, "0"),
    "1",
    String(codigo).padStart(8, "0"),
  ];
  const chave43 = partes.join("");
  if (chave43.length !== 43) throw new Error("Dados inválidos para a chave de acesso.");
  return chave43 + digitoChave(chave43);
}

// Grupos de 4, como sai no DANFE.
export function formatarChave(chave: string) {
  return chave.replace(/(.{4})(?=.)/g, "$1 ");
}

// Ano e mês da emissão no fuso da loja (a chave usa AAMM).
export function anoMesNoFuso(data: Date, fuso: string) {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: fuso, year: "numeric", month: "2-digit" }).formatToParts(data);
  const parte = (tipo: "year" | "month") => Number(partes.find((p) => p.type === tipo)?.value);
  return { ano: parte("year"), mes: parte("month") };
}
