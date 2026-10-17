const formato = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

// Data e hora no fuso da loja, com o valor ISO em `dateTime` para leitores de tela e ferramentas.
export function DataHora({ valor }: { valor: Date }) {
  return <time dateTime={valor.toISOString()}>{formato.format(valor)}</time>;
}
