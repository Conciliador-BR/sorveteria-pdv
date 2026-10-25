"use client";

import { useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { Selecao } from "@/components/ui/Selecao";
import { formatarReais } from "@/lib/dinheiro";
import { aliquotaSimples, receitaDoze, type ParametrosImposto, type RegimeImposto } from "../imposto";
import { formatarPercentual, percentualParaCampo } from "../regras";

type CamposImpostoProps = {
  parametros: ParametrosImposto;
  /** Vendas concluídas nos últimos 12 meses, como referência. */
  vendas12MesesCentavos: number;
  erro: Record<string, string>;
};

// Regime de imposto e os campos de cada um. Os campos dos outros regimes ficam escondidos, mas vão no envio.
export function CamposImposto({ parametros, vendas12MesesCentavos, erro }: CamposImpostoProps) {
  const [regime, setRegime] = useState<RegimeImposto>(parametros.regime);
  const [anexo, setAnexo] = useState(parametros.anexoSimples);
  const [receita, setReceita] = useState(parametros.receita12MesesCentavos);
  const simples = aliquotaSimples(anexo, receitaDoze({ ...parametros, anexoSimples: anexo, receita12MesesCentavos: receita || null }));

  return (
    <fieldset className="flex flex-col gap-4 rounded-campo border-2 border-borda p-4">
      <legend className="px-1 text-sm font-semibold">Imposto</legend>
      <Selecao name="regimeImposto" rotulo="Como a loja paga imposto" value={regime} onChange={(evento) => setRegime(evento.target.value as RegimeImposto)} erro={erro.regimeImposto}>
        <option value="mei">MEI (DAS fixo todo mês)</option>
        <option value="simples">Simples Nacional (calcular pela tabela)</option>
        <option value="percentual">Outro (eu digito o percentual)</option>
      </Selecao>

      <div hidden={regime !== "simples"} className="flex flex-col gap-4">
        <Selecao name="anexoSimples" rotulo="Anexo do Simples" value={anexo} onChange={(evento) => setAnexo(evento.target.value as "I" | "II")} erro={erro.anexoSimples}>
          <option value="I">Anexo I: comércio (revende o que compra pronto)</option>
          <option value="II">Anexo II: indústria (fabrica o sorvete)</option>
        </Selecao>
        <CampoDinheiro
          name="receita12MesesCentavos"
          rotulo="Quanto a loja vendeu nos últimos 12 meses"
          valorInicialCentavos={parametros.receita12MesesCentavos ?? undefined}
          aoMudar={setReceita}
          dica={`Vazio usa o faturamento médio do mês × 12. O sistema registrou ${formatarReais(vendas12MesesCentavos)} nos últimos 12 meses.`}
          erro={erro.receita12MesesCentavos}
        />
        <p role="status" className="rounded-campo bg-primaria-suave px-3 py-2.5 text-sm font-medium text-primaria-escura">
          {simples.acimaDoLimite
            ? "Acima de R$ 4,8 milhões a loja sai do Simples. Fale com o contador; por enquanto uso a última faixa."
            : `Faixa ${simples.faixa}: alíquota efetiva de ${formatarPercentual(Math.round(simples.efetiva))} sobre cada venda.`}
        </p>
        <p className="text-sm text-texto-suave">Tabela da Lei Complementar 123/2006. O anexo certo depende da atividade da loja: confirme com o seu contador.</p>
      </div>

      <div hidden={regime !== "mei"}>
        <CampoDinheiro
          name="dasMensalCentavos"
          rotulo="Valor do DAS do mês"
          valorInicialCentavos={parametros.dasMensalCentavos ?? undefined}
          dica="O boleto mensal do MEI. Ele é um valor fixo, então entra junto dos custos fixos, e não como % da venda."
          erro={erro.dasMensalCentavos}
        />
      </div>

      <div hidden={regime !== "percentual"}>
        <Campo
          name="impostoPercentual"
          rotulo="Imposto sobre a venda (%)"
          inputMode="decimal"
          autoComplete="off"
          defaultValue={percentualParaCampo(parametros.impostoPercentual)}
          required
          dica="Para Lucro Presumido ou outro caso: o percentual que o contador passar."
          erro={erro.impostoPercentual}
        />
      </div>
    </fieldset>
  );
}
