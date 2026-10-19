"use client";

import { useRef, useState } from "react";
import {
  adicionarAoCarrinho,
  alterarQuantidade,
  carrinhoPronto,
  definirModoPeso,
  definirPeso,
  definirValorPeso,
  totalDoCarrinho,
  type LinhaCarrinho,
  type ModoPeso,
  type ProdutoVenda,
} from "./regras";

// Carrinho em memória da tela. Nada vai ao servidor até o envio.
export function useCarrinho() {
  const [linhas, setLinhas] = useState<LinhaCarrinho[]>([]);
  // Último modo escolhido (gramas ou valor) vale para o próximo produto por peso, inclusive na venda seguinte.
  const [modoPeso, setModoPeso] = useState<ModoPeso>("gramas");
  const contador = useRef(0);

  return {
    linhas,
    totalCentavos: totalDoCarrinho(linhas),
    pronto: carrinhoPronto(linhas),
    adicionar(produto: ProdutoVenda) {
      contador.current += 1;
      const chave = `linha-${contador.current}`;
      setLinhas((atual) => adicionarAoCarrinho(atual, produto, chave, modoPeso));
    },
    alterarQuantidade(chave: string, quantidade: number) {
      setLinhas((atual) => alterarQuantidade(atual, chave, quantidade));
    },
    definirPeso(chave: string, pesoGramas: number | null) {
      setLinhas((atual) => definirPeso(atual, chave, pesoGramas));
    },
    definirModoPeso(chave: string, modo: ModoPeso) {
      setModoPeso(modo);
      setLinhas((atual) => definirModoPeso(atual, chave, modo));
    },
    definirValorPeso(chave: string, valorCentavos: number | null) {
      setLinhas((atual) => definirValorPeso(atual, chave, valorCentavos));
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
