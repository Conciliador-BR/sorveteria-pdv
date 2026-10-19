"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarProduto } from "../actions";
import type { ProdutoLista } from "../queries";
import { CamposProduto } from "./CamposProduto";

type ProdutoFormProps = {
  /** Sem produto = cadastro novo. */
  produto?: ProdutoLista;
  categorias: { id: string; nome: string; ativo: boolean }[];
};

export function ProdutoForm({ produto, categorias }: ProdutoFormProps) {
  const [estado, acao, enviando] = useActionState(salvarProduto, {} as EstadoFormulario);
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: !produto });

  return (
    <form key={produto ? "produto" : chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <CamposProduto produto={produto} categorias={categorias} erros={estado.campos ?? {}} />
      <Button type="submit" carregando={enviando} textoCarregando="Salvando…">
        {produto ? "Salvar alterações" : "Cadastrar produto"}
      </Button>
    </form>
  );
}
