import { ArrowRight, ChevronDown, IceCreamCone } from "lucide-react";
import Link from "next/link";
import { Marca } from "@/components/layout/Marca";
import { estiloBotao } from "@/components/ui/Button";

const perguntas = [
  {
    pergunta: "Precisa instalar alguma coisa?",
    resposta: "Não. Abre no navegador. No tablet ou no celular, dá para adicionar à tela inicial e usar como app.",
  },
  {
    pergunta: "Funciona no celular?",
    resposta: "Sim. O dono acompanha o painel pelo celular; no balcão, tablet ou computador deixam os botões maiores.",
  },
  {
    pergunta: "Cada funcionário tem seu próprio acesso?",
    resposta: "Sim. O dono cria o login de cada um e decide quem pode lançar estoque, cuidar dos produtos, cancelar venda ou ver o histórico.",
  },
  {
    pergunta: "E se faltar dinheiro no caixa?",
    resposta: "No fechamento, o sistema mostra o valor esperado, o contado e a diferença. Fica registrado e aparece no painel do dono.",
  },
  {
    pergunta: "Dá para vender sorvete no peso?",
    resposta: "Sim. O produto pode ser vendido por unidade ou por peso, com o preço do quilo, e o total sai calculado.",
  },
];

export function Perguntas() {
  return (
    <section id="duvidas" aria-labelledby="titulo-duvidas" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
      <h2 id="titulo-duvidas" className="text-center text-3xl font-extrabold sm:text-4xl">
        Dúvidas comuns
      </h2>
      <div className="mt-10 flex flex-col gap-3">
        {perguntas.map(({ pergunta, resposta }) => (
          <details key={pergunta} className="group rounded-card border border-borda bg-superficie shadow-suave open:shadow-elevada">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-5 py-4 text-left font-semibold [&::-webkit-details-marker]:hidden">
              {pergunta}
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-primaria transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-texto-suave">{resposta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ChamadaFinal() {
  return (
    <section aria-labelledby="titulo-chamada-final" className="px-4 pb-20 sm:px-6">
      <div className="relative isolate mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-modal bg-linear-135 from-primaria-escura via-primaria to-sucesso-escuro px-6 py-16 text-center text-superficie shadow-elevada sm:px-12">
        <IceCreamCone aria-hidden="true" className="absolute -top-6 -left-6 -z-10 size-40 rotate-[-20deg] text-superficie/10" />
        <IceCreamCone aria-hidden="true" className="absolute -right-8 -bottom-10 -z-10 size-52 rotate-[18deg] text-superficie/10" />
        <h2 id="titulo-chamada-final" className="max-w-2xl text-3xl font-extrabold sm:text-4xl">
          Pronto para a próxima fila?
        </h2>
        <p className="max-w-xl text-xl text-superficie/90">Entre com o usuário e a senha que o dono cadastrou para você.</p>
        <Link
          href="/entrar"
          className={estiloBotao({
            tamanho: "lg",
            className: "bg-none bg-superficie text-primaria-escura shadow-elevada hover:bg-acento-suave focus-visible:outline-acento",
          })}
        >
          Entrar e começar a vender
          <ArrowRight aria-hidden="true" className="size-6" />
        </Link>
      </div>
    </section>
  );
}

export function Rodape() {
  return (
    <footer className="border-t border-borda bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-texto-suave sm:flex-row sm:px-6">
        <Marca />
        <p>Sistema de vendas da sorveteria da Praia do Morro.</p>
      </div>
    </footer>
  );
}
