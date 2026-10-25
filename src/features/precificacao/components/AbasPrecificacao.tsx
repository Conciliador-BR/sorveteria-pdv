import Link from "next/link";
import { cn } from "@/lib/utils";
import { ABAS, type Aba } from "../abas";

// Abas como links (?aba=…): cada uma é uma página que dá para recarregar e compartilhar.
export function AbasPrecificacao({ atual }: { atual: Aba }) {
  return (
    <nav aria-label="Partes da precificação" className="-mx-1 overflow-x-auto px-1 pb-1">
      <ul className="flex min-w-max gap-2">
        {ABAS.map((aba) => {
          const ativa = aba.id === atual;
          return (
            <li key={aba.id}>
              <Link
                href={`/precificacao?aba=${aba.id}`}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-12 items-center rounded-botao px-4 font-semibold transition-colors",
                  ativa ? "bg-primaria text-superficie" : "border-2 border-borda bg-superficie text-primaria-escura hover:bg-primaria-suave",
                )}
              >
                {aba.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
