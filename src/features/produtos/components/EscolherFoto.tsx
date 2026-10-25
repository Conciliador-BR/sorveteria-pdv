"use client";

import { Camera, Images, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GALERIA } from "../galeria";
import { reduzirFoto } from "../reduzirFoto";
import { FotoProduto } from "./FotoProduto";
import { GaleriaFotos } from "./GaleriaFotos";

type Escolha = { tipo: "nenhuma" } | { tipo: "galeria"; id: string } | { tipo: "manter"; fotoId: string } | { tipo: "nova"; dataUrl: string };

type EscolherFotoProps = {
  produto?: { imagem: string | null; fotoId: string | null };
  erro?: string;
};

function escolhaInicial(produto: EscolherFotoProps["produto"]): Escolha {
  if (produto?.fotoId) return { tipo: "manter", fotoId: produto.fotoId };
  if (produto?.imagem) return { tipo: "galeria", id: produto.imagem };
  return { tipo: "nenhuma" };
}

// Valor do campo `foto` que a Server Action entende (ver fotoSchema).
function valorDoCampo(escolha: Escolha) {
  if (escolha.tipo === "galeria") return `galeria:${escolha.id}`;
  if (escolha.tipo === "manter") return "manter";
  if (escolha.tipo === "nova") return escolha.dataUrl;
  return "";
}

// Foto do produto: imagem da galeria padrão ou foto própria (arquivo ou câmera do celular).
export function EscolherFoto({ produto, erro }: EscolherFotoProps) {
  const [escolha, setEscolha] = useState<Escolha>(() => escolhaInicial(produto));
  const [galeriaAberta, setGaleriaAberta] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);
  const id = useId();

  // Depois de salvar, a página volta com a foto gravada: recomeça dela, sem reenviar a mesma foto.
  const [salvo, setSalvo] = useState(produto);
  if (produto !== salvo && (produto?.fotoId !== salvo?.fotoId || produto?.imagem !== salvo?.imagem)) {
    setSalvo(produto);
    setEscolha(escolhaInicial(produto));
  }

  const nomeGaleria = escolha.tipo === "galeria" ? GALERIA.find((imagem) => imagem.id === escolha.id)?.nome : undefined;
  const mensagem = problema ?? erro;
  const preview = { imagem: escolha.tipo === "galeria" ? escolha.id : null, fotoId: escolha.tipo === "manter" ? escolha.fotoId : null };

  async function aoEscolherArquivo(lista: FileList | null) {
    const escolhido = lista?.[0];
    if (arquivo.current) arquivo.current.value = "";
    if (!escolhido) return;
    setProblema(null);
    setPreparando(true);
    try {
      setEscolha({ tipo: "nova", dataUrl: await reduzirFoto(escolhido) });
    } catch {
      setProblema("Não deu para usar essa imagem. Tente uma foto em JPG ou PNG.");
    } finally {
      setPreparando(false);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={mensagem ? `${id}-erro` : `${id}-dica`}>
      <legend className="mb-1.5 text-sm font-semibold">Foto (opcional)</legend>
      <input type="hidden" name="foto" value={valorDoCampo(escolha)} />
      <div className="flex items-center gap-3">
        <div className="size-20 shrink-0 overflow-hidden rounded-card border border-borda">
          {escolha.tipo === "nova" ? (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local da foto escolhida.
            <img src={escolha.dataUrl} alt="" className="size-full object-cover" />
          ) : (
            <FotoProduto produto={preview} className="aspect-square size-full" />
          )}
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1">
          <p id={`${id}-dica`} className="text-sm text-texto-suave">
            {escolha.tipo === "nenhuma" && "Sem foto. Escolha uma imagem da galeria ou envie uma foto sua."}
            {escolha.tipo === "galeria" && `Galeria: ${nomeGaleria ?? escolha.id}.`}
            {escolha.tipo === "manter" && "Foto enviada por você."}
            {escolha.tipo === "nova" && "Foto nova. Ela é salva junto com o produto."}
          </p>
          {escolha.tipo !== "nenhuma" ? (
            <button
              type="button"
              onClick={() => setEscolha({ tipo: "nenhuma" })}
              className="-ml-2 inline-flex min-h-10 items-center gap-1.5 rounded-botao px-2 text-sm font-semibold text-perigo hover:bg-perigo-suave"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Remover foto
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variante="secundario" className="px-2 text-sm whitespace-nowrap" onClick={() => setGaleriaAberta(true)}>
          <Images aria-hidden="true" className="size-5 shrink-0" />
          Galeria
        </Button>
        <Button type="button" variante="secundario" className="px-2 text-sm whitespace-nowrap" carregando={preparando} textoCarregando="Preparando…" onClick={() => arquivo.current?.click()}>
          <Camera aria-hidden="true" className="size-5 shrink-0" />
          Enviar foto
        </Button>
      </div>
      {/* Sem `name`: o arquivo original não vai no formulário, só a versão reduzida no campo `foto`. */}
      <input
        ref={arquivo}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(evento) => aoEscolherArquivo(evento.target.files)}
      />
      {mensagem ? (
        <p id={`${id}-erro`} className="text-sm font-medium text-perigo">
          {mensagem}
        </p>
      ) : null}
      <GaleriaFotos
        aberta={galeriaAberta}
        selecionada={escolha.tipo === "galeria" ? escolha.id : null}
        aoEscolher={(imagem) => {
          setEscolha({ tipo: "galeria", id: imagem });
          setProblema(null);
          setGaleriaAberta(false);
        }}
        aoFechar={() => setGaleriaAberta(false)}
      />
    </fieldset>
  );
}
