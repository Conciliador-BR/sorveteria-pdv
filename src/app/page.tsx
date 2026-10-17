import { ArrowRight, ClipboardList, Package, Sun, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Marca } from "@/components/layout/Marca";
import { Badge } from "@/components/ui/Badge";
import { estiloBotao } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Destaque = { titulo: string; texto: string; Icone: LucideIcon; tom: string };

const destaques: Destaque[] = [
  {
    titulo: "Caixa conferido",
    texto: "Abertura com fundo, sangria e fechamento com a diferença na tela.",
    Icone: Wallet,
    tom: "bg-primaria-suave text-primaria-escura",
  },
  {
    titulo: "Comandas",
    texto: "A família pede aos poucos e paga tudo de uma vez no final.",
    Icone: ClipboardList,
    tom: "bg-secundaria-suave text-secundaria-escura",
  },
  {
    titulo: "Estoque à mão",
    texto: "Entradas e saídas lançadas no balcão, com aviso do que está acabando.",
    Icone: Package,
    tom: "bg-sucesso-suave text-sucesso-escuro",
  },
];

export default function Home() {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-linear-135 from-primaria via-sucesso to-acento p-4 sm:p-8">
      {/* Bolas de sorvete decorativas; o conteúdo fica num cartão branco para o texto manter contraste. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-16 -left-16 size-64 rounded-full bg-superficie/20" />
        <span className="absolute top-1/3 -right-20 size-72 rounded-full bg-secundaria/25" />
        <span className="absolute -bottom-24 left-1/4 size-80 rounded-full bg-acento/40" />
      </div>

      <Card className="w-full max-w-3xl rounded-modal p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Marca />
          <Badge tom="acento">
            <Sun aria-hidden="true" className="size-3.5" />
            Praia do Morro
          </Badge>
        </div>

        <h1 className="mt-8 text-3xl font-bold text-primaria-escura">
          Vendas, caixa e estoque da sorveteria num lugar só.
        </h1>
        <p className="mt-3 text-xl text-texto-suave text-pretty">
          Feito para o balcão: botões grandes, total sempre à vista e troco calculado na hora.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {destaques.map(({ titulo, texto, Icone, tom }) => (
            <li key={titulo} className="flex flex-col gap-2 rounded-card border border-borda bg-fundo p-4">
              <span aria-hidden="true" className={`grid size-11 place-items-center rounded-full ${tom}`}>
                <Icone className="size-6" />
              </span>
              <h2 className="text-base font-semibold">{titulo}</h2>
              <p className="text-sm text-texto-suave">{texto}</p>
            </li>
          ))}
        </ul>

        <Link href="/entrar" className={estiloBotao({ tamanho: "lg", className: "mt-8 w-full sm:w-auto" })}>
          Acessar o sistema
          <ArrowRight aria-hidden="true" className="size-6" />
        </Link>
      </Card>
    </main>
  );
}
