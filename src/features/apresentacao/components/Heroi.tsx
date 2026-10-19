import { ArrowRight, Check, PlayCircle, Sun } from "lucide-react";
import Link from "next/link";
import { estiloBotao } from "@/components/ui/Button";
import { MockupPdv } from "./MockupPdv";

const garantias = ["Tablet, computador e celular", "Login para cada funcionário", "Instala como app"];

// Primeira dobra: promessa (hook), prova visual e as duas chamadas para ação.
export function Heroi() {
  return (
    <section aria-labelledby="titulo-apresentacao" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-40 -left-32 size-[28rem] rounded-full bg-primaria/20 blur-3xl" />
        <span className="absolute top-10 right-[-10rem] size-[30rem] rounded-full bg-acento/30 blur-3xl" />
        <span className="absolute bottom-[-12rem] left-1/3 size-[26rem] rounded-full bg-secundaria/15 blur-3xl" />
        <span className="absolute inset-0 bg-[radial-gradient(rgb(11_37_48/0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-12 pb-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-20 lg:pb-24">
        <div className="flex flex-col items-start gap-6 motion-safe:animate-surgir">
          <span className="inline-flex items-center gap-2 rounded-full border border-acento/60 bg-superficie/80 py-1 pr-3 pl-1 text-sm font-semibold shadow-suave backdrop-blur">
            <span className="grid size-6 place-items-center rounded-full bg-acento">
              <Sun aria-hidden="true" className="size-3.5" />
            </span>
            Pronto para a temporada de verão
          </span>

          <h1 id="titulo-apresentacao" className="text-4xl font-extrabold text-texto sm:text-5xl xl:text-6xl">
            A fila anda rápido.{" "}
            <span className="bg-linear-90 from-secundaria to-primaria-escura bg-clip-text text-transparent">
              O caixa fecha certinho.
            </span>
          </h1>

          <p className="max-w-xl text-xl text-texto-suave text-pretty">
            O sistema de vendas da sorveteria: cobre em poucos toques, veja o troco na hora e acompanhe pelo celular
            quanto entrou em dinheiro, Pix e cartão.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/entrar" className={estiloBotao({ tamanho: "lg", className: "w-full whitespace-nowrap sm:w-auto" })}>
              Acessar o sistema
              <ArrowRight aria-hidden="true" className="size-6" />
            </Link>
            <a href="#como-funciona" className={estiloBotao({ variante: "secundario", tamanho: "lg", className: "w-full whitespace-nowrap sm:w-auto" })}>
              <PlayCircle aria-hidden="true" className="size-6" />
              Ver como funciona
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-texto-suave">
            {garantias.map((garantia) => (
              <li key={garantia} className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="size-4 text-sucesso-escuro" strokeWidth={3} />
                {garantia}
              </li>
            ))}
          </ul>
        </div>

        <div className="motion-safe:animate-surgir motion-safe:[animation-delay:150ms]">
          <MockupPdv />
        </div>
      </div>
    </section>
  );
}
