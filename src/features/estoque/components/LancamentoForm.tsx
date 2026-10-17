"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { lancarEstoque } from "../actions";
import type { SaldoProduto } from "../queries";
import { CamposLancamento } from "./CamposLancamento";

export function LancamentoForm({ produtos }: { produtos: SaldoProduto[] }) {
  const [estado, acao, enviando] = useActionState(lancarEstoque, {} as EstadoFormulario);
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: true });

  if (produtos.length === 0) {
    return <p className="text-texto-suave">Cadastre um produto ativo antes de lançar estoque.</p>;
  }

  return (
    // A key limpa o formulário depois de um lançamento com sucesso.
    <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <CamposLancamento produtos={produtos} erros={estado.campos ?? {}} />
      <Button type="submit" carregando={enviando} textoCarregando="Lançando…">
        Registrar lançamento
      </Button>
    </form>
  );
}
