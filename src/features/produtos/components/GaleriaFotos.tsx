"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { cn } from "@/lib/utils";
import { GALERIA, type GrupoGaleria } from "../galeria";

type GaleriaFotosProps = {
  aberta: boolean;
  selecionada: string | null;
  aoEscolher: (id: string) => void;
  aoFechar: () => void;
};

const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

function agrupar(termo: string) {
  const grupos = new Map<GrupoGaleria, typeof GALERIA>();
  for (const imagem of GALERIA) {
    if (termo && !normalizar(imagem.nome).includes(termo)) continue;
    grupos.set(imagem.grupo, [...(grupos.get(imagem.grupo) ?? []), imagem]);
  }
  return [...grupos];
}

// Janela com as imagens padrão, separadas por grupo e com busca pelo nome.
export function GaleriaFotos({ aberta, selecionada, aoEscolher, aoFechar }: GaleriaFotosProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [busca, setBusca] = useState("");
  const grupos = agrupar(normalizar(busca));

  // Limpa a busca a cada abertura.
  const [abertaAntes, setAbertaAntes] = useState(aberta);
  if (aberta !== abertaAntes) {
    setAbertaAntes(aberta);
    if (aberta) setBusca("");
  }

  // Abre como modal: foco preso dentro e Esc fecha.
  useEffect(() => {
    const no = dialogo.current;
    if (!no) return;
    if (aberta && !no.open) no.showModal();
    if (!aberta && no.open) no.close();
  }, [aberta]);

  return (
    <dialog
      ref={dialogo}
      onClose={aoFechar}
      aria-labelledby="titulo-galeria"
      className="m-auto flex max-h-[90dvh] w-[min(56rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-modal bg-superficie p-0 text-texto shadow-elevada backdrop:bg-tinta/60 not-open:hidden"
    >
      <div className="flex items-center gap-3 border-b border-borda p-4">
        <h2 id="titulo-galeria" className="text-xl font-semibold">
          Escolher imagem
        </h2>
        <button
          type="button"
          onClick={aoFechar}
          className="ml-auto flex size-12 items-center justify-center rounded-botao text-texto-suave hover:bg-primaria-suave"
          aria-label="Fechar"
        >
          <X aria-hidden="true" className="size-6" />
        </button>
      </div>
      <div className="relative px-4 pt-4">
        <Campo
          rotulo="Buscar imagem"
          type="search"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Ex.: picolé, açaí, refrigerante"
          autoComplete="off"
          className="pl-10"
        />
        <Search aria-hidden="true" className="pointer-events-none absolute top-14 left-7 size-5 text-texto-suave" />
      </div>
      <div className="flex flex-col gap-5 overflow-y-auto p-4">
        {grupos.length === 0 ? (
          <p role="status" className="text-texto-suave">
            Nenhuma imagem para “{busca}”. Você pode enviar uma foto sua.
          </p>
        ) : (
          grupos.map(([grupo, imagens]) => (
            <section key={grupo} aria-label={grupo} className="flex flex-col gap-2">
              <h3 className="font-semibold text-primaria-escura">{grupo}</h3>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {imagens.map((imagem) => (
                  <li key={imagem.id}>
                    <button
                      type="button"
                      onClick={() => aoEscolher(imagem.id)}
                      aria-pressed={selecionada === imagem.id}
                      className={cn(
                        "flex w-full flex-col items-center gap-1 rounded-card border-2 border-borda p-2 text-center text-xs font-medium hover:border-primaria/60 hover:bg-primaria-suave",
                        selecionada === imagem.id && "border-primaria bg-primaria-suave",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático da galeria. */}
                      <img src={`/produtos/galeria/${imagem.id}.svg`} alt="" loading="lazy" className="size-14" />
                      <span className="leading-tight">{imagem.nome}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
        <p className="text-xs text-texto-suave">
          Parte das imagens: Fluent UI Emoji, da Microsoft (licença MIT). As demais foram desenhadas para este sistema.
        </p>
      </div>
    </dialog>
  );
}
