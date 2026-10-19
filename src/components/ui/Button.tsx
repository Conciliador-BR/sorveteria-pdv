import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type VarianteBotao = "primario" | "cobrar" | "secundario" | "perigo" | "fantasma";
export type TamanhoBotao = "md" | "lg";

const variantes: Record<VarianteBotao, string> = {
  primario: "bg-primaria text-superficie hover:bg-primaria-escura",
  cobrar: "bg-secundaria text-superficie hover:bg-secundaria-escura",
  secundario: "border-2 border-primaria bg-superficie text-primaria-escura hover:bg-primaria-suave",
  perigo: "bg-perigo text-superficie hover:bg-perigo-escuro",
  fantasma: "bg-transparent text-texto hover:bg-primaria-suave",
};

// md = 48 px (alvo mínimo de toque), lg = 64 px (ações do balcão).
const tamanhos: Record<TamanhoBotao, string> = {
  md: "min-h-12 px-5 text-base",
  lg: "min-h-16 px-8 text-xl",
};

// Exportado para estilizar um <Link> como botão sem duplicar classes.
export function estiloBotao({
  variante = "primario",
  tamanho = "md",
  className,
}: { variante?: VarianteBotao; tamanho?: TamanhoBotao; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-botao font-semibold select-none",
    "transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
    variantes[variante],
    tamanhos[tamanho],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  /** Desabilita o botão e troca o texto, para impedir envio duplicado. */
  carregando?: boolean;
  /** Texto exibido durante o carregamento (ex.: "Salvando…"). */
  textoCarregando?: string;
};

export function Button({
  variante,
  tamanho,
  carregando = false,
  textoCarregando = "Carregando…",
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={estiloBotao({ variante, tamanho, className })}
      {...props}
    >
      {carregando ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-5 shrink-0 motion-safe:animate-spin" />
          {textoCarregando}
        </>
      ) : (
        children
      )}
    </button>
  );
}
