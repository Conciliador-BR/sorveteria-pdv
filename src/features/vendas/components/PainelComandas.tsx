import type { ComandaAberta } from "../queries";
import { AbrirComandaForm } from "./AbrirComandaForm";
import { CartaoComanda } from "./CartaoComanda";

type PainelComandasProps = { comandas: ComandaAberta[]; podeAbrir: boolean };

// Faixa compacta de comandas no topo do PDV: o funcionário vê as contas da loja sem sair do balcão.
export function PainelComandas({ comandas, podeAbrir }: PainelComandasProps) {
  return (
    <section
      aria-labelledby="titulo-comandas"
      className="grid shrink-0 items-center gap-3 rounded-card border border-borda bg-superficie p-3 shadow-suave lg:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <h2 id="titulo-comandas" className="shrink-0 text-base font-semibold">
          Comandas
          <span className="ml-1.5 rounded-full bg-acento px-2 py-0.5 text-sm tabular-nums">{comandas.length}</span>
        </h2>
        {comandas.length === 0 ? (
          <p className="text-texto-suave">Nenhuma comanda aberta agora.</p>
        ) : (
          // Rolagem lateral: muitas comandas não empurram os produtos para baixo.
          // Folga em volta para o contorno de foco dos cartões não ser cortado pela rolagem.
          <ul className="-m-1.5 flex min-w-0 snap-x gap-2 overflow-x-auto p-1.5">
            {comandas.map((comanda) => (
              <li key={comanda.id} className="w-48 shrink-0 snap-start">
                <CartaoComanda comanda={comanda} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {podeAbrir ? <AbrirComandaForm /> : null}
    </section>
  );
}
