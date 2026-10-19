import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import type { VendaLista } from "../queries";
import { LinhaVenda } from "./LinhaVenda";

type ListaVendasProps = {
  vendas: VendaLista[];
  /** Quantas a consulta traz no máximo; ao bater o limite, avisa para refinar. */
  limite: number;
  /** Filtro por forma de pagamento ou bandeira ativo: o total soma a venda inteira, não só a parte daquela forma. */
  filtroDePagamento?: boolean;
};

export function ListaVendas({ vendas, limite, filtroDePagamento = false }: ListaVendasProps) {
  if (vendas.length === 0) {
    return (
      <Card>
        <p className="font-semibold">Nenhuma venda encontrada.</p>
        <p className="text-texto-suave">Troque o período ou tire algum filtro para ver mais vendas.</p>
      </Card>
    );
  }

  const concluidas = vendas.filter((venda) => venda.status === "concluida");
  const total = concluidas.reduce((soma, venda) => soma + venda.totalCentavos, 0);

  return (
    <section aria-labelledby="titulo-lista-vendas" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-lista-vendas" className="text-xl font-semibold">
          {vendas.length} {vendas.length === 1 ? "venda" : "vendas"}
        </h2>
        <p className="text-texto-suave">
          Total das vendas listadas (concluídas): <span className="font-semibold text-texto tabular-nums">{formatarReais(total)}</span>
        </p>
      </div>
      {filtroDePagamento ? (
        <p className="text-sm text-texto-suave">
          Com o filtro de pagamento, o total inclui o valor inteiro de cada venda, mesmo a parte paga de outra forma.
        </p>
      ) : null}
      {vendas.length >= limite ? (
        <p className="text-sm text-texto-suave">Mostrando as {limite} mais recentes. Diminua o período para ver as demais.</p>
      ) : null}
      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-borda">
          {vendas.map((venda) => (
            <LinhaVenda key={venda.id} venda={venda} />
          ))}
        </ul>
      </Card>
    </section>
  );
}
