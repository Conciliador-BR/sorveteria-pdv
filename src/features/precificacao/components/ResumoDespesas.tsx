import { Aviso } from "@/components/ui/Aviso";
import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import { formatarPercentual, PERCENTUAL_MAXIMO, type despesasSobreVenda } from "../regras";

type ResumoDespesasProps = {
  despesas: ReturnType<typeof despesasSobreVenda>;
  custosMensaisCentavos: number;
  temFaturamento: boolean;
};

// Quanto de cada R$ 100 vendidos já tem dono antes do lucro.
export function ResumoDespesas({ despesas, custosMensaisCentavos, temFaturamento }: ResumoDespesasProps) {
  const { detalheImposto } = despesas;
  const das = detalheImposto.fixoMensalCentavos;
  const rotuloImposto = detalheImposto.simples
    ? `Imposto (Simples, faixa ${detalheImposto.simples.faixa})`
    : das > 0
      ? "Imposto (MEI: o DAS está nos custos fixos)"
      : "Imposto";
  const linhas = [
    {
      rotulo: `Custos fixos e máquinas (${formatarReais(custosMensaisCentavos)}/mês${das > 0 ? ` + DAS ${formatarReais(das)}` : ""})`,
      valor: despesas.fixo,
    },
    { rotulo: rotuloImposto, valor: despesas.imposto },
    { rotulo: "Taxa de cartão (só na parte em cartão)", valor: despesas.cartao },
    { rotulo: "Perdas", valor: despesas.perdas },
  ];
  const arredondar = (valor: number) => Math.round(valor);

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Para onde vai cada venda</h2>
      <p className="text-sm text-texto-suave">Antes do lucro, cada venda precisa pagar estas despesas:</p>
      <dl className="flex flex-col gap-2">
        {linhas.map((linha) => (
          <div key={linha.rotulo} className="flex justify-between gap-3 border-b border-borda pb-2">
            <dt>{linha.rotulo}</dt>
            <dd className="font-semibold tabular-nums">{formatarPercentual(arredondar(linha.valor))}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 pt-1 text-xl">
          <dt className="font-semibold">Total</dt>
          <dd className="font-bold tabular-nums">{formatarPercentual(arredondar(despesas.total))}</dd>
        </div>
      </dl>
      {!temFaturamento && custosMensaisCentavos + das > 0 ? (
        <Aviso tipo="info">Informe quanto a loja vende por mês para os custos fixos entrarem no preço.</Aviso>
      ) : null}
      {despesas.total >= PERCENTUAL_MAXIMO ? (
        <Aviso tipo="erro">As despesas passam de 100% da venda: nenhum preço cobre. Confira os valores.</Aviso>
      ) : null}
    </Card>
  );
}
