"use client";

import { useState, type ComponentProps } from "react";
import { digitosParaCentavos, formatarReais } from "@/lib/dinheiro";
import { Campo } from "./Campo";

type CampoDinheiroProps = Omit<ComponentProps<typeof Campo>, "value" | "defaultValue" | "onChange" | "type" | "name"> & {
  /** Nome do campo enviado no formulário, no formato "25,80". */
  name?: string;
  valorInicialCentavos?: number;
  /** Para telas que calculam na hora (troco, diferença). */
  aoMudar?: (centavos: number) => void;
};

// Digitação contínua em centavos: digitar 2580 mostra R$ 25,80.
export function CampoDinheiro({ name, valorInicialCentavos = 0, aoMudar, ...props }: CampoDinheiroProps) {
  const [centavos, setCentavos] = useState(valorInicialCentavos);
  return (
    <>
      <Campo
        {...props}
        inputMode="numeric"
        autoComplete="off"
        value={centavos ? formatarReais(centavos) : ""}
        placeholder="R$ 0,00"
        onChange={(evento) => {
          const novo = digitosParaCentavos(evento.target.value);
          setCentavos(novo);
          aoMudar?.(novo);
        }}
        className="text-right text-xl tabular-nums"
      />
      {name ? <input type="hidden" name={name} value={centavos ? (centavos / 100).toFixed(2).replace(".", ",") : ""} /> : null}
    </>
  );
}
