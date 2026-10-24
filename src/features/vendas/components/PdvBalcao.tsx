"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { venderNoBalcao, type EstadoVenda } from "../actions";
import type { BandeirasPorTipo, ProdutoParaVenda } from "../queries";
import { itensParaEnvio, novoIdVenda } from "../regras";
import { useCarrinho } from "../useCarrinho";
import { Carrinho } from "./Carrinho";
import { ConfirmacaoVenda } from "./ConfirmacaoVenda";
import { GradeProdutos } from "./GradeProdutos";
import { PainelPagamento } from "./PainelPagamento";

type PdvBalcaoProps = { produtos: ProdutoParaVenda[]; bandeiras: BandeirasPorTipo };

export function PdvBalcao({ produtos, bandeiras }: PdvBalcaoProps) {
  const carrinho = useCarrinho();
  const [etapa, setEtapa] = useState<"itens" | "pagamento">("itens");
  const [estado, acao, enviando] = useActionState(venderNoBalcao, {} as EstadoVenda);
  // Resultado já visto (venda confirmada ou erro antigo) não aparece de novo.
  const [envioDescartado, setEnvioDescartado] = useState<number | undefined>();
  // Um id por venda: se o mesmo envio chegar duas vezes, o servidor grava uma só.
  const [idVenda, setIdVenda] = useState(() => novoIdVenda());
  const refBusca = useRef<HTMLInputElement>(null);
  const refCobrar = useRef<HTMLButtonElement>(null);
  // Para onde vai o foco quando a tela de itens volta: "Voltar aos itens" → Cobrar; "Nova venda" → busca.
  const focoAoVoltar = useRef<"cobrar" | "busca" | null>(null);

  useEffect(() => {
    const alvo = focoAoVoltar.current;
    if (etapa !== "itens" || !alvo) return;
    focoAoVoltar.current = null;
    const cobrar = refCobrar.current;
    if (alvo === "cobrar" && cobrar && !cobrar.disabled) cobrar.focus();
    else refBusca.current?.focus();
  }, [etapa, envioDescartado]);

  // Teclas do caixa: F2 vai para a busca e F8 cobra (o botão desabilitado ignora o clique).
  useEffect(() => {
    if (etapa !== "itens") return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "F2") {
        evento.preventDefault();
        refBusca.current?.focus();
      } else if (evento.key === "F8") {
        evento.preventDefault();
        refCobrar.current?.click();
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [etapa]);

  if (estado.venda && estado.envio !== envioDescartado) {
    return (
      <ConfirmacaoVenda titulo="Venda registrada" venda={estado.venda}>
        <Button
          variante="primario"
          tamanho="lg"
          autoFocus
          className="w-full"
          onClick={() => {
            carrinho.limpar();
            setIdVenda(novoIdVenda());
            focoAoVoltar.current = "busca";
            setEtapa("itens");
            setEnvioDescartado(estado.envio);
          }}
        >
          Nova venda
        </Button>
      </ConfirmacaoVenda>
    );
  }

  if (etapa === "pagamento") {
    return (
      <PainelPagamento
        totalCentavos={carrinho.totalCentavos}
        bandeiras={bandeiras}
        acao={acao}
        enviando={enviando}
        estado={estado.envio === envioDescartado ? {} : estado}
        montarDados={(pagamentos) => ({ id: idVenda, itens: itensParaEnvio(carrinho.linhas), pagamentos })}
        aoVoltar={() => {
          focoAoVoltar.current = "cobrar";
          setEtapa("itens");
        }}
      />
    );
  }

  return (
    // Do tablet para cima: produtos rolam à esquerda e o cupom ocupa a altura toda à direita, com o total sempre à vista.
    <div className="flex flex-col gap-4 md:h-full">
      <div className="grid gap-4 md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1fr)_22rem] md:grid-rows-[minmax(0,1fr)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <GradeProdutos produtos={produtos} aoEscolher={carrinho.adicionar} refBusca={refBusca} />
        <div className="md:min-h-0">
          <Carrinho titulo="Cupom" rotuloTotal="Total" carrinho={carrinho} vazio="Toque nos produtos ou busque pelo nome para começar a venda.">
            <Button
              ref={refCobrar}
              variante="cobrar"
              tamanho="lg"
              className="w-full"
              aria-keyshortcuts="F8"
              disabled={!carrinho.pronto}
              onClick={() => {
                setEnvioDescartado(estado.envio);
                setEtapa("pagamento");
              }}
            >
              Cobrar
              <kbd aria-hidden="true" className="hidden rounded-campo border border-superficie/50 px-1.5 text-xs font-medium md:inline">
                F8
              </kbd>
            </Button>
            {carrinho.linhas.length > 0 && !carrinho.pronto ? <p className="text-sm text-texto-suave">Falta digitar o peso ou o valor de algum item.</p> : null}
          </Carrinho>
        </div>
      </div>
      {/* Lembrete das teclas, só onde há teclado físico provável (tablet deitado e computador). */}
      <p className="hidden shrink-0 flex-wrap gap-x-5 gap-y-1 rounded-card bg-tinta px-4 py-2 text-sm text-superficie/80 lg:flex">
        <span>
          <kbd className="font-semibold text-acento">F2</kbd> Buscar produto
        </span>
        <span>
          <kbd className="font-semibold text-acento">F8</kbd> Cobrar
        </span>
        <span>
          <kbd className="font-semibold text-acento">Enter</kbd> Lançar o produto buscado
        </span>
        <span>
          <kbd className="font-semibold text-acento">Esc</kbd> Sair da tela de vendas
        </span>
      </p>
    </div>
  );
}
