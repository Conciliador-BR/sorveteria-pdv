import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CaixaSelecaoProps = Omit<ComponentProps<"input">, "type"> & { rotulo: string; dica?: string };

// Caixa de seleção com área de toque de 48 px (o rótulo inteiro é clicável).
export function CaixaSelecao({ rotulo, dica, id, className, ...props }: CaixaSelecaoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  return (
    <label htmlFor={idCampo} className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-campo px-1", className)}>
      <input id={idCampo} type="checkbox" className="size-5 shrink-0 accent-primaria" {...props} />
      <span className="flex flex-col">
        <span className="font-medium">{rotulo}</span>
        {dica ? <span className="text-sm text-texto-suave">{dica}</span> : null}
      </span>
    </label>
  );
}
