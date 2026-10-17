"use client";

import { useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import type { BandeirasPorTipo } from "../queries";
import type { PagamentoInformado } from "../regras";
import { BotaoOpcao } from "./BotaoOpcao";

type TipoCartao = "debito" | "credito";

type FormaCartaoProps = {
  restanteCentavos: number;
  bandeiras: BandeirasPorTipo;
  aoMudar: (pagamento: PagamentoInformado | null) => void;
};

const tipos: { tipo: TipoCartao; rotulo: string }[] = [
  { tipo: "debito", rotulo: "Débito" },
  { tipo: "credito", rotulo: "Crédito" },
];

// Débito ou crédito → bandeira → confirmar. A bandeira vem do cadastro do dono.
export function FormaCartao({ restanteCentavos, bandeiras, aoMudar }: FormaCartaoProps) {
  const [tipo, setTipo] = useState<TipoCartao | null>(null);
  const [bandeiraId, setBandeiraId] = useState<string | null>(null);
  const [valor, setValor] = useState(restanteCentavos);

  function emitir(novoTipo: TipoCartao | null, novaBandeira: string | null, novoValor: number) {
    const valido = novoTipo && novaBandeira && novoValor > 0 && novoValor <= restanteCentavos;
    aoMudar(valido ? { forma: novoTipo, valorCentavos: novoValor, bandeiraId: novaBandeira } : null);
  }

  const lista = tipo ? bandeiras[tipo] : [];

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Tipo de cartão" className="grid grid-cols-2 gap-3">
        {tipos.map((opcao) => (
          <BotaoOpcao
            key={opcao.tipo}
            selecionado={tipo === opcao.tipo}
            onClick={() => {
              setTipo(opcao.tipo);
              setBandeiraId(null);
              emitir(opcao.tipo, null, valor);
            }}
          >
            {opcao.rotulo}
          </BotaoOpcao>
        ))}
      </div>

      {tipo && lista.length === 0 ? (
        <Aviso tipo="erro">Nenhuma bandeira de {tipo === "debito" ? "débito" : "crédito"} ativa. Peça ao dono para cadastrar.</Aviso>
      ) : null}

      {tipo && lista.length > 0 ? (
        <div role="group" aria-label={`Bandeira do ${tipo === "debito" ? "débito" : "crédito"}`} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {lista.map((bandeira) => (
            <BotaoOpcao
              key={bandeira.id}
              selecionado={bandeiraId === bandeira.id}
              onClick={() => {
                setBandeiraId(bandeira.id);
                emitir(tipo, bandeira.id, valor);
              }}
            >
              {bandeira.nome}
            </BotaoOpcao>
          ))}
        </div>
      ) : null}

      {tipo ? (
        <CampoDinheiro
          rotulo="Valor no cartão"
          valorInicialCentavos={restanteCentavos}
          dica="Mude só se for dividir o pagamento."
          erro={valor > restanteCentavos ? "Maior que o valor que falta." : undefined}
          aoMudar={(novo) => {
            setValor(novo);
            emitir(tipo, bandeiraId, novo);
          }}
        />
      ) : null}
    </div>
  );
}
