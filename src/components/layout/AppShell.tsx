import type { ReactNode } from "react";
import type { ItemMenu } from "@/features/auth/menu";
import { ListaMenu } from "./ListaMenu";
import { Marca } from "./Marca";
import { MenuCelular } from "./MenuCelular";

type AppShellProps = {
  /** Nome da loja no menu (já com o padrão aplicado quando o dono não definiu). */
  nomeLoja: string;
  nome: string;
  papel: string;
  itens: ItemMenu[];
  /** Ação de sair (formulário do servidor), recebida pronta para o shell não conhecer a autenticação. */
  acaoSair: ReactNode;
  children: ReactNode;
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

// Área logada: menu lateral a partir de 1024 px; abaixo disso, gaveta aberta pelo botão da barra superior.
export function AppShell({ nomeLoja, nome, papel, itens, acaoSair, children }: AppShellProps) {
  return (
    <div className="flex flex-1">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-botao bg-primaria px-4 py-3 font-semibold text-superficie focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>

      <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col gap-8 overflow-hidden bg-tinta p-4 text-superficie lg:flex">
        {/* Brilho decorativo no topo do menu, nas cores da marca. */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-24 -left-16 size-56 rounded-full bg-primaria/40 blur-3xl" />
        <Marca nome={nomeLoja} fundo="escuro" className="relative px-1 pt-2" />
        <nav aria-label="Menu principal" className="relative flex-1 overflow-y-auto">
          <ListaMenu itens={itens} />
        </nav>
        <p className="relative px-1 text-xs text-superficie/60">Praia do Morro</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex min-h-16 items-center gap-2 border-b border-borda/70 bg-superficie/85 px-3 py-2 backdrop-blur-md lg:px-8">
          <div className="lg:hidden">
            <MenuCelular itens={itens} nomeLoja={nomeLoja} />
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="hidden size-10 shrink-0 place-items-center rounded-full bg-linear-135 sm:grid from-acento to-secundaria font-titulo font-bold text-texto"
            >
              {iniciais(nome)}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold">{nome}</p>
              <p className="text-sm text-texto-suave">{papel}</p>
            </div>
            {acaoSair}
          </div>
        </header>

        <main id="conteudo" tabIndex={-1} className="flex outline-none flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
