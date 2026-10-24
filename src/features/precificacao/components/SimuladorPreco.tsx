"use client";

import { useActionState, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { RetornoFormulario } from "@/components/ui/RetornoFormulario";
import { formatarReais } from "@/lib/dinheiro";
import type { EstadoFormulario } from "@/lib/formulario";
import { salvarProdutoPrecificacao } from "../actions-ficha";
import {
  custoDaFicha,
  formatarPercentual,
  lerPercentual,
  lucroDoPreco,
  markupPercentual,
  percentualParaCampo,
  precoSugerido,
  type ItemFicha,
  type TipoVenda,
} from "../regras";

type SimuladorPrecoProps = {
  produto: { id: string; tipoVenda: TipoVenda; precoCentavos: number };
  itens: readonly ItemFicha[];
  rendimentoInicial: number;
  margemPropria: number | null;
  margemPadrao: number;
  /** Despesas sobre a venda (fixos, imposto, cartão, perdas), em centésimos de ponto. */
  despesasPercentual: number;
};

function Linha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={destaque ? "flex items-baseline justify-between gap-3 text-2xl" : "flex justify-between gap-3"}>
      <dt className={destaque ? "font-semibold" : undefined}>{rotulo}</dt>
      <dd className={destaque ? "font-bold whitespace-nowrap text-primaria-escura tabular-nums" : "font-semibold whitespace-nowrap tabular-nums"}>{valor}</dd>
    </div>
  );
}

// Digita a margem e vê o preço na hora; o servidor recalcula tudo antes de gravar.
export function SimuladorPreco({ produto, itens, rendimentoInicial, margemPropria, margemPadrao, despesasPercentual }: SimuladorPrecoProps) {
  const [estado, acao, enviando] = useActionState(salvarProdutoPrecificacao, {} as EstadoFormulario);
  const [rendimentoTexto, setRendimentoTexto] = useState(String(rendimentoInicial));
  const [margemTexto, setMargemTexto] = useState(margemPropria === null ? "" : percentualParaCampo(margemPropria));
  const erro = estado.campos ?? {};

  const porPeso = produto.tipoVenda === "peso";
  const medida = porPeso ? "kg" : "unidade";
  const rendimento = /^\d+$/.test(rendimentoTexto) ? Number(rendimentoTexto) : 0;
  const margemDigitada = margemTexto.trim() === "" ? margemPadrao : lerPercentual(margemTexto);
  const custo = custoDaFicha(itens, rendimento, produto.tipoVenda);
  const preco = custo === null || margemDigitada === null ? null : precoSugerido(custo, despesasPercentual, margemDigitada);
  const lucro = preco === null || custo === null ? null : lucroDoPreco(preco, custo, despesasPercentual);
  const atual = custo === null ? null : lucroDoPreco(produto.precoCentavos, custo, despesasPercentual);

  let aviso = "";
  if (custo === null) aviso = itens.length === 0 ? "Monte a ficha técnica acima para calcular o preço." : "Informe quanto a receita rende.";
  else if (margemDigitada === null) aviso = "Digite a margem como número, por exemplo 30 ou 42,5.";
  else if (preco === null) aviso = "Despesas mais margem chegam a 100% ou mais: não existe preço que cubra. Diminua a margem.";

  return (
    <form action={acao} className="flex flex-col gap-4" noValidate>
      <RetornoFormulario estado={estado} />
      <input type="hidden" name="produtoId" value={produto.id} />
      <input type="hidden" name="precoCentavos" value={preco ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          name="rendimento"
          rotulo={porPeso ? "A receita rende quantos gramas" : "A receita rende quantas unidades"}
          inputMode="numeric"
          autoComplete="off"
          value={rendimentoTexto}
          onChange={(evento) => setRendimentoTexto(evento.target.value.replace(/\D/g, ""))}
          required
          dica={porPeso ? "1 kg = 1000 g. Ex.: rende 6 kg → 6000." : "Se a ficha é de 1 unidade, deixe 1."}
          erro={erro.rendimento}
        />
        <Campo
          name="margemPercentual"
          rotulo="Margem de lucro desejada (%)"
          inputMode="decimal"
          autoComplete="off"
          value={margemTexto}
          onChange={(evento) => setMargemTexto(evento.target.value)}
          placeholder={percentualParaCampo(margemPadrao)}
          dica={`Vazio usa a margem padrão (${formatarPercentual(margemPadrao)}).`}
          erro={erro.margemPercentual}
        />
      </div>

      <div aria-live="polite" aria-atomic="true" className="rounded-campo bg-fundo p-4">
        {aviso ? (
          <p className="font-medium text-texto-suave">{aviso}</p>
        ) : (
          <dl className="flex flex-col gap-2">
            <Linha rotulo={`Custo dos insumos por ${medida}`} valor={formatarReais(Math.round(custo ?? 0))} />
            <Linha rotulo={`Preço sugerido por ${medida}`} valor={formatarReais(preco ?? 0)} destaque />
            <Linha rotulo="Lucro por venda" valor={`${formatarReais(lucro?.lucroCentavos ?? 0)} (${formatarPercentual(margemDigitada ?? 0)})`} />
            <Linha rotulo="Markup equivalente (sobre o custo)" valor={formatarPercentual(markupPercentual(preco ?? 0, Math.round(custo ?? 0)))} />
          </dl>
        )}
        {atual ? (
          <p className="mt-3 flex flex-wrap items-center gap-2 border-t border-borda pt-3 text-sm">
            Preço atual no caixa: <strong className="tabular-nums">{formatarReais(produto.precoCentavos)}</strong>
            {atual.lucroCentavos < 0 ? (
              <Badge tom="perigo">Prejuízo de {formatarReais(-atual.lucroCentavos)}</Badge>
            ) : (
              <Badge tom={atual.margemPercentual >= (margemDigitada ?? 0) ? "sucesso" : "acento"}>Margem atual {formatarPercentual(atual.margemPercentual)}</Badge>
            )}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="aplicar" value="nao" variante="secundario" carregando={enviando} textoCarregando="Salvando…">
          Salvar rendimento e margem
        </Button>
        {preco !== null && preco !== produto.precoCentavos ? (
          <Button type="submit" name="aplicar" value="sim" carregando={enviando} textoCarregando="Salvando…">
            Usar {formatarReais(preco)} no caixa
          </Button>
        ) : null}
      </div>
    </form>
  );
}
