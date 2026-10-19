import { formatarPeso, formatarReais } from "@/lib/dinheiro";
import type { ItemDaComanda } from "../queries";
import { formatarDataHora } from "../regras";
import { RemoverItemComanda } from "./RemoverItemComanda";

type ItensDaComandaProps = { itens: ItemDaComanda[]; podeRemover: boolean };

export function ItensDaComanda({ itens, podeRemover }: ItensDaComandaProps) {
  if (itens.length === 0) return <p className="py-2 text-texto-suave">Nenhum item lançado ainda.</p>;
  return (
    <ul className="flex flex-col divide-y divide-borda">
      {itens.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {item.tipoVenda === "peso" && item.pesoGramas ? `${item.nome} · ${formatarPeso(item.pesoGramas)}` : `${item.quantidade} × ${item.nome}`}
            </p>
            <p className="text-sm text-texto-suave">
              {item.lancadoPor} · <time dateTime={item.criadoEm.toISOString()}>{formatarDataHora(item.criadoEm)}</time>
            </p>
          </div>
          <span className="font-bold tabular-nums">{formatarReais(item.totalCentavos)}</span>
          {podeRemover ? <RemoverItemComanda itemId={item.id} nome={item.nome} /> : null}
        </li>
      ))}
    </ul>
  );
}
