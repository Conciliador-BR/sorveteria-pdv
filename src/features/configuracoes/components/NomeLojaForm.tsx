"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarNomeLoja } from "../actions";

export function NomeLojaForm({ nomeSalvo }: { nomeSalvo: string | null }) {
  const [estado, acao, enviando] = useActionState(salvarNomeLoja, {} as EstadoFormulario);
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado);

  return (
    <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Campo
        name="nomeLoja"
        rotulo="Nome da loja"
        defaultValue={nomeSalvo ?? ""}
        maxLength={60}
        autoComplete="organization"
        required
        dica="Aparece no menu de todas as telas. Até 60 caracteres."
        erro={estado.campos?.nomeLoja}
      />
      <Button type="submit" carregando={enviando} textoCarregando="Salvando…">
        Salvar nome
      </Button>
    </form>
  );
}
