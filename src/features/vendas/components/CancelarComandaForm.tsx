"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { cancelarVenda } from "../actions";

// Só aparece para quem tem pode_cancelar_venda; o servidor confere de novo.
export function CancelarComandaForm({ vendaId }: { vendaId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(async (anterior: EstadoFormulario, formData: FormData) => {
    const resultado = await cancelarVenda(anterior, formData);
    if (resultado.ok) router.push("/comandas");
    return resultado;
  }, {} as EstadoFormulario);
  const { formRef, enviar } = useEnvioSemReset(acao, estado);

  if (!aberto) {
    return (
      <Button variante="fantasma" className="self-start text-perigo" onClick={() => setAberto(true)}>
        Cancelar comanda
      </Button>
    );
  }

  return (
    <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-3 rounded-card border-2 border-perigo bg-perigo-suave p-4" noValidate>
      <input type="hidden" name="vendaId" value={vendaId} />
      <p className="font-semibold text-perigo">Cancelar a comanda inteira? Os itens são descartados e o cancelamento fica registrado.</p>
      {estado.erro ? (
        <Aviso key={estado.envio} tipo="erro">
          {estado.erro}
        </Aviso>
      ) : null}
      <Campo name="motivo" rotulo="Motivo do cancelamento" autoFocus required maxLength={200} autoComplete="off" erro={estado.campos?.motivo} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variante="perigo" carregando={enviando} textoCarregando="Cancelando…">
          Confirmar cancelamento
        </Button>
        <Button variante="fantasma" disabled={enviando} onClick={() => setAberto(false)}>
          Voltar
        </Button>
      </div>
    </form>
  );
}
