"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { criarBandeira } from "../actions";

export function NovaBandeiraForm() {
  const [estado, acao, enviando] = useActionState(criarBandeira, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: true });

  return (
    <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Campo name="nome" rotulo="Nome da bandeira" maxLength={30} autoComplete="off" required dica="Ex.: Visa, Elo, Hipercard." erro={erro.nome} />
      <Selecao name="tipo" rotulo="Tipo" defaultValue="credito" erro={erro.tipo}>
        <option value="debito">Débito</option>
        <option value="credito">Crédito</option>
      </Selecao>
      <Button type="submit" variante="secundario" carregando={enviando} textoCarregando="Cadastrando…">
        Cadastrar bandeira
      </Button>
    </form>
  );
}
