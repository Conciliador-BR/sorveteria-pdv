import { Smartphone, TrendingUp } from "lucide-react";

// Faixa escura com o celular do dono. Os números são de exemplo e a tela diz isso.

const formas = [
  { nome: "Pix", parte: 46, cor: "bg-sucesso" },
  { nome: "Dinheiro", parte: 28, cor: "bg-acento" },
  { nome: "Crédito", parte: 16, cor: "bg-secundaria" },
  { nome: "Débito", parte: 10, cor: "bg-primaria" },
];

const pontos = [
  "Faturamento do dia, da semana e do mês",
  "Quanto entrou em cada forma de pagamento e bandeira",
  "Fechamentos de caixa com diferença",
  "Produtos com estoque baixo",
];

function CelularExemplo() {
  return (
    <div
      role="img"
      aria-label="Exemplo do painel do dono no celular, com faturamento do dia e vendas por forma de pagamento. Valores fictícios."
      className="mx-auto w-full max-w-[18rem] rounded-[2.5rem] border-8 border-tinta-clara bg-fundo p-4 text-texto shadow-elevada"
    >
      <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-borda" />
      <span className="text-xs font-semibold tracking-wide text-texto-suave uppercase">Hoje</span>
      <div className="flex items-end justify-between">
        <span className="font-titulo text-3xl font-extrabold tabular-nums">R$ 1.248</span>
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-sucesso-suave px-2 py-0.5 text-xs font-bold text-sucesso-escuro">
          <TrendingUp className="size-3" />
          87 vendas
        </span>
      </div>
      <div className="mt-4 rounded-card bg-superficie p-3 shadow-suave">
        <span className="text-xs font-semibold">Por forma de pagamento</span>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full">
          {formas.map((forma) => (
            <span key={forma.nome} className={forma.cor} style={{ width: `${forma.parte}%` }} />
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
          {formas.map((forma) => (
            <li key={forma.nome} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${forma.cor}`} />
              {forma.nome} <span className="ml-auto font-semibold tabular-nums">{forma.parte}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 rounded-card bg-superficie p-3 shadow-suave">
        <span className="text-xs font-semibold">Ticket médio</span>
        <span className="block font-titulo text-xl font-extrabold tabular-nums">R$ 14,35</span>
      </div>
      <p className="mt-3 text-center text-[0.65rem] text-texto-suave">Exemplo com valores fictícios</p>
    </div>
  );
}

export function PainelDonoDestaque() {
  return (
    <section aria-labelledby="titulo-painel-dono" className="relative isolate overflow-hidden bg-tinta py-20 text-superficie">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-32 left-1/4 size-[26rem] rounded-full bg-primaria/40 blur-3xl" />
        <span className="absolute -right-24 -bottom-32 size-[22rem] rounded-full bg-secundaria/30 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-acento uppercase">
            <Smartphone aria-hidden="true" className="size-4" />
            Para o dono
          </span>
          <h2 id="titulo-painel-dono" className="text-3xl font-extrabold sm:text-4xl">
            Longe da loja, mas por dentro de tudo.
          </h2>
          <p className="text-xl text-superficie/80 text-pretty">
            Abra o painel no celular e veja como está o dia, sem ligar para ninguém e sem esperar o fechamento.
          </p>
          <ul className="flex flex-col gap-3">
            {pontos.map((ponto) => (
              <li key={ponto} className="flex items-center gap-3">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-acento" />
                {ponto}
              </li>
            ))}
          </ul>
        </div>
        <CelularExemplo />
      </div>
    </section>
  );
}
