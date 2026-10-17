import { Aviso } from "@/components/ui/Aviso";
import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import type { ResumoCaixa as Resumo } from "../queries";
import { DataHora } from "./DataHora";
import { LinhaValor } from "./LinhaValor";
import { TotaisPorForma } from "./TotaisPorForma";

type ResumoCaixaProps = { abertoEm: Date; semFundo: boolean; resumo: Resumo };

// Situação do caixa aberto: dinheiro esperado em destaque, movimentos da gaveta e vendas por forma.
export function ResumoCaixa({ abertoEm, semFundo, resumo }: ResumoCaixaProps) {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="titulo-resumo" className="text-xl font-semibold">
            Caixa aberto
          </h2>
          <p className="text-texto-suave">
            Desde <DataHora valor={abertoEm} /> · {resumo.quantidadeVendas === 1 ? "1 venda" : `${resumo.quantidadeVendas} vendas`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-texto-suave">Dinheiro esperado na gaveta</p>
          <p className="text-total font-bold text-primaria-escura tabular-nums">{formatarReais(resumo.esperadoCentavos)}</p>
        </div>
      </div>

      {resumo.comandasAbertas > 0 ? (
        <Aviso tipo="info">
          {resumo.comandasAbertas === 1 ? "1 comanda aberta" : `${resumo.comandasAbertas} comandas abertas`} neste caixa. O caixa só fecha depois de cobrar ou cancelar.
        </Aviso>
      ) : null}

      <section aria-labelledby="titulo-gaveta">
        <h3 id="titulo-gaveta" className="mb-2 text-base font-semibold">
          Gaveta
        </h3>
        <dl className="divide-y divide-borda">
          <LinhaValor rotulo={semFundo ? "Fundo de troco (aberto sem fundo)" : "Fundo de troco"} centavos={resumo.fundoCentavos} />
          <LinhaValor rotulo="+ Vendas em dinheiro" centavos={resumo.pagamentos.porForma.dinheiro} />
          <LinhaValor rotulo="+ Suprimentos" centavos={resumo.suprimentosCentavos} />
          <LinhaValor rotulo="− Sangrias" centavos={resumo.sangriasCentavos} />
          <LinhaValor rotulo="= Esperado na gaveta" centavos={resumo.esperadoCentavos} className="font-semibold" />
        </dl>
      </section>

      <TotaisPorForma pagamentos={resumo.pagamentos} />
    </Card>
  );
}
