"use client";

import {
  Calculator,
  History,
  IceCreamCone,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconeMenu, ItemMenu } from "@/features/auth/menu";
import { cn } from "@/lib/utils";

const icones: Record<IconeMenu, LucideIcon> = {
  caixa: Wallet,
  vender: ShoppingCart,
  estoque: Package,
  produtos: IceCreamCone,
  historico: History,
  dashboard: LayoutDashboard,
  precificacao: Calculator,
  funcionarios: Users,
  configuracoes: Settings,
};

function estaAtivo(caminho: string, href: string) {
  return caminho === href || caminho.startsWith(`${href}/`);
}

// Menu sobre o azul-noite (lateral e gaveta): foco em manga, que contrasta com o fundo escuro.
export function ListaMenu({ itens, aoNavegar }: { itens: ItemMenu[]; aoNavegar?: () => void }) {
  const caminho = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {itens.map((item) => {
        const Icone = icones[item.icone];
        const ativo = estaAtivo(caminho, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={aoNavegar}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "group relative flex min-h-12 items-center gap-3 rounded-botao px-3 font-medium transition-colors focus-visible:outline-acento",
                ativo
                  ? "bg-superficie/12 text-superficie"
                  : "text-superficie/75 hover:bg-superficie/6 hover:text-superficie",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-campo transition-colors",
                  ativo ? "bg-acento text-tinta" : "bg-superficie/6",
                )}
              >
                <Icone className="size-[1.125rem]" />
              </span>
              {item.rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
