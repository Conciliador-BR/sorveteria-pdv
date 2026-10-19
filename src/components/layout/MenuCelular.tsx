"use client";

import { Menu, X } from "lucide-react";
import { useRef } from "react";
import type { ItemMenu } from "@/features/auth/menu";
import { Button } from "@/components/ui/Button";
import { ListaMenu } from "./ListaMenu";
import { Marca } from "./Marca";

// Gaveta do celular/tablet em <dialog> nativo: prende o foco, fecha com Esc e devolve o foco ao botão.
export function MenuCelular({ itens }: { itens: ItemMenu[] }) {
  const gaveta = useRef<HTMLDialogElement>(null);
  const fechar = () => gaveta.current?.close();

  return (
    <>
      <Button
        variante="fantasma"
        className="px-3"
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        onClick={() => gaveta.current?.showModal()}
      >
        <Menu aria-hidden="true" className="size-6" />
      </Button>
      <dialog
        ref={gaveta}
        aria-label="Menu"
        // Toque fora da gaveta (no fundo escurecido) fecha o menu.
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fechar();
        }}
        className="m-0 h-dvh max-h-dvh w-72 max-w-[85vw] bg-superficie p-0 text-texto shadow-suave backdrop:bg-texto/40"
      >
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <Marca />
            <Button variante="fantasma" className="px-3" aria-label="Fechar menu" onClick={fechar}>
              <X aria-hidden="true" className="size-6" />
            </Button>
          </div>
          <nav aria-label="Menu principal" className="flex-1 overflow-y-auto overscroll-contain">
            <ListaMenu itens={itens} aoNavegar={fechar} />
          </nav>
        </div>
      </dialog>
    </>
  );
}
