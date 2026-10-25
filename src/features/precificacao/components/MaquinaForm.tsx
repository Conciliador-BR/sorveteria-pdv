"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarMaquina } from "../actions";
import type { MaquinaLista } from "../queries";

export function MaquinaForm({ maquina }: { maquina?: MaquinaLista }) {
  const [estado, acao, enviando] = useActionState(salvarMaquina, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: !maquina });

  return (
    <form key={maquina ? undefined : chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="id" value={maquina?.id ?? ""} />
      <Campo name="nome" rotulo="Nome" defaultValue={maquina?.nome} maxLength={60} autoComplete="off" required dica="Ex.: Produtora de sorvete, Freezer, Balança." erro={erro.nome} />
      <CampoDinheiro name="valorCompraCentavos" rotulo="Quanto custou" valorInicialCentavos={maquina?.valorCompraCentavos} required erro={erro.valorCompraCentavos} />
      <Campo
        name="vidaUtilAnos"
        rotulo="Quantos anos ela deve durar"
        inputMode="numeric"
        defaultValue={maquina ? Math.round(maquina.vidaUtilMeses / 12) : undefined}
        required
        dica="Máquinas e freezers costumam durar de 5 a 10 anos."
        erro={erro.vidaUtilAnos}
      />
      <CampoDinheiro
        name="valorResidualCentavos"
        rotulo="Por quanto venderia no fim (opcional)"
        valorInicialCentavos={maquina?.valorResidualCentavos}
        dica="Se não souber, deixe vazio."
        erro={erro.valorResidualCentavos}
      />
      <Button type="submit" variante={maquina ? "primario" : "secundario"} carregando={enviando} textoCarregando="Salvando…">
        {maquina ? "Salvar máquina" : "Cadastrar máquina"}
      </Button>
    </form>
  );
}
