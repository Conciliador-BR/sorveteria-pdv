"use client";

import { useState } from "react";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import type { PagamentoInformado } from "../regras";

type FormaPixProps = { restanteCentavos: number; aoMudar: (pagamento: PagamentoInformado | null) => void };

// Pix é conferido à mão: o funcionário olha o celular da loja e confirma.
export function FormaPix({ restanteCentavos, aoMudar }: FormaPixProps) {
  const [valor, setValor] = useState(restanteCentavos);
  const acima = valor > restanteCentavos;

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-campo bg-primaria-suave p-3 font-medium text-primaria-escura">
        Confira no celular da loja se o Pix caiu antes de confirmar.
      </p>
      <CampoDinheiro
        rotulo="Valor no Pix"
        valorInicialCentavos={restanteCentavos}
        dica="Mude só se for dividir o pagamento."
        erro={acima ? "Maior que o valor que falta." : undefined}
        aoMudar={(novo) => {
          setValor(novo);
          aoMudar(novo > 0 && novo <= restanteCentavos ? { forma: "pix", valorCentavos: novo } : null);
        }}
      />
    </div>
  );
}
