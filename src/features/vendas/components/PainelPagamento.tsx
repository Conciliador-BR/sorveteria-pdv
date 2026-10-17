"use client";

import { ArrowLeft, Banknote, CreditCard, QrCode } from "lucide-react";
import { useId, useState } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button } from "@/components/ui/Button";
import { formatarReais } from "@/lib/dinheiro";
import type { EstadoFormulario } from "@/lib/formulario";
import type { BandeirasPorTipo } from "../queries";
import { conferirPagamentos, type PagamentoInformado } from "../regras";
import { BotaoOpcao } from "./BotaoOpcao";
import { FormaCartao } from "./FormaCartao";
import { FormaDinheiro } from "./FormaDinheiro";
import { FormaPix } from "./FormaPix";
import { ListaPagamentos } from "./ListaPagamentos";
import { TotalDestaque } from "./TotalDestaque";

type Forma = "dinheiro" | "pix" | "cartao";

type PainelPagamentoProps = {
  totalCentavos: number;
  bandeiras: BandeirasPorTipo;
  /** Ação de useActionState (venderNoBalcao ou cobrarComanda). */
  acao: (formData: FormData) => void;
  enviando: boolean;
  estado: EstadoFormulario;
  /** Monta o JSON do campo "dados" com os pagamentos finais. */
  montarDados: (pagamentos: PagamentoInformado[]) => unknown;
  aoVoltar: () => void;
};

const formas: { forma: Forma; rotulo: string; Icone: typeof Banknote }[] = [
  { forma: "dinheiro", rotulo: "Dinheiro", Icone: Banknote },
  { forma: "pix", rotulo: "Pix", Icone: QrCode },
  { forma: "cartao", rotulo: "Cartão", Icone: CreditCard },
];

// Ref estável: foca o título uma vez, quando o painel aparece.
const focarAoMontar = (elemento: HTMLElement | null) => elemento?.focus();

// Até 4 partes no total (schemas.ts); a última parte é a que fecha a conta.
const MAXIMO_PARTES = 4;

