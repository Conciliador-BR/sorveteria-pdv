"use client";

import { Printer } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

// `automatico`: abre o diálogo de impressão assim que o comprovante aparece (vindo da venda).
export function BotaoImprimir({ automatico = false }: { automatico?: boolean }) {
  useEffect(() => {
    if (automatico) window.print();
  }, [automatico]);

  return (
    <Button variante="primario" tamanho="lg" autoFocus className="w-full" onClick={() => window.print()}>
      <Printer aria-hidden="true" className="size-5" />
      Imprimir
    </Button>
  );
}
