import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DataHora } from "@/features/caixa/components/DataHora";
import { formatarReais } from "@/lib/dinheiro";
import type { PainelDono } from "../queries";
import { SecaoPainel } from "./SecaoPainel";

// Caixas fechados no mês com sobra ou falta; cada um leva ao fechamento completo.
export function FechamentosComDiferenca({ fechamentos }: { fechamentos: PainelDono["fechamentosComDiferenca"] }) {
  return (
    <SecaoPainel
      titulo="Fechamentos com diferença"
      descricao="Caixas deste mês que fecharam com sobra ou falta"
      vazio={fechamentos.length === 0}
      mensagemVazia="Nenhum caixa fechou com diferença este mês."
    >
      <ul className="-mx-2 flex flex-col divide-y divide-borda">
        {fechamentos.map((caixa) => {
          const falta = (caixa.diferencaCentavos ?? 0) < 0;
          return (
            <li key={caixa.id}>
              <Link
                href={`/caixa/fechamento/${caixa.id}`}
                className="flex min-h-12 items-center gap-3 rounded-campo px-2 py-2 transition-colors hover:bg-primaria-suave"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{caixa.funcionario}</span>
                  <span className="block text-sm text-texto-suave">
                    {caixa.fechadoEm ? <DataHora valor={caixa.fechadoEm} /> : null}
                    {caixa.observacao ? ` · ${caixa.observacao}` : null}
                  </span>
                </span>
                <span className={falta ? "font-semibold text-perigo tabular-nums" : "font-semibold text-sucesso-escuro tabular-nums"}>
                  {falta ? "Falta " : "Sobra "}
                  {formatarReais(Math.abs(caixa.diferencaCentavos ?? 0))}
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-texto-suave" />
              </Link>
            </li>
          );
        })}
      </ul>
    </SecaoPainel>
  );
}
