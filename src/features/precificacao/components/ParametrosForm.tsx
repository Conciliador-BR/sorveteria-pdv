"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { formatarReais } from "@/lib/dinheiro";
import type { EstadoFormulario } from "@/lib/formulario";
import { useEnvioSemReset } from "@/lib/useEnvioSemReset";
import { salvarParametros } from "../actions";
import { formatarPercentual, percentualParaCampo, type Parametros } from "../regras";

type ParametrosFormProps = {
  parametros: Parametros & { margemPadraoPercentual: number };
  /** Vendas concluídas dos últimos 30 dias, como referência. */
  ultimos30Dias: { faturamentoCentavos: number; cartaoCentavos: number };
};

function CampoPercentual({ name, rotulo, valor, dica, erro }: { name: string; rotulo: string; valor: number; dica: string; erro?: string }) {
  return <Campo name={name} rotulo={`${rotulo} (%)`} inputMode="decimal" autoComplete="off" defaultValue={percentualParaCampo(valor)} required dica={dica} erro={erro} />;
}

export function ParametrosForm({ parametros, ultimos30Dias }: ParametrosFormProps) {
  const [estado, acao, enviando] = useActionState(salvarParametros, {} as EstadoFormulario);
  const erro = estado.campos ?? {};
  const { formRef, enviar } = useEnvioSemReset(acao, estado);
  const parteCartao30 = ultimos30Dias.faturamentoCentavos > 0 ? Math.round((ultimos30Dias.cartaoCentavos * 100) / ultimos30Dias.faturamentoCentavos) * 100 : null;

  return (
    <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <CampoDinheiro
        name="faturamentoMensalCentavos"
        rotulo="Quanto a loja vende por mês, em média"
        valorInicialCentavos={parametros.faturamentoMensalCentavos ?? undefined}
        dica={`Serve para dividir os custos fixos entre as vendas. Nos últimos 30 dias o sistema registrou ${formatarReais(ultimos30Dias.faturamentoCentavos)}.`}
        erro={erro.faturamentoMensalCentavos}
      />
      <CampoPercentual
        name="impostoPercentual"
        rotulo="Imposto sobre a venda"
        valor={parametros.impostoPercentual}
        dica="No Simples Nacional costuma ficar entre 4% e 8%. Confirme com o seu contador."
        erro={erro.impostoPercentual}
      />
      <CampoPercentual
        name="taxaCartaoPercentual"
        rotulo="Taxa da maquininha"
        valor={parametros.taxaCartaoPercentual}
        dica="Uma média entre débito e crédito. Ex.: débito 1,5% e crédito 3% → use uns 2,5%."
        erro={erro.taxaCartaoPercentual}
      />
      <CampoPercentual
        name="parteCartaoPercentual"
        rotulo="Quanto das vendas é no cartão"
        valor={parametros.parteCartaoPercentual}
        dica={
          parteCartao30 === null
            ? "A taxa só vale para essa parte. Pix e dinheiro não pagam taxa."
            : `A taxa só vale para essa parte. Nos últimos 30 dias, ${formatarPercentual(parteCartao30)} foi no cartão.`
        }
        erro={erro.parteCartaoPercentual}
      />
      <CampoPercentual
        name="perdasPercentual"
        rotulo="Perdas"
        valor={parametros.perdasPercentual}
        dica="Sorvete que derrete, cai ou vence. Se não souber, comece com 2% ou 3%."
        erro={erro.perdasPercentual}
      />
      <CampoPercentual
        name="margemPadraoPercentual"
        rotulo="Margem de lucro padrão"
        valor={parametros.margemPadraoPercentual}
        dica="Vale para todo produto que não tiver uma margem própria."
        erro={erro.margemPadraoPercentual}
      />
      <Button type="submit" carregando={enviando} textoCarregando="Salvando…">
        Salvar
      </Button>
    </form>
  );
}
