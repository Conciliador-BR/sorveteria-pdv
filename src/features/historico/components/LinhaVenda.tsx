import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatarReais } from "@/lib/dinheiro";
import type { VendaLista } from "../queries";
import { formatoData, formatoHora, rotuloFormas, rotuloTipo } from "../rotulos";
import { StatusVenda } from "./StatusVenda";

// Uma venda da lista; a linha inteira leva ao detalhe.
export function LinhaVenda({ venda }: { venda: VendaLista }) {
  const momento = venda.concluidaEm ?? venda.abertaEm;
  const cancelada = venda.status === "cancelada";
  return (
    <li>
      <Link
        href={`/vendas/${venda.id}`}
        className="grid min-h-12 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-primaria-suave sm:grid-cols-[5rem_1fr_auto_auto]"
      >
        <span className="font-semibold tabular-nums">
          Nº {venda.numero}
          <span className="block text-sm font-normal text-texto-suave">
            <time dateTime={momento.toISOString()}>
              {formatoData.format(momento)} {formatoHora.format(momento)}
            </time>
          </span>
        </span>
        <span className="col-span-2 row-start-2 min-w-0 text-sm sm:col-span-1 sm:row-start-auto">
          <span className="block truncate font-medium">{venda.funcionario}</span>
          <span className="block text-texto-suave">
            {rotuloTipo(venda.tipo, venda.identificacao)}
            {venda.formas ? ` · ${rotuloFormas(venda.formas)}` : null}
          </span>
          {cancelada ? (
            <span className="block text-perigo">
              Cancelada{venda.canceladaPor ? ` por ${venda.canceladaPor}` : ""}
              {venda.motivoCancelamento ? `: ${venda.motivoCancelamento}` : ""}
            </span>
          ) : null}
        </span>
        <span className="col-start-2 row-start-1 flex flex-col items-end gap-1 sm:col-start-auto sm:row-start-auto">
          <span className={cancelada ? "font-semibold tabular-nums text-texto-suave line-through" : "font-semibold tabular-nums"}>
            {formatarReais(venda.totalCentavos)}
          </span>
          <StatusVenda status={venda.status} />
        </span>
        <ChevronRight aria-hidden="true" className="hidden size-5 text-texto-suave sm:block" />
      </Link>
    </li>
  );
}
