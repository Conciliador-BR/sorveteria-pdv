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
          {carrinho.linhas.map((linha) => (
            <LinhaDoCarrinho
              key={linha.chave}
              linha={linha}
              aoAlterarQuantidade={(quantidade) => carrinho.alterarQuantidade(linha.chave, quantidade)}
              aoDefinirPeso={(peso) => carrinho.definirPeso(linha.chave, peso)}
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
