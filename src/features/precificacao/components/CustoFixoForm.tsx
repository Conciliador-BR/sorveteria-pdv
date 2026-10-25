"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarCustoFixo } from "../actions";
import type { CustoFixoLista } from "../queries";

export function CustoFixoForm({ custo }: { custo?: CustoFixoLista }) {
  const [estado, acao, enviando] = useActionState(salvarCustoFixo, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: !custo });

  return (
    <form key={custo ? undefined : chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="id" value={custo?.id ?? ""} />
      <Campo name="nome" rotulo="Nome" defaultValue={custo?.nome} maxLength={60} autoComplete="off" required dica="Ex.: Aluguel, Energia, Salários, Internet, Contador." erro={erro.nome} />
      <CampoDinheiro name="valorMensalCentavos" rotulo="Valor por mês" valorInicialCentavos={custo?.valorMensalCentavos} required erro={erro.valorMensalCentavos} />
      <Button type="submit" variante={custo ? "primario" : "secundario"} carregando={enviando} textoCarregando="Salvando…">
        {custo ? "Salvar custo" : "Cadastrar custo"}
      </Button>
    </form>
  );
}
