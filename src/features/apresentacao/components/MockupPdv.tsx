import { Check, Search } from "lucide-react";

// Ilustração da tela de vendas feita em HTML (sem imagem): leve e sempre nítida.
// Valores fictícios; o conjunto é uma imagem para leitores de tela (role="img").

const produtos = [
  { nome: "Casquinha 1 bola", preco: "R$ 8,00", tom: "bg-secundaria-suave" },
  { nome: "Açaí 500 ml", preco: "R$ 22,00", tom: "bg-primaria-suave" },
  { nome: "Picolé de frutas", preco: "R$ 6,00", tom: "bg-acento-suave" },
  { nome: "Sorvete no peso", preco: "R$ 69,90/kg", tom: "bg-sucesso-suave" },
  { nome: "Milkshake", preco: "R$ 18,00", tom: "bg-acento-suave" },
  { nome: "Taça do Morro", preco: "R$ 29,00", tom: "bg-secundaria-suave" },
];

const itens = [
  { nome: "2× Casquinha 1 bola", preco: "R$ 16,00" },
  { nome: "Açaí 500 ml", preco: "R$ 22,00" },
];

export function MockupPdv() {
  return (
    <div
      role="img"
      aria-label="Exemplo da tela de vendas: produtos à esquerda, venda de R$ 38,00 à direita e troco de R$ 12,00 calculado na hora."
      className="relative mx-auto w-full max-w-xl select-none"
    >
      <div className="overflow-hidden rounded-modal border border-borda bg-superficie shadow-elevada">
        <div className="flex items-center gap-1.5 border-b border-borda bg-fundo px-4 py-3">
          <span className="size-2.5 rounded-full bg-secundaria/70" />
          <span className="size-2.5 rounded-full bg-acento" />
          <span className="size-2.5 rounded-full bg-sucesso" />
          <span className="ml-3 rounded-full bg-superficie px-3 py-0.5 text-xs text-texto-suave">sorveteria · vender</span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-4 sm:p-4">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center gap-2 rounded-campo border border-borda px-3 py-2 text-xs text-texto-suave">
              <Search className="size-3.5" />
              Buscar produto
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {produtos.map((produto, indice) => (
                <div
                  key={produto.nome}
                  className={`flex-col gap-1.5 rounded-campo border border-borda p-2 sm:flex sm:p-2.5 ${indice < 3 ? "flex" : "hidden"}`}
                >
                  <span className={`size-6 rounded-full ${produto.tom}`} />
                  <span className="truncate text-[0.7rem] font-semibold sm:text-xs">{produto.nome}</span>
                  <span className="text-[0.7rem] font-bold text-primaria-escura tabular-nums sm:text-xs">{produto.preco}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-card bg-fundo p-2.5 sm:p-3">
            <span className="font-titulo text-sm font-bold">Venda</span>
            {itens.map((item) => (
              <div key={item.nome} className="flex flex-col border-b border-borda pb-1.5 text-[0.7rem] sm:text-xs">
                <span className="truncate">{item.nome}</span>
                <span className="font-semibold tabular-nums">{item.preco}</span>
              </div>
            ))}
            <div className="mt-auto flex flex-col">
              <span className="text-[0.65rem] font-semibold text-texto-suave">Total</span>
              <span className="font-titulo text-xl font-extrabold tabular-nums sm:text-2xl">R$ 38,00</span>
            </div>
            <span className="rounded-botao bg-linear-135 from-secundaria to-secundaria-escura py-2 text-center text-sm font-bold text-superficie shadow-brilho-secundaria">
              Cobrar
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-12 -left-2 rounded-card border border-borda bg-superficie p-3 shadow-elevada motion-safe:animate-flutuar sm:-left-8 sm:p-4">
        <span className="block text-xs font-semibold text-texto-suave">Troco · recebido R$ 50,00</span>
        <span className="font-titulo text-2xl font-extrabold text-sucesso-escuro tabular-nums">R$ 12,00</span>
      </div>

      <div className="absolute -top-5 -right-2 flex items-center gap-2 rounded-full border border-borda bg-superficie py-2 pr-4 pl-2 shadow-elevada motion-safe:animate-flutuar motion-safe:[animation-delay:-3s] sm:-right-6">
        <span className="grid size-7 place-items-center rounded-full bg-sucesso text-texto">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <span className="text-xs font-semibold sm:text-sm">Caixa fechado sem diferença</span>
      </div>
    </div>
  );
}
