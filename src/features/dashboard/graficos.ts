// Cálculos puros dos gráficos de barras do painel (feitos com divs, sem biblioteca).

export type Barra = { chave: string; rotulo: string; valorCentavos: number };

// Largura/altura da barra em % do maior valor. Valor positivo nunca some (mínimo de 2%).
export function escalaBarra(valor: number, maximo: number) {
  if (maximo <= 0 || valor <= 0) return 0;
  return Math.max(2, Math.round((valor / maximo) * 100));
}

export function maiorValor(barras: { valorCentavos: number }[]) {
  return barras.reduce((maior, barra) => Math.max(maior, barra.valorCentavos), 0);
}

const somarDias = (dia: string, quantidade: number) => {
  const data = new Date(`${dia}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + quantidade);
  return data.toISOString().slice(0, 10);
};

const formatoDia = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" });

// Um item por dia, de `dias - 1` dias atrás até hoje (ou desde o dia mais antigo com venda),
// com zero nos dias sem venda, para o gráfico não pular datas.
export function barrasPorDia(linhas: { dia: string; valorCentavos: number }[], hoje: string, dias = 30): Barra[] {
  const valores = new Map(linhas.map((linha) => [linha.dia, linha.valorCentavos]));
  const padrao = somarDias(hoje, -(dias - 1));
  let dia = linhas.length && linhas[0].dia < padrao ? linhas[0].dia : padrao;
  const barras: Barra[] = [];
  while (dia <= hoje) {
    barras.push({ chave: dia, rotulo: formatoDia.format(new Date(`${dia}T00:00:00Z`)), valorCentavos: valores.get(dia) ?? 0 });
    dia = somarDias(dia, 1);
  }
  return barras;
}

// Horas entre a primeira e a última com venda, preenchendo as vazias no meio.
export function barrasPorHora(linhas: { hora: number; valorCentavos: number }[]): Barra[] {
  if (linhas.length === 0) return [];
  const valores = new Map(linhas.map((linha) => [linha.hora, linha.valorCentavos]));
  const horas = linhas.map((linha) => linha.hora);
  const barras: Barra[] = [];
  for (let hora = Math.min(...horas); hora <= Math.max(...horas); hora++) {
    barras.push({ chave: String(hora), rotulo: `${String(hora).padStart(2, "0")}h`, valorCentavos: valores.get(hora) ?? 0 });
  }
  return barras;
}
