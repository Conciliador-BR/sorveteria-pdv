import type { DetalheVenda } from "@/features/historico/queries";
import { rotuloForma } from "@/features/historico/rotulos";
import { formatarPeso, formatarReais } from "@/lib/dinheiro";
import { LinhaCupom } from "./LinhaCupom";

type CorpoCupomProps = { detalhe: DetalheVenda; totalCentavos: number; trocoCentavos: number };

// Itens, total e pagamentos: igual no recibo simples e no DANFE NFC-e.
export function CorpoCupom({ detalhe, totalCentavos, trocoCentavos }: CorpoCupomProps) {
  const quantidadeItens = detalhe.itens.reduce((total, item) => total + (item.tipoVenda === "peso" ? 1 : item.quantidade), 0);
  return (
    <>
      <table className="w-full border-y border-dashed border-texto text-left">
        <thead>
          <tr>
            <th scope="col" className="py-1 font-semibold">Item</th>
            <th scope="col" className="py-1 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {detalhe.itens.map((item, indice) => (
            <tr key={item.id} className="align-top">
              <td className="py-0.5 pr-2">
                {String(indice + 1).padStart(3, "0")} {item.nome}
                <span className="block">
                  {item.tipoVenda === "peso" && item.pesoGramas
                    ? `${formatarPeso(item.pesoGramas)} × ${formatarReais(item.precoUnitarioCentavos)}/kg`
                    : `${item.quantidade} UN × ${formatarReais(item.precoUnitarioCentavos)}`}
                </span>
              </td>
              <td className="py-0.5 text-right whitespace-nowrap tabular-nums">{formatarReais(item.totalCentavos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="flex flex-col">
        <LinhaCupom rotulo="Qtd. total de itens" valor={quantidadeItens} />
        <LinhaCupom rotulo="Valor a pagar" valor={formatarReais(totalCentavos)} destaque />
        {detalhe.pagamentos.map((pagamento) => (
          <LinhaCupom
            key={pagamento.id}
            rotulo={`${rotuloForma(pagamento.forma)}${pagamento.bandeira ? ` ${pagamento.bandeira}` : ""}`}
            valor={formatarReais(pagamento.valorRecebidoCentavos ?? pagamento.valorCentavos)}
          />
        ))}
        {trocoCentavos > 0 ? <LinhaCupom rotulo="Troco" valor={formatarReais(trocoCentavos)} /> : null}
      </dl>
    </>
  );
}
