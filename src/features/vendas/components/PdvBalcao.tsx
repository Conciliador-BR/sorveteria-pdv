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
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <GradeProdutos produtos={produtos} aoEscolher={carrinho.adicionar} refBusca={refBusca} />
      <div className="md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto">
        <Carrinho titulo="Venda" rotuloTotal="Total" carrinho={carrinho} vazio="Toque nos produtos para começar a venda.">
          <Button
            ref={refCobrar}
            variante="cobrar"
            tamanho="lg"
            className="w-full"
            disabled={!carrinho.pronto}
            onClick={() => {
              setEnvioDescartado(estado.envio);
              setEtapa("pagamento");
            }}
          >
            Cobrar
          </Button>
          {carrinho.linhas.length > 0 && !carrinho.pronto ? <p className="text-sm text-texto-suave">Falta digitar o peso ou o valor de algum item.</p> : null}
        </Carrinho>
      </div>
    </div>
  );
}
