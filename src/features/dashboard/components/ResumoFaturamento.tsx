import type { PainelDono } from "../queries";
import { CardFaturamento } from "./CardFaturamento";

type ResumoFaturamentoProps = Pick<PainelDono, "dia" | "semana" | "mes">;

// Vendas concluídas de hoje, da semana (desde segunda) e do mês, no fuso da loja.
export function ResumoFaturamento({ dia, semana, mes }: ResumoFaturamentoProps) {
  const periodos = [
    ["Hoje", dia],
    ["Esta semana", semana],
    ["Este mês", mes],
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {periodos.map(([titulo, totais]) => (
        <CardFaturamento key={titulo} titulo={titulo} {...totais} />
      ))}
    </div>
  );
}
