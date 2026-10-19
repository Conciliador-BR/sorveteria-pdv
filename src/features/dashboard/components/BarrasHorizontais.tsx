import { formatarReais } from "@/lib/dinheiro";
import { escalaBarra, maiorValor } from "../graficos";

export type LinhaBarra = { chave: string; rotulo: string; valorCentavos: number; detalhe?: string };

// Lista com rótulo e valor em texto; a barra é só reforço visual (aria-hidden).
export function BarrasHorizontais({ linhas }: { linhas: LinhaBarra[] }) {
  const maximo = maiorValor(linhas);
  return (
    <ul className="flex flex-col gap-3">
      {linhas.map((linha) => (
        <li key={linha.chave} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate font-medium">{linha.rotulo}</span>
            <span className="shrink-0 text-right tabular-nums">
              <span className="font-semibold">{formatarReais(linha.valorCentavos)}</span>
              {linha.detalhe ? <span className="block text-sm text-texto-suave">{linha.detalhe}</span> : null}
            </span>
          </div>
          <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-primaria-suave">
            <div className="h-full rounded-full bg-primaria" style={{ width: `${escalaBarra(linha.valorCentavos, maximo)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
