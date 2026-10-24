import type { DetalheVenda, VendaCabecalho } from "@/features/historico/queries";
import { formatarDataHora } from "@/features/vendas/regras";
import type { NotaDaVenda } from "../queries";
import { formatarChave, formatarCnpj } from "../regras";
import { CorpoCupom } from "./CorpoCupom";

type DanfeNfceProps = { nota: NotaDaVenda; venda: VendaCabecalho; detalhe: DetalheVenda };

// DANFE NFC-e na ordem do manual: emitente, título, itens, totais, consulta, consumidor e identificação da nota.
// Em homologação a frase "sem valor fiscal" é obrigatória; a simulação não tem protocolo nem QR Code.
export function DanfeNfce({ nota, venda, detalhe }: DanfeNfceProps) {
  const { emitente } = nota;
  const homologacao = nota.ambiente === "homologacao";
  return (
    <>
      <header className="text-center">
        <p className="text-base font-bold">{emitente.razaoSocial}</p>
        <p>CNPJ {formatarCnpj(emitente.cnpj)} · IE {emitente.inscricaoEstadual}</p>
        <p>
          {emitente.endereco} - {emitente.uf}
        </p>
      </header>
      <p className="text-center font-semibold">DANFE NFC-e - Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica</p>
      {homologacao ? <p className="border border-texto p-1 text-center font-bold">EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL</p> : null}
      <CorpoCupom detalhe={detalhe} totalCentavos={venda.totalCentavos} trocoCentavos={venda.trocoCentavos} />
      <section aria-label="Consulta" className="flex flex-col gap-1 text-center">
        <p>Consulte pela Chave de Acesso no portal da SEFAZ-{emitente.uf}</p>
        <p className="font-semibold tabular-nums">{formatarChave(nota.chaveAcesso)}</p>
      </section>
      <p className="text-center font-semibold">CONSUMIDOR NÃO IDENTIFICADO</p>
      <section aria-label="Identificação da nota" className="flex flex-col gap-1 text-center">
        <p>
          NFC-e nº {String(nota.numero).padStart(9, "0")} Série {String(nota.serie).padStart(3, "0")} {formatarDataHora(nota.emitidaEm)}
        </p>
        <p>{nota.protocolo ? `Protocolo de autorização: ${nota.protocolo}` : "Simulação: sem protocolo de autorização"}</p>
      </section>
      {nota.protocolo ? null : (
        <div className="mx-auto flex size-32 items-center justify-center border border-dashed border-texto p-2 text-center text-xs">
          QR Code disponível com o emissor real
        </div>
      )}
    </>
  );
}
