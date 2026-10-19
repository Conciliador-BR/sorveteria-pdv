import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type TipoAviso = "erro" | "sucesso" | "info";

const estilos: Record<TipoAviso, { classes: string; Icone: typeof Info }> = {
  erro: { classes: "border-perigo bg-perigo-suave text-perigo", Icone: CircleAlert },
  sucesso: { classes: "border-sucesso bg-sucesso-suave text-sucesso-escuro", Icone: CircleCheck },
  info: { classes: "border-primaria bg-primaria-suave text-primaria-escura", Icone: Info },
};

// Erro usa role="alert" (anuncia na hora); sucesso e info usam role="status" (educado).
// Para anunciar o mesmo erro de novo, troque a `key` do Aviso a cada tentativa.
export function Aviso({ tipo = "info", className, children, ...props }: ComponentProps<"div"> & { tipo?: TipoAviso }) {
  const { classes, Icone } = estilos[tipo];
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-campo border-l-4 px-3 py-2.5 text-sm font-medium", classes, className)}
      {...props}
    >
      <Icone aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
