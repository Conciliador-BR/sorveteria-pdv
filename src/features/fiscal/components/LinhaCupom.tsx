import type { ReactNode } from "react";

// Rótulo à esquerda, valor à direita: linhas de total e pagamento do cupom.
export function LinhaCupom({ rotulo, valor, destaque = false }: { rotulo: ReactNode; valor: ReactNode; destaque?: boolean }) {
  return (
    <div className={destaque ? "flex justify-between gap-2 font-bold" : "flex justify-between gap-2"}>
      <dt>{rotulo}</dt>
      <dd className="whitespace-nowrap tabular-nums">{valor}</dd>
    </div>
  );
}
