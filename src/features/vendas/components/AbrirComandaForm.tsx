"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { abrirComanda } from "../actions";

// Com sucesso, a action redireciona para a comanda nova; em erro, o nome digitado continua.
export function AbrirComandaForm() {
  const [estado, acao, enviando] = useActionState(abrirComanda, {} as EstadoFormulario);
  const { formRef, enviar } = useEnvioSemReset(acao, estado);

  return (
    <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Campo
        name="identificacao"
        rotulo="Nome ou número"
        dica="Ex.: Família Silva, Mesa 4"
        autoComplete="off"
        maxLength={40}
        required
        erro={estado.campos?.identificacao}
      />
      <Button type="submit" tamanho="lg" carregando={enviando} textoCarregando="Abrindo…">
        Abrir comanda
      </Button>
    </form>
  );
}
