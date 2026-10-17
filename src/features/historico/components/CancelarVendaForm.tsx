"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { Card } from "@/components/ui/Card";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { cancelarVenda } from "@/features/vendas/actions";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";

// Ação destrutiva em dois passos: abrir pede o motivo; só o segundo botão cancela.
export function CancelarVendaForm({ vendaId, numero }: { vendaId: string; numero: number }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(async (anterior: EstadoFormulario, formData: FormData) => {
    const resultado = await cancelarVenda(anterior, formData);
    // Recarrega a página para mostrar a venda já cancelada.
    if (resultado.ok) router.refresh();
    return resultado;
  }, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar } = useEnvioSemReset(acao, estado);

  if (!aberto) {
    return (
      <div className="flex flex-col gap-3">
        <RetornoFormulario estado={estado} />
        <Button variante="perigo" className="self-start" onClick={() => setAberto(true)}>
          Cancelar venda
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-perigo">
      <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <h2 className="text-xl font-semibold text-perigo">Cancelar a venda nº {numero}?</h2>
        <p className="text-texto-suave">Se a venda já foi paga, o estoque dos itens volta e o valor sai do faturamento. Não dá para desfazer.</p>
        <RetornoFormulario estado={estado} />
        <input type="hidden" name="vendaId" value={vendaId} />
        <Campo
          name="motivo"
          rotulo="Motivo do cancelamento"
          required
          minLength={3}
          maxLength={200}
          autoComplete="off"
          autoFocus
          dica="Ex.: cliente desistiu, lançado em dobro."
          erro={erro.motivo ?? erro.vendaId}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variante="perigo" carregando={enviando} textoCarregando="Cancelando…">
            Confirmar cancelamento
          </Button>
          <Button variante="fantasma" disabled={enviando} onClick={() => setAberto(false)}>
            Voltar
          </Button>
        </div>
      </form>
    </Card>
  );
}
