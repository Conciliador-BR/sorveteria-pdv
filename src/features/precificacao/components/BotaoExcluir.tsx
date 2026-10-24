"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";

type BotaoExcluirProps = {
  acao: (anterior: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  id: string;
  /** Texto do primeiro botão ("Excluir insumo", "Tirar da ficha"). */
  rotulo: string;
  /** Nome para leitor de tela quando o texto visível é curto ("Tirar Leite da ficha"). */
  nomeAcessivel?: string;
};

// Exclusão em dois toques: o primeiro pede confirmação, o segundo envia.
export function BotaoExcluir({ acao, id, rotulo, nomeAcessivel }: BotaoExcluirProps) {
  const [estado, enviar, enviando] = useActionState(acao, {} as EstadoFormulario);
  const [confirmando, setConfirmando] = useState(false);

  return (
    <form action={enviar} className="flex flex-col gap-2">
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="id" value={id} />
      {confirmando ? (
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variante="perigo" carregando={enviando} textoCarregando="Salvando…">
            Confirmar
          </Button>
          <Button variante="fantasma" onClick={() => setConfirmando(false)}>
            Manter
          </Button>
        </div>
      ) : (
        <Button variante="fantasma" className="self-start text-perigo" aria-label={nomeAcessivel} onClick={() => setConfirmando(true)}>
          {rotulo}
        </Button>
      )}
    </form>
  );
}
