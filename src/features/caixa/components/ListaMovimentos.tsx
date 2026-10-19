import { Badge } from "@/components/ui/Badge";
import { formatarReais } from "@/lib/dinheiro";
import type { MovimentoCaixa } from "../queries";
import { DataHora } from "./DataHora";

// Sangrias e suprimentos do caixa, do mais recente ao mais antigo.
export function ListaMovimentos({ movimentos }: { movimentos: MovimentoCaixa[] }) {
  if (movimentos.length === 0) return <p className="text-texto-suave">Nenhuma sangria ou suprimento ainda.</p>;
  return (
    <ul className="divide-y divide-borda">
      {movimentos.map((movimento) => (
        <li key={movimento.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
          <Badge tom={movimento.tipo === "sangria" ? "acento" : "sucesso"}>{movimento.tipo === "sangria" ? "Sangria" : "Suprimento"}</Badge>
          <span className="min-w-0 flex-1">{movimento.motivo}</span>
          <span className="text-sm text-texto-suave">
            <DataHora valor={movimento.criadoEm} />
          </span>
          <span className="font-semibold tabular-nums">
            {movimento.tipo === "sangria" ? "−" : "+"} {formatarReais(movimento.valorCentavos)}
          </span>
        </li>
      ))}
    </ul>
  );
}
