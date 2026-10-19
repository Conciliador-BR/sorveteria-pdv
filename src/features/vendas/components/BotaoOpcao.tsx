import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BotaoOpcaoProps = Omit<ComponentProps<"button">, "type"> & { selecionado: boolean };

// Card grande de escolha (forma de pagamento, tipo de cartão, bandeira). Leitor de tela ouve "pressionado".
export function BotaoOpcao({ selecionado, className, ...props }: BotaoOpcaoProps) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      className={cn(
        "flex min-h-16 flex-col items-center justify-center gap-1 rounded-card border-2 px-4 py-3 text-xl font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px",
        selecionado ? "border-primaria-escura bg-primaria text-superficie" : "border-borda-forte bg-superficie text-texto hover:bg-primaria-suave",
        className,
      )}
      {...props}
    />
  );
}
