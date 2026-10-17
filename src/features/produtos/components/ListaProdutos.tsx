import { Card } from "@/components/ui/Card";
import type { ProdutoLista } from "../queries";
import { ItemProduto } from "./ItemProduto";

type ListaProdutosProps = {
  produtos: ProdutoLista[];
  categorias: { id: string; nome: string; ativo: boolean }[];
};

// Agrupa na ordem que a consulta já devolve (ordem da categoria, depois nome).
function agruparPorCategoria(produtos: ProdutoLista[]) {
  const grupos = new Map<string, ProdutoLista[]>();
  for (const produto of produtos) {
    const nome = produto.categoria ?? "Sem categoria";
    const grupo = grupos.get(nome);
    if (grupo) grupo.push(produto);
    else grupos.set(nome, [produto]);
  }
  return [...grupos];
}

export function ListaProdutos({ produtos, categorias }: ListaProdutosProps) {
  if (produtos.length === 0) {
    return (
      <Card className="flex flex-col gap-2">
        <p className="text-xl font-semibold">Nenhum produto cadastrado ainda</p>
        <p className="text-texto-suave">
          Crie as categorias (por exemplo, Picolés e Sorvete por kg) e depois cadastre o primeiro produto no formulário
          &ldquo;Novo produto&rdquo;.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {agruparPorCategoria(produtos).map(([categoria, itens]) => (
        <section key={categoria} aria-label={categoria} className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">
            {categoria} <span className="text-base font-normal text-texto-suave">({itens.length})</span>
          </h3>
          {itens.map((produto) => (
            <ItemProduto key={produto.id} produto={produto} categorias={categorias} />
          ))}
        </section>
      ))}
    </div>
  );
}
