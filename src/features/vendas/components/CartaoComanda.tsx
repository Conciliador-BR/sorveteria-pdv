import Link from "next/link";
import { formatarReais } from "@/lib/dinheiro";
import type { ComandaAberta } from "../queries";
import { tempoAberta } from "../regras";

export function CartaoComanda({ comanda }: { comanda: ComandaAberta }) {
  return (
    <Link
      href={`/comandas/${comanda.id}`}
      className="flex flex-col gap-0.5 rounded-botao border-2 border-acento bg-acento-suave px-3 py-2 shadow-suave transition-colors hover:border-primaria"
    >
      <h3 className="truncate text-base font-semibold text-texto">{comanda.identificacao}</h3>
      <span className="text-xl font-bold tabular-nums">{formatarReais(comanda.totalCentavos)}</span>
      <span className="truncate text-xs text-texto-suave">
        {comanda.quantidadeItens === 1 ? "1 item" : `${comanda.quantidadeItens} itens`} · {comanda.abertaPor} · {tempoAberta(comanda.minutosAberta)}
      </span>
    </Link>
  );
}
