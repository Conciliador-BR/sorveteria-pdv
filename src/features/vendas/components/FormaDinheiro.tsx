"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { formatarReais, troco } from "@/lib/dinheiro";
import type { PagamentoInformado } from "../regras";
import { TotalDestaque } from "./TotalDestaque";

type FormaDinheiroProps = { restanteCentavos: number; aoMudar: (pagamento: PagamentoInformado | null) => void };

// Valor exato e as próximas notas acima do que falta, para tocar em vez de digitar.
function atalhosDeNotas(restanteCentavos: number) {
  const notas = [500, 1000, 2000, 5000, 10000, 20000].filter((nota) => nota > restanteCentavos).slice(0, 3);
  return [restanteCentavos, ...notas];
}

export function FormaDinheiro({ restanteCentavos, aoMudar }: FormaDinheiroProps) {
  const [recebido, setRecebido] = useState(0);
  // Trocar a versão remonta o campo com o valor do atalho.
  const [versao, setVersao] = useState(0);
  const falta = recebido > 0 && recebido < restanteCentavos ? restanteCentavos - recebido : 0;

  function mudar(valor: number) {
    setRecebido(valor);
    aoMudar(valor > 0 ? { forma: "dinheiro", valorCentavos: Math.min(valor, restanteCentavos), recebidoCentavos: valor } : null);
  }

  return (
    <div className="flex flex-col gap-4">
      <CampoDinheiro
        key={versao}
        rotulo="Valor recebido"
        valorInicialCentavos={recebido}
        aoMudar={mudar}
        autoFocus={versao === 0}
        erro={falta ? `Faltam ${formatarReais(falta)}. Confira o valor ou pague o resto de outra forma.` : undefined}
      />
      <div role="group" aria-label="Atalhos de valor recebido" className="flex flex-wrap gap-2">
        {atalhosDeNotas(restanteCentavos).map((valor, indice) => (
          <Button
            key={valor}
            variante="secundario"
            onClick={() => {
              mudar(valor);
              setVersao((atual) => atual + 1);
            }}
          >
            {indice === 0 ? `Valor exato (${formatarReais(valor)})` : formatarReais(valor)}
          </Button>
        ))}
      </div>
      {/* Contêiner ao vivo sempre montado: anuncia troco ou falta assim que o valor recebido é digitado. */}
      <div aria-live="polite" aria-atomic="true">
        {recebido === 0 ? null : falta ? (
          <TotalDestaque rotulo="Falta" centavos={falta} tom="perigo" aoVivo={false} />
        ) : (
          <TotalDestaque rotulo="Troco" centavos={troco(recebido, restanteCentavos)} tom="sucesso" aoVivo={false} />
        )}
      </div>
    </div>
  );
}
