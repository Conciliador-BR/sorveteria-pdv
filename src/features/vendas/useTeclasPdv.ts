"use client";

import { useEffect, useRef } from "react";

type Acoes = Partial<Record<"F2" | "F8", () => void>>;

// Teclas de função do caixa (F2 busca, F8 cobra). Com um <dialog> aberto (aviso de saída, menu),
// as teclas ficam com ele: nada acontece atrás do aviso.
export function useTeclasPdv(acoes: Acoes, ativo = true) {
  const atuais = useRef(acoes);
  useEffect(() => {
    atuais.current = acoes;
  });

  useEffect(() => {
    if (!ativo) return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key !== "F2" && evento.key !== "F8") return;
      const acao = atuais.current[evento.key];
      if (!acao || document.querySelector("dialog[open]")) return;
      evento.preventDefault();
      acao();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [ativo]);
}
