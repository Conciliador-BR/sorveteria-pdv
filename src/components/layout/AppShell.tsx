import type { ReactNode } from "react";
import type { ItemMenu } from "@/features/auth/menu";
import { ListaMenu } from "./ListaMenu";
import { Marca } from "./Marca";
import { MenuCelular } from "./MenuCelular";

type AppShellProps = {
  nome: string;
  papel: string;
  itens: ItemMenu[];
  /** Ação de sair (formulário do servidor), recebida pronta para o shell não conhecer a autenticação. */
  acaoSair: ReactNode;
  children: ReactNode;
};

// Área logada: menu lateral a partir de 1024 px; abaixo disso, gaveta aberta pelo botão da barra superior.
export function AppShell({ nome, papel, itens, acaoSair, children }: AppShellProps) {
  return (
    <div className="flex flex-1">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-botao bg-primaria px-4 py-3 font-semibold text-superficie focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-borda bg-superficie p-4 lg:flex">
        <Marca />
        <nav aria-label="Menu principal" className="flex-1 overflow-y-auto">
          <ListaMenu itens={itens} />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex min-h-16 items-center gap-2 border-b border-borda bg-superficie px-3 py-2 lg:px-6">
          <div className="lg:hidden">
            <MenuCelular itens={itens} />
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-right leading-tight">
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
