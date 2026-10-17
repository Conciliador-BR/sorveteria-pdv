import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatarReais } from "@/lib/dinheiro";
import type { ComandaAberta } from "../queries";
import { tempoAberta } from "../regras";

export function CartaoComanda({ comanda }: { comanda: ComandaAberta }) {
  return (
    <Link
      href={`/comandas/${comanda.id}`}
      className="flex min-h-28 flex-col justify-between gap-3 rounded-card border-2 border-acento bg-acento-suave p-4 shadow-suave transition-colors hover:border-primaria"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-semibold text-texto">{comanda.identificacao}</h3>
        <Badge tom="acento">{comanda.quantidadeItens === 1 ? "1 item" : `${comanda.quantidadeItens} itens`}</Badge>
      </div>
      <p className="text-3xl font-bold tabular-nums">{formatarReais(comanda.totalCentavos)}</p>
      <p className="text-sm text-texto-suave">
        Aberta por {comanda.abertaPor} · {tempoAberta(comanda.minutosAberta)}
      </p>
    </Link>
  );
}
