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
    <Card className="relative flex flex-col gap-2 overflow-hidden p-4 sm:p-6">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-90 from-primaria via-sucesso to-acento" />
      <h2 className="text-sm font-semibold tracking-wide text-texto-suave uppercase">{titulo}</h2>
      <p className="font-titulo text-3xl font-extrabold tracking-tight text-texto tabular-nums">{formatarReais(faturamentoCentavos)}</p>
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
