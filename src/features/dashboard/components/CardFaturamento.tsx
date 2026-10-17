import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";

type CardFaturamentoProps = {
  titulo: string;
  faturamentoCentavos: number;
  quantidade: number;
  ticketMedioCentavos: number;
};

export function CardFaturamento({ titulo, faturamentoCentavos, quantidade, ticketMedioCentavos }: CardFaturamentoProps) {
  return (
    <Card className="flex flex-col gap-2 p-4 sm:p-6">
      <h2 className="text-base font-semibold text-texto-suave">{titulo}</h2>
      <p className="text-3xl font-bold text-primaria-escura tabular-nums">{formatarReais(faturamentoCentavos)}</p>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1">
          <dt className="text-texto-suave">Vendas:</dt>
          <dd className="font-semibold tabular-nums">{quantidade}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="text-texto-suave">Ticket médio:</dt>
          <dd className="font-semibold tabular-nums">{formatarReais(ticketMedioCentavos)}</dd>
        </div>
      </dl>
    </Card>
  );
}
