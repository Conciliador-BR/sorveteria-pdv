import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type VarianteBotao = "primario" | "cobrar" | "secundario" | "perigo" | "fantasma";
export type TamanhoBotao = "md" | "lg";

// Primário e cobrar têm degradê e brilho colorido; o texto branco passa AA nas duas pontas do degradê.
const variantes: Record<VarianteBotao, string> = {
  primario:
    "bg-linear-135 from-primaria to-primaria-escura text-superficie shadow-brilho-primaria hover:from-primaria-escura hover:to-primaria-escura",
  cobrar:
    "bg-linear-135 from-secundaria to-secundaria-escura text-superficie shadow-brilho-secundaria hover:from-secundaria-escura hover:to-secundaria-escura",
  secundario: "border-2 border-primaria/70 bg-superficie text-primaria-escura shadow-suave hover:border-primaria hover:bg-primaria-suave",
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
    "transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
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
