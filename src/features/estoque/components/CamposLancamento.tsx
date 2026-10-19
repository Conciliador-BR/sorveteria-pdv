"use client";

import { useId, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Selecao } from "@/components/ui/Selecao";
import type { SaldoProduto } from "../queries";
import { formatarQuantidade } from "../regras";

type TipoLancamento = "entrada" | "saida" | "ajuste";

const tipos: { valor: TipoLancamento; rotulo: string }[] = [
  { valor: "entrada", rotulo: "Entrada" },
  { valor: "saida", rotulo: "Saída" },
  { valor: "ajuste", rotulo: "Ajuste de contagem" },
];

const motivos: Record<"entrada" | "saida", { valor: string; rotulo: string }[]> = {
  entrada: [
    { valor: "compra", rotulo: "Compra" },
    { valor: "outro", rotulo: "Outro" },
  ],
  saida: [
    { valor: "perda", rotulo: "Perda / derreteu" },
    { valor: "consumo_interno", rotulo: "Consumo interno" },
    { valor: "outro", rotulo: "Outro" },
  ],
};

type CamposLancamentoProps = { produtos: SaldoProduto[]; erros: Record<string, string> };

// O produto escolhido define a unidade (un ou gramas); o tipo define motivo e campo de quantidade.
export function CamposLancamento({ produtos, erros }: CamposLancamentoProps) {
  const [produtoId, setProdutoId] = useState("");
  const [tipo, setTipo] = useState<TipoLancamento>("entrada");
  const idTipo = useId();
  const produto = produtos.find((item) => item.id === produtoId);
  const porPeso = produto?.tipoVenda === "peso";
  const unidade = porPeso ? "em gramas" : "em unidades";
  const dicaPeso = porPeso ? "1 kg = 1000 g. Ex.: um balde de 5 kg = 5000." : undefined;

  return (
    <>
      <Selecao
        name="produtoId"
        rotulo="Produto"
        value={produtoId}
        onChange={(evento) => setProdutoId(evento.target.value)}
        required
        erro={erros.produtoId}
      >
        <option value="">Escolha o produto</option>
        {produtos.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome} ({formatarQuantidade(item.saldo, item.tipoVenda)})
          </option>
        ))}
      </Selecao>

      <fieldset className="flex flex-col gap-1.5" aria-describedby={erros.tipo ? `${idTipo}-erro` : undefined}>
        <legend className="mb-1.5 text-sm font-semibold">Tipo de lançamento</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {tipos.map((opcao) => (
            <label
              key={opcao.valor}
              className="flex min-h-12 cursor-pointer items-center gap-2 rounded-campo border-2 border-borda-forte px-3 font-medium has-checked:border-primaria has-checked:bg-primaria-suave has-checked:text-primaria-escura"
            >
              <input
                type="radio"
                name="tipo"
                value={opcao.valor}
                checked={tipo === opcao.valor}
                onChange={() => setTipo(opcao.valor)}
                className="size-5 accent-primaria"
              />
              {opcao.rotulo}
            </label>
          ))}
        </div>
        {erros.tipo ? (
          <p id={`${idTipo}-erro`} className="text-sm font-medium text-perigo">
            {erros.tipo}
          </p>
        ) : null}
      </fieldset>

      {tipo === "ajuste" ? (
        <Campo
          key="contado"
          name="contado"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          rotulo={`Quanto você contou (${unidade})`}
          dica={[
            produto ? `Saldo no sistema: ${formatarQuantidade(produto.saldo, produto.tipoVenda)}. Lançamos só a diferença.` : "Lançamos só a diferença para o saldo do sistema.",
            dicaPeso,
          ]
            .filter(Boolean)
            .join(" ")}
          required
          erro={erros.contado}
        />
      ) : (
        <>
          <Selecao key={`motivo-${tipo}`} name="motivo" rotulo="Motivo" defaultValue={motivos[tipo][0].valor} erro={erros.motivo}>
            {motivos[tipo].map((motivo) => (
              <option key={motivo.valor} value={motivo.valor}>
                {motivo.rotulo}
              </option>
            ))}
          </Selecao>
          <Campo
            key="quantidade"
            name="quantidade"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            rotulo={`Quantidade (${unidade})`}
            dica={dicaPeso}
            required
            erro={erros.quantidade}
          />
        </>
      )}

      <Campo name="observacao" rotulo="Observação (opcional)" maxLength={200} autoComplete="off" erro={erros.observacao} />
    </>
  );
}
