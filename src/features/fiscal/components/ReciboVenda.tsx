import type { DetalheVenda, VendaCabecalho } from "@/features/historico/queries";
import { formatarDataHora } from "@/features/vendas/regras";
import { CorpoCupom } from "./CorpoCupom";

type ReciboVendaProps = { nomeLoja: string; venda: VendaCabecalho; detalhe: DetalheVenda };

// Comprovante sem valor fiscal: usado quando a emissão de NFC-e está desligada.
export function ReciboVenda({ nomeLoja, venda, detalhe }: ReciboVendaProps) {
  return (
    <>
      <header className="text-center">
        <p className="text-base font-bold">{nomeLoja}</p>
        <p className="font-semibold">COMPROVANTE DE VENDA</p>
        <p>NÃO É DOCUMENTO FISCAL</p>
      </header>
      <dl className="flex flex-col">
        <div className="flex justify-between gap-2">
          <dt>Venda nº</dt>
          <dd>{venda.numero}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Data</dt>
          <dd>{formatarDataHora(venda.concluidaEm ?? venda.abertaEm)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Atendente</dt>
          <dd>{venda.funcionario}</dd>
        </div>
      </dl>
      <CorpoCupom detalhe={detalhe} totalCentavos={venda.totalCentavos} trocoCentavos={venda.trocoCentavos} />
      <p className="text-center">Obrigado pela preferência!</p>
    </>
  );
}
