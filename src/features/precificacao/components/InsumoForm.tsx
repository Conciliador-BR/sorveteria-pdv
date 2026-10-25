"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { Selecao } from "@/components/ui/Selecao";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarInsumo } from "../actions";
import type { InsumoLista } from "../queries";

// Sem `insumo`: cadastro novo (limpa depois de salvar). Com `insumo`: edição.
export function InsumoForm({ insumo }: { insumo?: InsumoLista }) {
  const [estado, acao, enviando] = useActionState(salvarInsumo, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar, chave } = useEnvioSemReset(acao, estado, { focarAposSucesso: !insumo });

  return (
    <form key={insumo ? undefined : chave} ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="id" value={insumo?.id ?? ""} />
      <Campo name="nome" rotulo="Nome" defaultValue={insumo?.nome} maxLength={60} autoComplete="off" required dica="Ex.: Leite integral, Base de chocolate, Casquinha." erro={erro.nome} />
      <Selecao name="unidade" rotulo="Medida usada na receita" defaultValue={insumo?.unidade ?? "g"} erro={erro.unidade}>
        <option value="g">Gramas (g)</option>
        <option value="ml">Mililitros (ml)</option>
        <option value="un">Unidades</option>
      </Selecao>
      <Campo
        name="embalagemQuantidade"
        rotulo="Quanto vem na embalagem"
        inputMode="numeric"
        defaultValue={insumo?.embalagemQuantidade}
        required
        dica="Na medida acima. Ex.: lata de 395 g → 395; 1 litro → 1000; caixa com 100 casquinhas → 100."
        erro={erro.embalagemQuantidade}
      />
      <CampoDinheiro
        name="embalagemPrecoCentavos"
        rotulo="Quanto você pagou pela embalagem"
        valorInicialCentavos={insumo?.embalagemPrecoCentavos}
        required
        erro={erro.embalagemPrecoCentavos}
      />
      <Button type="submit" variante={insumo ? "primario" : "secundario"} carregando={enviando} textoCarregando="Salvando…">
        {insumo ? "Salvar insumo" : "Cadastrar insumo"}
      </Button>
    </form>
  );
}
