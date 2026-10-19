import { Aviso } from "@/components/ui/Aviso";
import { Card } from "@/components/ui/Card";
import { DataHora } from "@/features/caixa/components/DataHora";
import { formatarReais } from "@/lib/dinheiro";
import type { VendaCabecalho } from "../queries";
import { rotuloTipo } from "../rotulos";
import { StatusVenda } from "./StatusVenda";

// Resumo da venda no topo do detalhe: quem, quando, como e quanto.
export function CabecalhoVenda({ venda }: { venda: VendaCabecalho }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-texto-suave">Situação</dt>
          <dd>
            <StatusVenda status={venda.status} />
          </dd>
          <dt className="text-texto-suave">Tipo</dt>
          <dd className="font-medium">{rotuloTipo(venda.tipo, venda.identificacao)}</dd>
          <dt className="text-texto-suave">Funcionário</dt>
          <dd className="font-medium">{venda.funcionario}</dd>
          <dt className="text-texto-suave">Aberta em</dt>
          <dd>
            <DataHora valor={venda.abertaEm} />
          </dd>
          {venda.concluidaEm ? (
            <>
              <dt className="text-texto-suave">Concluída em</dt>
              <dd>
                <DataHora valor={venda.concluidaEm} />
              </dd>
            </>
          ) : null}
        </dl>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-texto-suave">Total</span>
          <span className="text-3xl font-bold tabular-nums">{formatarReais(venda.totalCentavos)}</span>
        </div>
      </div>
      {venda.status === "cancelada" ? (
        <Aviso tipo="erro" role="note">
          Cancelada{venda.canceladaPor ? ` por ${venda.canceladaPor}` : ""}
          {venda.canceladaEm ? (
            <>
              {" em "}
              <DataHora valor={venda.canceladaEm} />
            </>
          ) : null}
          {venda.motivoCancelamento ? `. Motivo: ${venda.motivoCancelamento}` : ""}
        </Aviso>
      ) : null}
    </Card>
  );
}
