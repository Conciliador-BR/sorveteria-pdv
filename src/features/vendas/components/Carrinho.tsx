"use client";

import type { ReactNode } from "react";
import type { Carrinho as EstadoCarrinho } from "../useCarrinho";
import { LinhaDoCarrinho } from "./LinhaDoCarrinho";
import { TotalDestaque } from "./TotalDestaque";

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
  return (
    <section aria-labelledby="titulo-carrinho" className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4 shadow-suave">
      <h2 id="titulo-carrinho" className="text-xl font-semibold">
        {titulo}
      </h2>
      {carrinho.linhas.length === 0 ? (
        <p className="py-4 text-texto-suave">{vazio}</p>
      ) : (
        <ul className="flex flex-col">
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
      <TotalDestaque rotulo={rotuloTotal} centavos={carrinho.totalCentavos} className="border-t border-borda pt-3" />
      {children}
    </section>
  );
}
