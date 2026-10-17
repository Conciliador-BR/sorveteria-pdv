import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CampoProps = ComponentProps<"input"> & {
  rotulo: string;
  /** Mensagem de erro junto do campo; liga aria-invalid e aria-describedby. */
  erro?: string;
  /** Texto de ajuda abaixo do campo. */
  dica?: string;
};

export function Campo({
  rotulo,
  erro,
  dica,
  id,
  className,
  "aria-describedby": descritoPorExterno,
  "aria-invalid": invalidoExterno,
  ...props
}: CampoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = erro ? `${idCampo}-erro` : undefined;
  const idDica = dica ? `${idCampo}-dica` : undefined;
  const descritoPor = [idErro, idDica, descritoPorExterno].filter(Boolean).join(" ") || undefined;
  const invalido = invalidoExterno ?? (erro ? true : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idCampo} className="text-sm font-semibold">
        {rotulo}
      </label>
      <input
        id={idCampo}
        aria-invalid={invalido}
        aria-describedby={descritoPor}
        className={cn(
          "min-h-12 w-full rounded-campo border-2 border-borda-forte bg-superficie px-3 text-base text-texto",
          "transition-colors placeholder:text-texto-suave hover:border-texto-suave",
          "aria-invalid:border-perigo",
          className,
        )}
        {...props}
      />
      {dica ? (
        <p id={idDica} className="text-sm text-texto-suave">
          {dica}
        </p>
      ) : null}
      {erro ? (
        <p id={idErro} className="text-sm font-medium text-perigo">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
