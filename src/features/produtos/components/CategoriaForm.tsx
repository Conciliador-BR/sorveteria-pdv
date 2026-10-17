"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { criarCategoria } from "../actions";

export function CategoriaForm() {
  const [estado, acao, enviando] = useActionState(criarCategoria, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: true });

  return (
    <form key={chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <Campo name="nome" rotulo="Nome da categoria" autoComplete="off" required dica="Ex.: Picolés, Sorvete por kg, Bebidas." erro={erro.nome} />
      <Campo
        name="ordem"
        type="number"
        inputMode="numeric"
        min={0}
        max={999}
        step={1}
        rotulo="Ordem na lista"
        defaultValue={0}
        dica="Números menores aparecem primeiro."
        erro={erro.ordem}
      />
      <Button type="submit" variante="secundario" carregando={enviando} textoCarregando="Criando…">
        Criar categoria
      </Button>
    </form>
  );
}
