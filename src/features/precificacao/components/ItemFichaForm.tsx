"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarItemFicha } from "../actions-ficha";
import type { InsumoLista } from "../queries";
import { rotuloUnidade } from "../regras";

// Põe um insumo na receita. Se ele já estiver lá, troca a quantidade.
export function ItemFichaForm({ produtoId, insumos }: { produtoId: string; insumos: InsumoLista[] }) {
  const [estado, acao, enviando] = useActionState(salvarItemFicha, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: true });

  return (
    <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-3" noValidate>
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="produtoId" value={produtoId} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Selecao name="insumoId" rotulo="Insumo" defaultValue="" erro={erro.insumoId}>
          <option value="" disabled>
            Escolha…
          </option>
          {insumos.map((insumo) => (
            <option key={insumo.id} value={insumo.id}>
              {insumo.nome} ({rotuloUnidade(insumo.unidade)})
            </option>
          ))}
        </Selecao>
        <Campo name="quantidade" rotulo="Quantidade na receita" inputMode="numeric" autoComplete="off" required erro={erro.quantidade} />
      </div>
      <Button type="submit" variante="secundario" className="self-start" carregando={enviando} textoCarregando="Salvando…">
        Pôr na ficha
      </Button>
    </form>
  );
}
