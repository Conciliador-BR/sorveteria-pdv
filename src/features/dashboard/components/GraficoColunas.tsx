import { formatarReais } from "@/lib/dinheiro";
import { escalaBarra, maiorValor, type Barra } from "../graficos";

type GraficoColunasProps = {
  barras: Barra[];
  /** Legenda da tabela lida pelo leitor de tela. */
  legenda: string;
  rotuloColuna: string;
};

// Colunas em divs para quem enxerga; a mesma informação numa tabela para leitor de tela.
export function GraficoColunas({ barras, legenda, rotuloColuna }: GraficoColunasProps) {
  if (barras.length === 0) return null;
  const maximo = maiorValor(barras);
  // Rótulos do eixo: primeiro, meio e último (sem repetir quando há poucas barras).
  const marcas = [...new Set([0, Math.floor((barras.length - 1) / 2), barras.length - 1])].map((indice) => barras[indice]);
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden="true" className="flex h-40 items-end gap-px border-b border-borda-forte">
        {barras.map((barra) => (
          <div
            key={barra.chave}
            title={`${barra.rotulo}: ${formatarReais(barra.valorCentavos)}`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div className="rounded-t-sm bg-primaria" style={{ height: `${escalaBarra(barra.valorCentavos, maximo)}%` }} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="flex justify-between gap-2 text-xs text-texto-suave">
        {marcas.map((barra) => (
          <span key={barra.chave}>{barra.rotulo}</span>
        ))}
      </div>
      <p aria-hidden="true" className="text-sm text-texto-suave">
        Maior: <span className="font-semibold text-texto tabular-nums">{formatarReais(maximo)}</span>
      </p>
      {/* A tabela cresce até caber o conteúdo mesmo com sr-only; o div em volta é que fica com 1 px. */}
      <div className="sr-only">
        <table>
        <caption>{legenda}</caption>
        <thead>
          <tr>
            <th scope="col">{rotuloColuna}</th>
            <th scope="col">Faturamento</th>
          </tr>
        </thead>
        <tbody>
          {barras.map((barra) => (
            <tr key={barra.chave}>
              <th scope="row">{barra.rotulo}</th>
              <td>{formatarReais(barra.valorCentavos)}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
