import type { ReactNode } from "react";
import { formatarReais } from "@/lib/dinheiro";
import { cn } from "@/lib/utils";

// Uma linha "rótulo ........ R$ valor" de uma lista de definição.
export function LinhaValor({ rotulo, centavos, className }: { rotulo: ReactNode; centavos: number; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-1.5", className)}>
      <dt>{rotulo}</dt>
      <dd className="font-semibold tabular-nums">{formatarReais(centavos)}</dd>
    </div>
  );
}
