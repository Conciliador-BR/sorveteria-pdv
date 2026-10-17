import { Card } from "@/components/ui/Card";
import { formatarPeso, formatarReais } from "@/lib/dinheiro";
import type { DetalheVenda } from "../queries";

export function ItensDaVenda({ itens }: { itens: DetalheVenda["itens"] }) {
  return (
    <section aria-labelledby="titulo-itens">
      <Card className="p-0">
        <h2 id="titulo-itens" className="px-4 pt-4 text-xl font-semibold">
          Itens
        </h2>
        {itens.length === 0 ? (
          <p className="p-4 text-texto-suave">Nenhum item nesta venda.</p>
        ) : (
          // Rolável no celular: recebe foco pelo teclado para rolar com as setas.
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Itens da venda">
            <table className="w-full text-left">
              <thead className="border-b border-borda text-sm text-texto-suave">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Produto</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Qtd./peso</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Preço</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id} className="border-b border-borda last:border-b-0">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {item.nome}
                      <span className="block text-sm font-normal text-texto-suave">Lançado por {item.lancadoPor}</span>
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.tipoVenda === "peso" && item.pesoGramas ? formatarPeso(item.pesoGramas) : `${item.quantidade} un`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatarReais(item.precoUnitarioCentavos)}
                      {item.tipoVenda === "peso" ? "/kg" : null}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatarReais(item.totalCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
