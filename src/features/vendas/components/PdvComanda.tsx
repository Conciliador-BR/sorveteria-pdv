"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { Aviso } from "@/components/ui/Aviso";
import { Button, estiloBotao } from "@/components/ui/Button";
import type { EstadoFormulario } from "@/lib/formulario";
import { cobrarComanda, lancarNaComanda, type EstadoVenda } from "../actions";
import type { BandeirasPorTipo, ProdutoParaVenda } from "../queries";
import { itensParaEnvio, novoIdVenda } from "../regras";
import { useCarrinho } from "../useCarrinho";
import { useTeclasPdv } from "../useTeclasPdv";
import { Carrinho } from "./Carrinho";
import { ConfirmacaoVenda } from "./ConfirmacaoVenda";
import { GradeProdutos } from "./GradeProdutos";
import { PainelPagamento } from "./PainelPagamento";
import { TotalDestaque } from "./TotalDestaque";

type PdvComandaProps = {
  vendaId: string;
  totalCentavos: number;
  produtos: ProdutoParaVenda[];
  bandeiras: BandeirasPorTipo;
  /** Lista dos itens já lançados (renderizada no servidor). */
  itensLancados: ReactNode;
  /** Ação de cancelar, só para quem tem permissão. */
  cancelar?: ReactNode;
};

// Ref estável: foca o título da confirmação uma vez, quando ela aparece.
const focarAoMontar = (elemento: HTMLElement | null) => elemento?.focus();

export function PdvComanda({ vendaId, totalCentavos, produtos, bandeiras, itensLancados, cancelar }: PdvComandaProps) {
  const carrinho = useCarrinho();
  const [etapa, setEtapa] = useState<"itens" | "pagamento">("itens");
  // Um id por lançamento: se o mesmo envio chegar duas vezes, o servidor lança uma vez só.
  const [idLancamento, setIdLancamento] = useState(() => novoIdVenda());
  const [lancamento, lancar, lancando] = useActionState(async (anterior: EstadoFormulario, formData: FormData) => {
    const resultado = await lancarNaComanda(anterior, formData);
    if (resultado.ok) {
      carrinho.limpar();
      setIdLancamento(novoIdVenda());
    }
    return resultado;
  }, {} as EstadoFormulario);
  const [cobranca, cobrar, cobrando] = useActionState(cobrarComanda, {} as EstadoVenda);
  const refBusca = useRef<HTMLInputElement>(null);
  const refCobrar = useRef<HTMLButtonElement>(null);
  const voltouDoPagamento = useRef(false);
  // F2 vai para a busca, como no balcão (a dica da busca promete isso).
  useTeclasPdv({ F2: () => refBusca.current?.focus() }, etapa === "itens" && !cobranca.venda);

  // "Voltar aos itens" devolve o foco ao botão de cobrar (ou à busca, se ele estiver desabilitado).
  useEffect(() => {
    if (etapa !== "itens" || !voltouDoPagamento.current) return;
    voltouDoPagamento.current = false;
    const botao = refCobrar.current;
    if (botao && !botao.disabled) botao.focus();
    else refBusca.current?.focus();
  }, [etapa]);

  if (cobranca.venda) {
    return (
      <ConfirmacaoVenda titulo="Comanda cobrada" venda={cobranca.venda} refTitulo={focarAoMontar}>
        <Link href="/vender" className={estiloBotao({ tamanho: "lg", className: "w-full" })}>
          Voltar às comandas
        </Link>
      </ConfirmacaoVenda>
    );
  }

  if (etapa === "pagamento") {
    return (
      <PainelPagamento
        totalCentavos={totalCentavos}
        bandeiras={bandeiras}
        acao={cobrar}
        enviando={cobrando}
        estado={cobranca}
        montarDados={(pagamentos) => ({ vendaId, pagamentos })}
        aoVoltar={() => {
          voltouDoPagamento.current = true;
          setEtapa("itens");
        }}
      />
    );
  }

  const pendentes = carrinho.linhas.length > 0;

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
      <GradeProdutos produtos={produtos} aoEscolher={carrinho.adicionar} refBusca={refBusca} />
      <div className="flex flex-col gap-4">
        <section aria-labelledby="titulo-itens-comanda" className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4 shadow-suave">
          <h2 id="titulo-itens-comanda" className="text-xl font-semibold">
            Itens da comanda
          </h2>
          {itensLancados}
          <TotalDestaque rotulo="Total da comanda" centavos={totalCentavos} className="border-t border-borda pt-3" />
          <Button
            ref={refCobrar}
            variante="cobrar"
            tamanho="lg"
            className="w-full"
            disabled={totalCentavos <= 0 || pendentes}
            onClick={() => setEtapa("pagamento")}
          >
            Cobrar comanda
          </Button>
          {pendentes ? <p className="text-sm text-texto-suave">Lance ou tire os novos itens antes de cobrar.</p> : null}
        </section>

        <form action={lancar} onSubmit={(evento) => (lancando || !carrinho.pronto) && evento.preventDefault()}>
          <input type="hidden" name="dados" value={JSON.stringify({ id: idLancamento, vendaId, itens: itensParaEnvio(carrinho.linhas) })} />
          <Carrinho titulo="Novos itens" rotuloTotal="Subtotal dos novos itens" carrinho={carrinho} vazio="Toque nos produtos para lançar na comanda.">
            {lancamento.erro || (lancamento.ok && !pendentes) ? (
              <Aviso key={lancamento.envio} tipo={lancamento.erro ? "erro" : "sucesso"}>
                {lancamento.erro ?? lancamento.ok}
              </Aviso>
            ) : null}
            <Button type="submit" tamanho="lg" className="w-full" disabled={!carrinho.pronto} carregando={lancando} textoCarregando="Salvando…">
              Lançar na comanda
            </Button>
          </Carrinho>
        </form>

        {cancelar}
      </div>
    </div>
  );
}
