import { Aviso } from "@/components/ui/Aviso";
import { Card } from "@/components/ui/Card";
import type { CaixaDetalhe, ResumoCaixa } from "../queries";
import { ConferenciaCaixa } from "./ConferenciaCaixa";
import { DataHora } from "./DataHora";
import { LinhaValor } from "./LinhaValor";
import { TotaisPorForma } from "./TotaisPorForma";

// Resultado de um fechamento: conferência da gaveta, observação e vendas por forma e bandeira.
export function ResumoFechamento({ caixa, resumo }: { caixa: CaixaDetalhe; resumo: ResumoCaixa }) {
  const fechado = caixa.status === "fechado" && caixa.esperadoCentavos !== null && caixa.contadoCentavos !== null;
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Caixa de {caixa.funcionario}</h2>
          <p className="text-texto-suave">
            Aberto em <DataHora valor={caixa.abertoEm} />
            {caixa.fechadoEm ? (
              <>
                {" "}· fechado em <DataHora valor={caixa.fechadoEm} />
              </>
            ) : null}{" "}
            · {resumo.quantidadeVendas === 1 ? "1 venda" : `${resumo.quantidadeVendas} vendas`}
          </p>
        </div>
        {fechado ? (
          <ConferenciaCaixa esperadoCentavos={caixa.esperadoCentavos ?? 0} contadoCentavos={caixa.contadoCentavos ?? 0} />
        ) : (
          <Aviso tipo="info">
            {caixa.reabertoEm ? "Este caixa foi reaberto pelo dono e está aberto. " : "Este caixa ainda está aberto. "}A conferência aparece no
            fechamento.
          </Aviso>
        )}
        {caixa.observacao ? (
          <div>
            <h3 className="text-base font-semibold">Observação</h3>
            <p className="whitespace-pre-line">{caixa.observacao}</p>
          </div>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-6">
        <section aria-labelledby="titulo-gaveta-fechamento">
          <h3 id="titulo-gaveta-fechamento" className="mb-2 text-base font-semibold">
            Gaveta
          </h3>
          <dl className="divide-y divide-borda">
            <LinhaValor rotulo="Fundo de troco" centavos={caixa.fundoCentavos} />
            <LinhaValor rotulo="+ Vendas em dinheiro" centavos={resumo.pagamentos.porForma.dinheiro} />
            <LinhaValor rotulo="+ Suprimentos" centavos={resumo.suprimentosCentavos} />
            <LinhaValor rotulo="− Sangrias" centavos={resumo.sangriasCentavos} />
          </dl>
        </section>
        <TotaisPorForma pagamentos={resumo.pagamentos} />
      </Card>
    </div>
  );
}
