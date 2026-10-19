"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CaixaSelecao } from "@/components/ui/CaixaSelecao";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { abrirCaixa } from "../actions";

export function AbrirCaixaForm() {
  const [estado, acao, enviando] = useActionState(abrirCaixa, {} as EstadoFormulario);
  const [semFundo, setSemFundo] = useState(false);
  const erro = estado.campos ?? {};

  // Sem o reset automático: se a senha estiver errada, o fundo digitado continua.
  const { formRef, enviar } = useEnvioSemReset(acao, estado);

  return (
    <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Campo
        name="senha"
        type="password"
        rotulo="Sua senha"
        autoComplete="current-password"
        required
        dica="Confirme que é você quem está abrindo o caixa."
        erro={erro.senha}
      />
      <CampoDinheiro
        name="fundo"
        rotulo="Fundo de troco"
        dica="Dinheiro que já está na gaveta ao abrir."
        required={!semFundo}
        disabled={semFundo}
        erro={semFundo ? undefined : erro.fundo}
      />
      <CaixaSelecao
        name="semFundo"
        rotulo="Abrir sem fundo"
        dica="Marque só se a gaveta começar vazia."
        checked={semFundo}
        onChange={(evento) => setSemFundo(evento.target.checked)}
      />
      <Button type="submit" tamanho="lg" carregando={enviando} textoCarregando="Abrindo…">
        Abrir caixa
      </Button>
    </form>
  );
}
