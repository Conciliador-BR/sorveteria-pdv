import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import type { DetalheVenda } from "../queries";
import { rotuloForma } from "../rotulos";

type PagamentosDaVendaProps = { pagamentos: DetalheVenda["pagamentos"]; trocoCentavos: number };

export function PagamentosDaVenda({ pagamentos, trocoCentavos }: PagamentosDaVendaProps) {
  return (
    <section aria-labelledby="titulo-pagamentos">
      <Card className="flex flex-col gap-3">
        <h2 id="titulo-pagamentos" className="text-xl font-semibold">
          Pagamento
        </h2>
        {pagamentos.length === 0 ? (
          <p className="text-texto-suave">Ainda não pago (comanda aberta ou venda cancelada antes de cobrar).</p>
        ) : (
          <dl className="divide-y divide-borda">
            {pagamentos.map((pagamento) => (
              <div key={pagamento.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                <dt className="font-medium">
                  {rotuloForma(pagamento.forma)}
                  {pagamento.bandeira ? ` · ${pagamento.bandeira}` : null}
                  {pagamento.valorRecebidoCentavos !== null ? (
                    <span className="block text-sm font-normal text-texto-suave">Recebido {formatarReais(pagamento.valorRecebidoCentavos)}</span>
                  ) : null}
                </dt>
                <dd className="font-semibold tabular-nums">{formatarReais(pagamento.valorCentavos)}</dd>
              </div>
            ))}
            {trocoCentavos > 0 ? (
              <div className="flex items-baseline justify-between gap-x-4 py-2">
                <dt className="font-medium">Troco</dt>
                <dd className="font-semibold tabular-nums">{formatarReais(trocoCentavos)}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </Card>
    </section>
  );
}
