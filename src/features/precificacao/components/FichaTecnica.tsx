import { formatarReais } from "@/lib/dinheiro";
import { removerItemFicha } from "../actions-ficha";
import type { InsumoLista, ItemFichaLista } from "../queries";
import { rotuloUnidade } from "../regras";
import { BotaoExcluir } from "./BotaoExcluir";
import { ItemFichaForm } from "./ItemFichaForm";

// Receita do produto: cada insumo com a quantidade e quanto ele custa nessa quantidade.
export function FichaTecnica({ produtoId, itens, insumos }: { produtoId: string; itens: ItemFichaLista[]; insumos: InsumoLista[] }) {
  const custoItem = (item: ItemFichaLista) => (item.quantidade * item.embalagemPrecoCentavos) / item.embalagemQuantidade;
  const total = itens.reduce((soma, item) => soma + custoItem(item), 0);

  return (
    <div className="flex flex-col gap-3">
      {itens.length === 0 ? (
        <p className="text-sm text-texto-suave">Nenhum insumo na receita ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-borda">
          {itens.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <span className="font-semibold">{item.nome}</span>
              <span className="text-sm text-texto-suave tabular-nums">
                {item.quantidade} {rotuloUnidade(item.unidade)}
              </span>
              <span className="ml-auto tabular-nums">{formatarReais(Math.round(custoItem(item)))}</span>
              <BotaoExcluir acao={removerItemFicha} id={item.id} rotulo="Tirar" />
            </li>
          ))}
          <li className="flex justify-between gap-3 py-2 font-semibold">
            <span>Custo da receita inteira</span>
            <span className="tabular-nums">{formatarReais(Math.round(total))}</span>
          </li>
        </ul>
      )}
      {insumos.length === 0 ? (
        <p className="text-sm text-texto-suave">Cadastre os insumos na aba “Insumos” para montar a receita.</p>
      ) : (
        <ItemFichaForm produtoId={produtoId} insumos={insumos} />
      )}
    </div>
  );
}
