"use client";

import type { ReactNode } from "react";
import { formatarReais } from "@/lib/dinheiro";
import type { Carrinho as EstadoCarrinho } from "../useCarrinho";
import { LinhaDoCarrinho } from "./LinhaDoCarrinho";

type CarrinhoProps = {
  titulo: string;
  rotuloTotal: string;
  carrinho: EstadoCarrinho;
  vazio: string;
  /** Botões de ação abaixo do total ("Cobrar", "Lançar na comanda"). */
  children?: ReactNode;
};

// Mesmo produto por peso em várias linhas (um copo cada): "copo 1", "copo 2"... para os rótulos não se repetirem.
function sufixoDoCopo(linhas: EstadoCarrinho["linhas"], indice: number) {
  const { produto } = linhas[indice];
  if (produto.tipoVenda !== "peso") return undefined;
  const mesmas = linhas.filter((linha) => linha.produto.id === produto.id);
  if (mesmas.length < 2) return undefined;
  return `copo ${linhas.slice(0, indice + 1).filter((linha) => linha.produto.id === produto.id).length}`;
}

export function Carrinho({ titulo, rotuloTotal, carrinho, vazio, children }: CarrinhoProps) {
  const quantidadeItens = carrinho.linhas.length;

  // Cupom do caixa: faixa escura com o título, itens como na nota e o total grande num visor escuro.
  return (
    <section aria-labelledby="titulo-carrinho" className="flex h-full flex-col overflow-hidden rounded-card border border-borda bg-superficie shadow-elevada">
      <div className="flex items-center justify-between gap-2 bg-tinta px-4 py-3 text-superficie">
        <h2 id="titulo-carrinho" className="text-xl font-semibold">
          {titulo}
        </h2>
        <span className="text-sm text-superficie/75 tabular-nums">
          {quantidadeItens === 1 ? "1 item" : `${quantidadeItens} itens`}
        </span>
      </div>
      {/* Itens rolam por dentro; total e botões ficam sempre à vista no pé do cupom. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        {quantidadeItens === 0 ? (
          <p className="grid flex-1 place-items-center rounded-campo border-2 border-dashed border-borda px-4 py-8 text-center text-texto-suave">{vazio}</p>
        ) : (
          <ul className="-mx-4 flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
            {carrinho.linhas.map((linha, indice) => (
              <LinhaDoCarrinho
                key={linha.chave}
                linha={linha}
                sufixo={sufixoDoCopo(carrinho.linhas, indice)}
                aoAlterarQuantidade={(quantidade) => carrinho.alterarQuantidade(linha.chave, quantidade)}
                aoDefinirPeso={(peso) => carrinho.definirPeso(linha.chave, peso)}
                aoDefinirModoPeso={(modo) => carrinho.definirModoPeso(linha.chave, modo)}
                aoDefinirValorPeso={(valor) => carrinho.definirValorPeso(linha.chave, valor)}
                aoRemover={() => carrinho.remover(linha.chave)}
              />
            ))}
          </ul>
        )}
        {/* Mesmo formato do TotalDestaque (rótulo e valor juntos, ao vivo), em visor escuro. */}
        <div aria-live="polite" aria-atomic="true" className="flex shrink-0 flex-col rounded-card bg-tinta px-4 py-3 text-right">
          <span className="text-sm font-semibold text-superficie/75">{rotuloTotal}</span>
          <span className="text-total font-bold text-acento tabular-nums">{formatarReais(carrinho.totalCentavos)}</span>
        </div>
        {children}
      </div>
    </section>
  );
}
