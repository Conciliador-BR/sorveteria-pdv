import { LogIn } from "lucide-react";
import Link from "next/link";
import { Marca } from "@/components/layout/Marca";
import { estiloBotao } from "@/components/ui/Button";

const links = [
  { href: "#recursos", rotulo: "Recursos" },
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#duvidas", rotulo: "Dúvidas" },
];

export function CabecalhoApresentacao() {
  return (
    <header className="sticky top-0 z-20 border-b border-borda/60 bg-fundo/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="rounded-botao">
          <Marca />
        </Link>
        <nav aria-label="Seções da página" className="ml-auto hidden md:block">
          <ul className="flex gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-12 items-center rounded-botao px-3 font-medium text-texto-suave transition-colors hover:bg-primaria-suave hover:text-primaria-escura"
                >
                  {link.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/entrar" className={estiloBotao({ className: "ml-auto md:ml-0" })}>
          <LogIn aria-hidden="true" className="size-5" />
          Entrar
        </Link>
      </div>
    </header>
  );
}
