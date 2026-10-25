"use client";

import { Search } from "lucide-react";
import { useState, type Ref } from "react";
import { Campo } from "@/components/ui/Campo";
import { FotoProduto } from "@/features/produtos/components/FotoProduto";
import { formatarReais } from "@/lib/dinheiro";
import { cn } from "@/lib/utils";
import type { ProdutoParaVenda } from "../queries";

type GradeProdutosProps = {
  produtos: ProdutoParaVenda[];
  aoEscolher: (produto: ProdutoParaVenda) => void;
  /** Para a tela devolver o foco à busca (ex.: "Nova venda"). */
  refBusca?: Ref<HTMLInputElement>;
};

const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

const SEM_CATEGORIA = "Sem categoria";
const categoriaDe = (produto: ProdutoParaVenda) => produto.categoria ?? SEM_CATEGORIA;

export function GradeProdutos({ produtos, aoEscolher, refBusca }: GradeProdutosProps) {
  const [busca, setBusca] = useState("");
  // Abas de categoria como no caixa de supermercado; a busca sempre procura em todas.
  const [categoria, setCategoria] = useState<string | null>(null);
  const categorias = [...new Set(produtos.map(categoriaDe))];
  const termo = normalizar(busca);
  const filtrados = termo
    ? produtos.filter((produto) => normalizar(produto.nome).includes(termo) || normalizar(produto.codigo ?? "") === termo)
    : categoria
      ? produtos.filter((produto) => categoriaDe(produto) === categoria)
      : produtos;

  function escolher(produto: ProdutoParaVenda) {
    aoEscolher(produto);
    setBusca("");
  }

  return (
    <section aria-labelledby="titulo-produtos" className="flex min-w-0 flex-col gap-4 md:h-full">
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
          dica="Enter lança o produto quando só um aparece. F2 volta para cá."
          className="pl-10"
        />
        <Search aria-hidden="true" className="pointer-events-none absolute top-10 left-3 size-5 text-texto-suave" />
      </div>

      {categorias.length > 1 ? (
        <div role="group" aria-label="Categorias" className="-m-1 flex gap-2 overflow-x-auto p-1">
          {[null, ...categorias].map((nome) => {
            const ativa = !termo && categoria === nome;
            return (
              <button
                key={nome ?? "todas"}
                type="button"
                aria-pressed={ativa}
                onClick={() => {
                  setCategoria(nome);
                  setBusca("");
                }}
                className={cn(
                  "min-h-12 shrink-0 rounded-full border-2 px-4 font-semibold transition-colors",
                  ativa ? "border-primaria-escura bg-primaria-escura text-superficie" : "border-borda bg-superficie text-texto hover:border-primaria/60",
                )}
              >
                {nome ?? "Todos"}
              </button>
            );
          })}
        </div>
      ) : null}

      {produtos.length === 0 ? (
        <p className="rounded-card border border-borda bg-superficie p-6 text-texto-suave">
          Nenhum produto ativo. Peça a quem gerencia produtos para cadastrar.
        </p>
      ) : filtrados.length === 0 ? (
        <p role="status" className="rounded-card border border-borda bg-superficie p-6 text-texto-suave">
          Nenhum produto encontrado para “{busca}”.
        </p>
      ) : (
        // Com altura definida (PDV do balcão), só a grade rola: busca e categorias ficam paradas no topo.
        // Folga interna para o contorno de foco dos cartões não ser cortado pela rolagem.
        <ul
          aria-label={termo ? "Resultado da busca" : (categoria ?? "Todos os produtos")}
          className="-m-1.5 grid min-h-0 flex-1 auto-rows-max grid-cols-2 gap-3 overflow-y-auto p-1.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {filtrados.map((produto) => (
            <li key={produto.id}>
              <button
                type="button"
                onClick={() => escolher(produto)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-borda bg-superficie text-left shadow-suave transition-all duration-150 hover:-translate-y-0.5 hover:border-primaria/50 hover:shadow-elevada active:scale-[0.98]"
              >
                <FotoProduto produto={produto} />
                <span className="flex flex-1 flex-col justify-between gap-2 p-3">
                  <span className="font-semibold leading-snug">{produto.nome}</span>
                  <span className="self-start rounded-full bg-primaria-suave px-2.5 py-0.5 text-sm font-bold text-primaria-escura tabular-nums">
                    {formatarReais(produto.precoCentavos)}
                    {produto.tipoVenda === "peso" ? (
                      <>
                        <span aria-hidden="true">/kg</span>
                        <span className="sr-only"> o quilo, por peso</span>
                      </>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
