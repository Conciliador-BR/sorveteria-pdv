"use client";

import { useRef, useState } from "react";
import { adicionarAoCarrinho, alterarQuantidade, carrinhoPronto, definirPeso, totalDoCarrinho, type LinhaCarrinho, type ProdutoVenda } from "./regras";

// Carrinho em memória da tela. Nada vai ao servidor até o envio.
export function useCarrinho() {
  const [linhas, setLinhas] = useState<LinhaCarrinho[]>([]);
  const contador = useRef(0);

  return {
    linhas,
    totalCentavos: totalDoCarrinho(linhas),
    pronto: carrinhoPronto(linhas),
    adicionar(produto: ProdutoVenda) {
      contador.current += 1;
      const chave = `linha-${contador.current}`;
      setLinhas((atual) => adicionarAoCarrinho(atual, produto, chave));
    },
    alterarQuantidade(chave: string, quantidade: number) {
      setLinhas((atual) => alterarQuantidade(atual, chave, quantidade));
    },
    definirPeso(chave: string, pesoGramas: number | null) {
      setLinhas((atual) => definirPeso(atual, chave, pesoGramas));
    },
    remover(chave: string) {
      setLinhas((atual) => atual.filter((linha) => linha.chave !== chave));
    },
    limpar() {
      setLinhas([]);
    },
  };
}

export type Carrinho = ReturnType<typeof useCarrinho>;
