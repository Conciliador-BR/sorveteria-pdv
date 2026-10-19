"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { registrarMovimentoCaixa } from "../actions";

// Sangria (tirar dinheiro da gaveta) ou suprimento (colocar), sempre com motivo.
export function MovimentoCaixaForm() {
  const [estado, acao, enviando] = useActionState(registrarMovimentoCaixa, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: true });

  return (
    <div className="flex flex-col gap-4">
      <RetornoFormulario estado={estado} />
      {/* A key limpa os campos depois de um registro com sucesso; em erro, o que foi digitado continua. */}
      <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Selecao name="tipo" rotulo="Tipo" defaultValue="sangria" erro={erro.tipo}>
          <option value="sangria">Sangria (tirar da gaveta)</option>
          <option value="suprimento">Suprimento (colocar na gaveta)</option>
        </Selecao>
        <CampoDinheiro name="valor" rotulo="Valor" required erro={erro.valor} />
        <Campo name="motivo" rotulo="Motivo" autoComplete="off" required maxLength={120} dica="Ex.: depósito no banco, troco extra." erro={erro.motivo} />
        <Button type="submit" variante="secundario" carregando={enviando} textoCarregando="Registrando…">
          Registrar
        </Button>
      </form>
    </div>
  );
}
