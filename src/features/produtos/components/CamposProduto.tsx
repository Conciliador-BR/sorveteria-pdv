"use client";

import { useId, useState } from "react";
import { CaixaSelecao } from "@/components/ui/CaixaSelecao";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { Selecao } from "@/components/ui/Selecao";
import type { ProdutoLista } from "../queries";

type Categoria = { id: string; nome: string; ativo: boolean };
type TipoVenda = ProdutoLista["tipoVenda"];

type CamposProdutoProps = {
  produto?: ProdutoLista;
  categorias: Categoria[];
  erros: Record<string, string>;
};

// Campos do cadastro/edição. O tipo de venda muda rótulos e o padrão da baixa automática.
export function CamposProduto({ produto, categorias, erros }: CamposProdutoProps) {
  const [tipo, setTipo] = useState<TipoVenda>(produto?.tipoVenda ?? "unidade");
  // Padrão do produto novo: baixa automática ligada para unidade e desligada para peso (controle por balde).
  const [baixa, setBaixa] = useState(produto?.baixaAutomatica ?? true);
  const idTipo = useId();
  const porPeso = tipo === "peso";
  // Mostra categorias ativas e, na edição, a categoria atual mesmo que esteja desativada.
  const opcoesCategoria = categorias.filter((categoria) => categoria.ativo || categoria.id === produto?.categoriaId);

  function trocarTipo(novo: TipoVenda) {
    setTipo(novo);
    if (!produto) setBaixa(novo === "unidade");
  }

  return (
    <>
      {produto ? <input type="hidden" name="id" value={produto.id} /> : null}
      <Campo name="nome" rotulo="Nome" defaultValue={produto?.nome} autoComplete="off" required erro={erros.nome} />
      <Selecao name="categoriaId" rotulo="Categoria" defaultValue={produto?.categoriaId ?? ""} erro={erros.categoriaId}>
        <option value="">Sem categoria</option>
        {opcoesCategoria.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </Selecao>

      <fieldset className="flex flex-col gap-1.5" aria-describedby={erros.tipoVenda ? `${idTipo}-erro` : undefined}>
        <legend className="mb-1.5 text-sm font-semibold">Como é vendido</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["unidade", "Por unidade"],
              ["peso", "Por peso (kg)"],
            ] as const
          ).map(([valor, rotulo]) => (
            <label
              key={valor}
              className="flex min-h-12 cursor-pointer items-center gap-2 rounded-campo border-2 border-borda-forte px-3 font-medium has-checked:border-primaria has-checked:bg-primaria-suave has-checked:text-primaria-escura"
            >
              <input
                type="radio"
                name="tipoVenda"
                value={valor}
                checked={tipo === valor}
                onChange={() => trocarTipo(valor)}
                className="size-5 accent-primaria"
              />
              {rotulo}
            </label>
          ))}
        </div>
        {erros.tipoVenda ? (
          <p id={`${idTipo}-erro`} className="text-sm font-medium text-perigo">
            {erros.tipoVenda}
          </p>
        ) : null}
      </fieldset>

      <CampoDinheiro
        name="precoCentavos"
        rotulo={porPeso ? "Preço do quilo" : "Preço"}
        valorInicialCentavos={produto?.precoCentavos}
        dica={porPeso ? "Preço de 1 kg. No balcão, o valor é calculado pelo peso em gramas." : undefined}
        required
        erro={erros.precoCentavos}
      />
      <Campo
        name="codigo"
        rotulo="Código (opcional)"
        defaultValue={produto?.codigo ?? ""}
        autoComplete="off"
        spellCheck={false}
        dica="Código curto ou de barras para achar o produto rápido."
        erro={erros.codigo}
      />
      <Campo
        name="estoqueMinimo"
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        rotulo={porPeso ? "Estoque mínimo (em gramas)" : "Estoque mínimo (em unidades)"}
        defaultValue={produto?.estoqueMinimo ?? 0}
        dica={porPeso ? "Em gramas: 5 kg = 5000. Abaixo disso, o estoque mostra alerta." : "Abaixo disso, o estoque mostra alerta."}
        erro={erros.estoqueMinimo}
      />
      <CaixaSelecao
        name="baixaAutomatica"
        rotulo="Baixa automática na venda"
        dica={porPeso ? "Normalmente desligada para peso: o controle é por balde, lançado no estoque." : "Cada venda tira a quantidade vendida do estoque."}
        checked={baixa}
        onChange={(evento) => setBaixa(evento.target.checked)}
      />
      {produto ? (
        <CaixaSelecao name="ativo" rotulo="Ativo" dica="Desmarque para tirar do balcão. As vendas antigas ficam guardadas." defaultChecked={produto.ativo} />
      ) : (
        <input type="hidden" name="ativo" value="on" />
      )}
    </>
  );
}
