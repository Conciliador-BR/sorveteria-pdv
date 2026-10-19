"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { CaixaSelecao } from "@/components/ui/CaixaSelecao";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { editarBandeira } from "../actions";
import type { BandeiraLista } from "../queries";

export function EditarBandeiraForm({ bandeira }: { bandeira: BandeiraLista }) {
  const [estado, acao, enviando] = useActionState(editarBandeira, {} as EstadoFormulario);
  const { formRef, enviar } = useEnvioSemReset(acao, estado);

  return (
    <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="id" value={bandeira.id} />
      <Campo
        name="nome"
        rotulo="Nome"
        defaultValue={bandeira.nome}
        maxLength={30}
        autoComplete="off"
        required
        dica="O novo nome também aparece nas vendas antigas dessa bandeira."
        erro={estado.campos?.nome}
      />
      <CaixaSelecao
        name="ativo"
        rotulo="Ativa"
        dica="Desmarque para tirar dos cards de pagamento. As vendas antigas e o filtro do histórico continuam com ela."
        defaultChecked={bandeira.ativo}
      />
      <Button type="submit" carregando={enviando} textoCarregando="Salvando…">
        Salvar bandeira
      </Button>
    </form>
  );
}
