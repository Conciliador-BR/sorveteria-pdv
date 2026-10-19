import { formatarReais } from "@/lib/dinheiro";
import { cn } from "@/lib/utils";

type TotalDestaqueProps = {
  rotulo: string;
  centavos: number;
  tom?: "texto" | "sucesso" | "perigo";
  /** Anuncia rótulo e valor quando mudam. Desligue quando um contêiner acima já é ao vivo ou o valor não muda. */
  aoVivo?: boolean;
  className?: string;
};

const tons = { texto: "text-texto", sucesso: "text-sucesso-escuro", perigo: "text-perigo" } as const;

// Valor grande do balcão (total, troco, falta).
export function TotalDestaque({ rotulo, centavos, tom = "texto", aoVivo = true, className }: TotalDestaqueProps) {
  return (
    <div aria-live={aoVivo ? "polite" : undefined} aria-atomic={aoVivo || undefined} className={cn("flex flex-col", className)}>
      <span className="text-sm font-semibold text-texto-suave">{rotulo}</span>
      <span className={cn("text-total font-bold tabular-nums", tons[tom])}>{formatarReais(centavos)}</span>
    </div>
  );
}
