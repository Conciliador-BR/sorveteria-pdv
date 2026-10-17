import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type TomBadge = "neutro" | "primaria" | "sucesso" | "acento" | "perigo";

// Fundos suaves com texto escuro: todos acima de 4,5:1 (ver docs/design.md).
const tons: Record<TomBadge, string> = {
  neutro: "bg-borda text-texto",
  primaria: "bg-primaria-suave text-primaria-escura",
  sucesso: "bg-sucesso-suave text-sucesso-escuro",
  acento: "bg-acento-suave text-texto",
  perigo: "bg-perigo-suave text-perigo",
};

export function Badge({ tom = "neutro", className, ...props }: ComponentProps<"span"> & { tom?: TomBadge }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tons[tom], className)}
      {...props}
    />
  );
}
