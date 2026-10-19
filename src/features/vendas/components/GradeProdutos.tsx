"use client";

import { Search } from "lucide-react";
import { useState, type Ref } from "react";
import { Campo } from "@/components/ui/Campo";
import { formatarReais } from "@/lib/dinheiro";
import type { ProdutoParaVenda } from "../queries";

type GradeProdutosProps = {
  produtos: ProdutoParaVenda[];
  aoEscolher: (produto: ProdutoParaVenda) => void;
  /** Para a tela devolver o foco à busca (ex.: "Nova venda"). */
  refBusca?: Ref<HTMLInputElement>;
};

const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

function agruparPorCategoria(produtos: ProdutoParaVenda[]) {
  const grupos = new Map<string, ProdutoParaVenda[]>();
  for (const produto of produtos) {
    const nome = produto.categoria ?? "Sem categoria";
    grupos.set(nome, [...(grupos.get(nome) ?? []), produto]);
  }
  return [...grupos];
}

export function GradeProdutos({ produtos, aoEscolher, refBusca }: GradeProdutosProps) {
  const [busca, setBusca] = useState("");
  const termo = normalizar(busca);
  const filtrados = termo
    ? produtos.filter((produto) => normalizar(produto.nome).includes(termo) || normalizar(produto.codigo ?? "") === termo)
    : produtos;
  const grupos = agruparPorCategoria(filtrados);

  function escolher(produto: ProdutoParaVenda) {
    aoEscolher(produto);
    setBusca("");
  }

  return (
    <section aria-labelledby="titulo-produtos" className="flex min-w-0 flex-col gap-4">
      <h2 id="titulo-produtos" className="sr-only">
        Produtos
      </h2>
      <div className="relative">
        <Campo
          ref={refBusca}
          rotulo="Buscar produto"
          type="search"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          onKeyDown={(evento) => {
            // Enter com um só resultado (ou código exato) já lança o produto.
            if (evento.key !== "Enter" || !termo) return;
            evento.preventDefault();
            const exato = filtrados.find((produto) => normalizar(produto.codigo ?? "") === termo);
            const escolhido = exato ?? (filtrados.length === 1 ? filtrados[0] : undefined);
            if (escolhido) escolher(escolhido);
          }}
          placeholder="Nome ou código"
          autoComplete="off"
          dica="Enter lança o produto quando só um aparece."
          className="pl-10"
        />
        <Search aria-hidden="true" className="pointer-events-none absolute top-10 left-3 size-5 text-texto-suave" />
      </div>

      {produtos.length === 0 ? (
        <p className="rounded-card border border-borda bg-superficie p-6 text-texto-suave">
          Nenhum produto ativo. Peça a quem gerencia produtos para cadastrar.
        </p>
      ) : grupos.length === 0 ? (
        <p role="status" className="rounded-card border border-borda bg-superficie p-6 text-texto-suave">
          Nenhum produto encontrado para “{busca}”.
        </p>
      ) : (
        grupos.map(([categoria, lista]) => (
          <section key={categoria} aria-label={categoria} className="flex flex-col gap-2">
            <h3 className="text-xl text-primaria-escura">{categoria}</h3>
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {lista.map((produto) => (
                <li key={produto.id}>
                  <button
                    type="button"
                    onClick={() => escolher(produto)}
                    className="flex min-h-20 w-full flex-col items-start justify-between gap-1 rounded-card border-2 border-borda bg-superficie p-3 text-left shadow-suave transition-colors hover:border-primaria hover:bg-primaria-suave active:translate-y-px"
                  >
                    <span className="font-semibold">{produto.nome}</span>
                    <span className="text-sm font-semibold text-primaria-escura tabular-nums">
                      {formatarReais(produto.precoCentavos)}
                      {produto.tipoVenda === "peso" ? (
                        <>
                          <span aria-hidden="true">/kg</span>
                          <span className="sr-only"> o quilo, por peso</span>
                        </>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}
