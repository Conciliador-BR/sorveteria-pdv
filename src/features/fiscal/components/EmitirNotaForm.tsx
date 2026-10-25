"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { emitirNotaDaVenda } from "../actions";

// Aparece quando a emissão está ligada e a venda ficou sem NFC-e (falha logo após a venda).
export function EmitirNotaForm({ vendaId }: { vendaId: string }) {
  const [estado, acao, enviando] = useActionState(emitirNotaDaVenda, {} as EstadoFormulario);
  return (
    <form action={acao} className="flex flex-col gap-3">
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="vendaId" value={vendaId} />
      <Button type="submit" variante="secundario" className="w-full" carregando={enviando} textoCarregando="Emitindo…">
        Emitir NFC-e
      </Button>
    </form>
  );
}
