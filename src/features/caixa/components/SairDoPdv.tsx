"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, estiloBotao } from "@/components/ui/Button";

type SairDoPdvProps = {
  /** Dono sai sem fechar o caixa; funcionário só sai fechando. A trava real fica no layout do sistema. */
  podeSairSemFechar: boolean;
};

// Esc (ou o botão "Sair") abre o aviso de saída do modo caixa, em <dialog> nativo.
export function SairDoPdv({ podeSairSemFechar }: SairDoPdvProps) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const refContinuar = useRef<HTMLButtonElement>(null);
  const fechar = () => dialogo.current?.close();

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key !== "Escape" || evento.defaultPrevented || evento.repeat) return;
      // Outro <dialog> aberto (inclusive este) fecha com o próprio Esc.
      if (document.querySelector("dialog[open]")) return;
      // Na busca com texto, o Esc só apaga o que foi digitado.
      const alvo = evento.target;
      if (alvo instanceof HTMLInputElement && alvo.type === "search" && alvo.value) return;
      evento.preventDefault();
      dialogo.current?.showModal();
      refContinuar.current?.focus();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  return (
    <>
      <Button
        variante="fantasma"
        className="px-3 text-superficie hover:bg-superficie/10 focus-visible:outline-acento"
        aria-haspopup="dialog"
        aria-keyshortcuts="Escape"
        onClick={() => {
          dialogo.current?.showModal();
          refContinuar.current?.focus();
        }}
      >
        <LogOut aria-hidden="true" className="size-5" />
        Sair <kbd className="hidden rounded-campo border border-superficie/40 px-1.5 text-xs font-medium sm:inline">Esc</kbd>
      </Button>
      <dialog
        ref={dialogo}
        aria-labelledby="titulo-sair-pdv"
        aria-describedby="texto-sair-pdv"
        // Toque fora do aviso (no fundo escurecido) volta para a venda.
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fechar();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-modal bg-superficie p-0 text-texto shadow-elevada backdrop:bg-tinta/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id="titulo-sair-pdv" className="text-2xl font-bold">
            Sair da tela de vendas?
          </h2>
          <p id="texto-sair-pdv" className="text-texto-suave">
            {podeSairSemFechar
              ? "Você pode sair sem fechar o caixa: ele continua aberto e você volta a vender quando quiser."
              : "Para sair desta tela, feche o seu caixa. Antes, cobre ou cancele as comandas abertas."}
          </p>
          <div className="flex flex-col gap-2">
            <Button ref={refContinuar} tamanho="lg" onClick={fechar}>
              Continuar vendendo
            </Button>
            <Link href="/vender/caixa#fechar" onClick={fechar} className={estiloBotao({ variante: "secundario", tamanho: "lg" })}>
              Fechar o caixa
            </Link>
            {podeSairSemFechar ? (
              <Button
                variante="fantasma"
                tamanho="lg"
                onClick={() => {
                  fechar();
                  router.push("/dashboard");
                }}
              >
                Sair sem fechar o caixa
              </Button>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
