import { Card } from "@/components/ui/Card";
import type { ComandaAberta } from "../queries";
import { AbrirComandaForm } from "./AbrirComandaForm";
import { CartaoComanda } from "./CartaoComanda";

type PainelComandasProps = { comandas: ComandaAberta[]; podeAbrir: boolean };

// Comandas abertas no topo de Vender: o funcionário vê as contas da loja sem sair do balcão.
export function PainelComandas({ comandas, podeAbrir }: PainelComandasProps) {
  return (
    <section aria-labelledby="titulo-comandas" className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <h2 id="titulo-comandas" className="text-xl font-semibold">
          Comandas abertas ({comandas.length})
        </h2>
        {comandas.length === 0 ? (
          <p className="rounded-card border border-borda bg-superficie p-4 text-texto-suave">Nenhuma comanda aberta agora.</p>
        ) : (
          // Faixa com rolagem lateral: muitas comandas não empurram os produtos para baixo.
          // Folga em volta para o contorno de foco dos cartões não ser cortado pela rolagem.
          <ul className="-m-1.5 flex snap-x gap-3 overflow-x-auto p-1.5 pb-3">
            {comandas.map((comanda) => (
              <li key={comanda.id} className="w-64 shrink-0 snap-start">
                <CartaoComanda comanda={comanda} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {podeAbrir ? (
        <Card className="flex flex-col gap-3 p-4">
          {/* No celular e no tablet o cartão fica enxuto (o botão já diz "Abrir comanda") para não empurrar os produtos. */}
          <h2 className="sr-only text-lg font-semibold lg:not-sr-only">Abrir comanda</h2>
          <AbrirComandaForm />
        </Card>
      ) : null}
    </section>
  );
}
