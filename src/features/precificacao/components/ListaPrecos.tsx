import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import type { InsumoLista, ItemFichaLista, ProdutoPrecificar } from "../queries";
import { analisarProduto, rendimentoPadrao, type Parametros } from "../regras";
import { FichaTecnica } from "./FichaTecnica";
import { SimuladorPreco } from "./SimuladorPreco";

type ListaPrecosProps = {
  produtos: ProdutoPrecificar[];
  itens: ItemFichaLista[];
  insumos: InsumoLista[];
  parametros: Parametros & { margemPadraoPercentual: number };
  custosMensaisCentavos: number;
};

export function ListaPrecos({ produtos, itens, insumos, parametros, custosMensaisCentavos }: ListaPrecosProps) {
  if (produtos.length === 0) return <p className="text-texto-suave">Nenhum produto ativo. Cadastre produtos na tela Produtos.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {produtos.map((produto) => {
        const ficha = itens.filter((item) => item.produtoId === produto.id);
        const rendimento = produto.rendimento ?? rendimentoPadrao(produto.tipoVenda);
        const margem = produto.margemPercentual ?? parametros.margemPadraoPercentual;
        const { custo, despesas, preco } = analisarProduto({ tipoVenda: produto.tipoVenda, rendimento, margemPercentual: margem, itens: ficha }, parametros, custosMensaisCentavos);
        const sufixo = produto.tipoVenda === "peso" ? "/kg" : "";

        return (
          <li key={produto.id}>
            <Card className="p-4">
              <details>
                <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold">
                    {produto.nome}
                  </span>
                  {custo === null ? <Badge tom="acento">Sem ficha técnica</Badge> : null}
                  <span className="ml-auto flex flex-wrap gap-x-4 text-sm tabular-nums">
                    <span>
                      Atual <strong>{formatarReais(produto.precoCentavos)}{sufixo}</strong>
                    </span>
                    {preco !== null ? (
                      <span className="text-primaria-escura">
                        Sugerido <strong>{formatarReais(preco)}{sufixo}</strong>
                      </span>
                    ) : null}
                  </span>
                </summary>
                <div className="grid gap-6 pt-4 lg:grid-cols-2">
                  <section aria-label={`Ficha técnica de ${produto.nome}`} className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold">Ficha técnica</h3>
                    <FichaTecnica produtoId={produto.id} itens={ficha} insumos={insumos} />
                  </section>
                  <section aria-label={`Preço de ${produto.nome}`} className="flex flex-col gap-3">
                    <h3 className="text-xl font-semibold">Preço</h3>
                    <SimuladorPreco
                      produto={produto}
                      itens={ficha}
                      rendimentoInicial={rendimento}
                      margemPropria={produto.margemPercentual}
                      margemPadrao={parametros.margemPadraoPercentual}
                      despesasPercentual={despesas.total}
                    />
                  </section>
                </div>
              </details>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
