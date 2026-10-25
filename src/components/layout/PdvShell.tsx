import type { ReactNode } from "react";
import { Marca } from "./Marca";

type PdvShellProps = {
  nomeLoja: string;
  /** Quem está no caixa (nome e papel). */
  operador: string;
  /** Situação do caixa, ex.: "Caixa aberto desde 24/10/26 08:00". */
  situacao: ReactNode;
  /** Abas Vender/Caixa. */
  abas: ReactNode;
  /** Botão de sair (Esc), recebido pronto para o shell não conhecer a regra do caixa. */
  sair: ReactNode;
  children: ReactNode;
};

// Modo caixa: tela cheia só de venda, sem menu nem configurações. Uma barra azul-noite fina no topo.
// A partir do tablet a moldura ocupa exatamente a tela: o conteúdo rola por dentro, e a venda cabe sem rolar a página.
export function PdvShell({ nomeLoja, operador, situacao, abas, sair, children }: PdvShellProps) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col md:h-dvh md:min-h-0 md:flex-none md:overflow-hidden">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-botao bg-primaria px-4 py-3 font-semibold text-superficie focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-10 shrink-0 bg-tinta text-superficie shadow-elevada">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 md:flex-nowrap lg:px-6">
          <Marca nome={nomeLoja} fundo="escuro" className="text-base" />
          <p className="flex min-w-0 items-center gap-2 rounded-full bg-superficie/10 px-3 py-1 text-sm">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-sucesso" />
            <span className="min-w-0 md:truncate">
              {situacao} · <span className="font-semibold">{operador}</span>
            </span>
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {abas}
            {sair}
          </div>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="flex flex-1 flex-col gap-4 p-3 outline-none md:min-h-0 md:overflow-y-auto md:p-4 lg:px-6">
        {children}
      </main>
    </div>
  );
}
