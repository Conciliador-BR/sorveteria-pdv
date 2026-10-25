"use client";

import { ShoppingCart, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const abas: readonly { href: string; rotulo: string; icone: LucideIcon; ativa: (caminho: string) => boolean }[] = [
  // Uma comanda aberta (/comandas/...) faz parte da venda.
  { href: "/vender", rotulo: "Vender", icone: ShoppingCart, ativa: (c) => c === "/vender" || c.startsWith("/comandas/") },
  { href: "/vender/caixa", rotulo: "Caixa", icone: Wallet, ativa: (c) => c === "/vender/caixa" },
];

// Abas da barra do modo caixa, sobre o azul-noite (foco em manga).
export function AbasPdv() {
  const caminho = usePathname();

  return (
    <nav aria-label="Tela de vendas">
      <ul className="flex gap-1">
        {abas.map(({ href, rotulo, icone: Icone, ativa }) => {
          const atual = ativa(caminho);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={atual ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-2 rounded-botao px-3 font-semibold transition-colors focus-visible:outline-acento",
                  atual ? "bg-acento text-tinta" : "text-superficie/80 hover:bg-superficie/10 hover:text-superficie",
                )}
              >
                <Icone aria-hidden="true" className="size-5" />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
