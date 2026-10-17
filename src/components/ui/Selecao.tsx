import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type SelecaoProps = ComponentProps<"select"> & { rotulo: string; erro?: string };

export function Selecao({ rotulo, erro, id, className, children, ...props }: SelecaoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = erro ? `${idCampo}-erro` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idCampo} className="text-sm font-semibold">
        {rotulo}
      </label>
      <select
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={idErro}
        className={cn(
          "min-h-12 w-full rounded-campo border-2 border-borda-forte bg-superficie px-3 text-base text-texto aria-invalid:border-perigo",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {erro ? (
        <p id={idErro} className="text-sm font-medium text-perigo">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
