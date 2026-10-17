"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { Card } from "@/components/ui/Card";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { reabrirCaixa } from "../actions";

// Ref estável: foca a confirmação uma vez, quando ela aparece.
const focarAoMontar = (elemento: HTMLElement | null) => elemento?.focus();

type ReabrirCaixaFormProps = {
  caixaId: string;
  /** A página continua montando o componente depois de reabrir, para a confirmação não sumir. */
  caixaFechado: boolean;
};

// Só para o dono (o servidor confere de novo). Dois passos: abrir pede o motivo; só o segundo botão reabre.
export function ReabrirCaixaForm({ caixaId, caixaFechado }: ReabrirCaixaFormProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(async (anterior: EstadoFormulario, formData: FormData) => {
    const resultado = await reabrirCaixa(anterior, formData);
    // Garante que esta página mostre o caixa aberto logo depois de reabrir.
    if (resultado.ok) router.refresh();
    return resultado;
  }, {} as EstadoFormulario);
  const { formRef, enviar } = useEnvioSemReset(acao, estado);

  if (estado.ok) {
    return (
      <Aviso ref={focarAoMontar} tabIndex={-1} tipo="sucesso">
        {estado.ok} O funcionário já pode registrar vendas nele.
      </Aviso>
    );
  }

  if (!caixaFechado) return null;

  if (!aberto) {
    return (
      <Button variante="secundario" className="self-start" onClick={() => setAberto(true)}>
        Reabrir caixa
      </Button>
    );
  }

  return (
    <Card>
      <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <h2 className="text-xl font-semibold">Reabrir este caixa?</h2>
        <p className="text-texto-suave">
          O caixa volta a aceitar vendas e a conferência é apagada; ela é feita de novo no próximo fechamento. A reabertura fica registrada.
        </p>
        <RetornoFormulario estado={estado} />
        <input type="hidden" name="caixaId" value={caixaId} />
        <Campo
          name="motivo"
          rotulo="Motivo da reabertura"
          required
          minLength={3}
          maxLength={200}
          autoComplete="off"
          autoFocus
          dica="Ex.: fechado antes da hora, contagem errada."
          erro={estado.campos?.motivo ?? estado.campos?.caixaId}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" carregando={enviando} textoCarregando="Reabrindo…">
            Confirmar reabertura
          </Button>
          <Button variante="fantasma" disabled={enviando} onClick={() => setAberto(false)}>
            Voltar
          </Button>
        </div>
      </form>
    </Card>
  );
}