export function PainelPagamento({ totalCentavos, bandeiras, acao, enviando, estado, montarDados, aoVoltar }: PainelPagamentoProps) {
  const [pagos, setPagos] = useState<PagamentoInformado[]>([]);
  const [forma, setForma] = useState<Forma | null>(null);
  const [rascunho, setRascunho] = useState<PagamentoInformado | null>(null);

  const restante = totalCentavos - pagos.reduce((soma, pagamento) => soma + pagamento.valorCentavos, 0);
  const finais = rascunho ? [...pagos, rascunho] : pagos;
  // Mesma conferência do servidor, para habilitar o botão; o servidor confere de novo.
  const conferencia = conferirPagamentos(totalCentavos, finais);
  const parcial =
    rascunho !== null &&
    rascunho.valorCentavos > 0 &&
    rascunho.valorCentavos < restante &&
    pagos.length < MAXIMO_PARTES - 1 &&
    (rascunho.forma !== "dinheiro" || rascunho.recebidoCentavos === rascunho.valorCentavos);
  const temDinheiro = pagos.some((pagamento) => pagamento.forma === "dinheiro");
  const idPendencia = useId();
  const pendencia = oQueFalta();
  const nomes = new Map([...bandeiras.debito, ...bandeiras.credito].map((bandeira) => [bandeira.id, bandeira.nome]));

  // Texto curto do que impede confirmar, ligado ao botão por aria-describedby.
  function oQueFalta() {
    if (conferencia.ok) return null;
    if (!forma) return pagos.length === 0 ? "Escolha a forma de pagamento." : `Escolha como pagar os ${formatarReais(restante)} que faltam.`;
    if (!rascunho) {
      if (forma === "cartao") return "Escolha débito ou crédito, a bandeira e o valor.";
      return forma === "dinheiro" ? "Digite o valor recebido." : "Digite o valor do Pix.";
    }
    const soma = finais.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
    if (soma < totalCentavos) return `Faltam ${formatarReais(totalCentavos - soma)}.`;
    return conferencia.erro;
  }

  function escolher(nova: Forma) {
    // Tocar de novo na forma já aberta não apaga o que foi digitado.
    if (nova === forma) return;
    setForma(nova);
    setRascunho(nova === "pix" ? { forma: "pix", valorCentavos: restante } : null);
  }

  function reiniciarForma() {
    setForma(null);
    setRascunho(null);
  }

  return (
    <form
      action={acao}
      onSubmit={(evento) => {
        if (enviando || !conferencia.ok) evento.preventDefault();
      }}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-card border border-borda bg-superficie p-4 shadow-suave md:p-6"
      aria-labelledby="titulo-pagamento"
    >
      <input type="hidden" name="dados" value={JSON.stringify(montarDados(finais))} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="titulo-pagamento" ref={focarAoMontar} tabIndex={-1} className="text-2xl font-bold">
            Pagamento
          </h2>
          <Button variante="fantasma" onClick={aoVoltar} disabled={enviando} className="-ml-3 self-start">
            <ArrowLeft aria-hidden="true" className="size-5" />
            Voltar aos itens
          </Button>
        </div>
        {/* Ao vivo e sempre montado: anuncia "Falta pagar" quando uma parte é lançada ou removida. */}
        <div aria-live="polite" aria-atomic="true" className="flex flex-wrap gap-x-8 gap-y-2">
          <TotalDestaque rotulo="Total" centavos={totalCentavos} aoVivo={false} />
          {pagos.length > 0 ? <TotalDestaque rotulo="Falta pagar" centavos={restante} tom="perigo" aoVivo={false} /> : null}
        </div>
      </div>

      {estado.erro ? (
        <Aviso key={estado.envio} tipo="erro">
          {estado.erro}
        </Aviso>
      ) : null}

      {pagos.length > 0 ? (
        <ListaPagamentos
          pagamentos={pagos}
          nomeBandeira={(id) => nomes.get(id) ?? "Cartão"}
          desabilitado={enviando}
          aoRemover={(indice) => {
            setPagos((atual) => atual.filter((_, posicao) => posicao !== indice));
            reiniciarForma();
          }}
        />
      ) : null}

      <div role="group" aria-label="Forma de pagamento" className="grid grid-cols-3 gap-2 sm:gap-3">
        {formas.map(({ forma: opcao, rotulo, Icone }) => (
          <BotaoOpcao
            key={opcao}
            selecionado={forma === opcao}
            disabled={enviando || (opcao === "dinheiro" && temDinheiro)}
            onClick={() => escolher(opcao)}
            // No celular (375 px) o texto menor e o respiro lateral curto fazem "Dinheiro" caber.
            className="min-h-24 min-w-0 px-1 text-base sm:px-4 sm:text-xl"
          >
            <Icone aria-hidden="true" className="size-7" />
            {rotulo}
          </BotaoOpcao>
        ))}
      </div>

      {/* A key reinicia a forma quando uma parte é lançada ou removida. */}
      {forma === "dinheiro" ? <FormaDinheiro key={`dinheiro-${restante}`} restanteCentavos={restante} aoMudar={setRascunho} /> : null}
      {forma === "pix" ? <FormaPix key={`pix-${restante}`} restanteCentavos={restante} aoMudar={setRascunho} /> : null}
      {forma === "cartao" ? <FormaCartao key={`cartao-${restante}`} restanteCentavos={restante} bandeiras={bandeiras} aoMudar={setRascunho} /> : null}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variante="cobrar"
          tamanho="lg"
          disabled={!conferencia.ok}
          carregando={enviando}
          textoCarregando="Salvando…"
          aria-describedby={pendencia && !enviando ? idPendencia : undefined}
          className="w-full"
        >
          {forma === "pix" ? "Pix recebido" : "Confirmar pagamento"}
        </Button>
        {pendencia && !enviando ? (
          <p id={idPendencia} className="text-center text-sm font-medium text-texto-suave">
            {pendencia}
          </p>
        ) : null}
        {parcial && rascunho ? (
          <Button
            variante="secundario"
            disabled={enviando}
            onClick={() => {
              setPagos((atual) => [...atual, rascunho]);
              reiniciarForma();
            }}
          >
            Lançar {formatarReais(rascunho.valorCentavos)} e pagar o resto de outra forma
          </Button>
        ) : null}
      </div>
    </form>
  );
}
