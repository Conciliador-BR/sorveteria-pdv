"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatarReais } from "@/lib/dinheiro";
import type { PagamentoInformado } from "../regras";

type ListaPagamentosProps = {
  pagamentos: PagamentoInformado[];
  nomeBandeira: (id: string) => string;
  aoRemover: (indice: number) => void;
  /** Durante o envio, nenhuma parte pode ser tirada. */
  desabilitado?: boolean;
};

const rotuloForma = { dinheiro: "Dinheiro", pix: "Pix", debito: "Débito", credito: "Crédito" } as const;

function descreverPagamento(pagamento: PagamentoInformado, nomeBandeira: (id: string) => string) {
  return "bandeiraId" in pagamento ? `${rotuloForma[pagamento.forma]} · ${nomeBandeira(pagamento.bandeiraId)}` : rotuloForma[pagamento.forma];
}

// Partes já lançadas de um pagamento dividido.
export function ListaPagamentos({ pagamentos, nomeBandeira, aoRemover, desabilitado = false }: ListaPagamentosProps) {
  return (
    <section aria-labelledby="titulo-partes" className="flex flex-col gap-2">
      <h3 id="titulo-partes" className="text-base font-semibold text-texto-suave">
        Já lançado
      </h3>
      <ul className="flex flex-col divide-y divide-borda rounded-card border border-borda">
        {pagamentos.map((pagamento, indice) => {
          const descricao = descreverPagamento(pagamento, nomeBandeira);
          return (
            <li key={indice} className="flex items-center gap-3 px-3 py-1">
              <span className="flex-1 font-medium">{descricao}</span>
              <span className="text-xl font-bold tabular-nums">{formatarReais(pagamento.valorCentavos)}</span>
              <Button
                variante="fantasma"
                className="w-12 px-0"
                aria-label={`Tirar ${descricao} de ${formatarReais(pagamento.valorCentavos)}`}
                disabled={desabilitado}
                onClick={() => aoRemover(indice)}
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
