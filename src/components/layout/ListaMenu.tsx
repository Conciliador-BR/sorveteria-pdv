"use client";

import {
  ClipboardList,
  History,
  IceCreamCone,
  LayoutDashboard,
  Package,
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
  comandas: ClipboardList,
  estoque: Package,
  produtos: IceCreamCone,
  historico: History,
  dashboard: LayoutDashboard,
  funcionarios: Users,
};

function estaAtivo(caminho: string, href: string) {
  return caminho === href || caminho.startsWith(`${href}/`);
}

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
                "flex min-h-12 items-center gap-3 rounded-botao px-3 font-medium transition-colors",
                ativo ? "bg-primaria text-superficie" : "text-texto hover:bg-primaria-suave hover:text-primaria-escura",
              )}
            >
              <Icone aria-hidden="true" className="size-5 shrink-0" />
              {item.rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
