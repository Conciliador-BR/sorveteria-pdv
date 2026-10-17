"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import type { EstadoFormulario } from "@/lib/formulario";
import { removerItemDaComanda } from "../actions";

export function RemoverItemComanda({ itemId, nome }: { itemId: string; nome: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [estado, acao, enviando] = useActionState(removerItemDaComanda, {} as EstadoFormulario);

  if (!confirmando) {
    return (
      <Button variante="fantasma" className="w-12 px-0 text-perigo" aria-label={`Remover ${nome}`} onClick={() => setConfirmando(true)}>
        <Trash2 aria-hidden="true" className="size-5" />
      </Button>
    );
  }

  return (
    <form action={acao} className="flex w-full flex-col gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      {estado.erro ? (
        <Aviso key={estado.envio} tipo="erro">
          {estado.erro}
        </Aviso>
      ) : null}
      <p className="font-medium">Remover {nome} da comanda?</p>
      <div className="flex gap-2">
        <Button type="submit" variante="perigo" autoFocus carregando={enviando} textoCarregando="Removendo…">
          Sim, remover
        </Button>
        <Button variante="fantasma" disabled={enviando} onClick={() => setConfirmando(false)}>
          Não
        </Button>
      </div>
    </form>
  );
}
