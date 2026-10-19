"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { fecharCaixa, type EstadoFechamento } from "../actions";
import { ConferenciaCaixa } from "./ConferenciaCaixa";

export function FecharCaixaForm() {
  const [estado, acao, enviando] = useActionState(fecharCaixa, {} as EstadoFechamento);
  const [contado, setContado] = useState(0);
  const erro = estado.campos ?? {};
  const conferencia = estado.conferencia;

  // Sem o reset automático: senha, contado e observação continuam depois da conferência.
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
        dica="Confirme que é você quem está fechando o caixa."
        erro={erro.senha}
      />
      <CampoDinheiro name="contado" rotulo="Dinheiro contado na gaveta" required aoMudar={setContado} erro={erro.contado} />
      {/* Contêiner ao vivo sempre montado: o leitor de tela anuncia a conferência quando ela aparece ou muda. */}
      <div aria-live="polite" aria-atomic="true">
        {conferencia ? (
          <section aria-labelledby="titulo-conferencia" className="flex flex-col gap-3">
            <h3 id="titulo-conferencia" className="text-base font-semibold">
              Conferência
            </h3>
            <ConferenciaCaixa esperadoCentavos={conferencia.esperadoCentavos} contadoCentavos={contado} />
          </section>
        ) : null}
      </div>
      <Campo
        name="observacao"
        rotulo={conferencia ? "Observação (obrigatória: explique a diferença)" : "Observação"}
        autoComplete="off"
        maxLength={300}
        required={Boolean(conferencia)}
        dica="Obrigatória quando o contado não bate com o esperado."
        erro={erro.observacao}
      />
      <Button type="submit" tamanho="lg" carregando={enviando} textoCarregando="Fechando…">
        Fechar caixa
      </Button>
    </form>
  );
}
