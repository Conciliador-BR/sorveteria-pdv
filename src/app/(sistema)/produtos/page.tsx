import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirPermissao } from "@/features/auth/sessao";
import { CategoriaForm } from "@/features/produtos/components/CategoriaForm";
import { ListaCategorias } from "@/features/produtos/components/ListaCategorias";
import { ListaProdutos } from "@/features/produtos/components/ListaProdutos";
import { ProdutoForm } from "@/features/produtos/components/ProdutoForm";
import { listarCategorias, listarProdutos } from "@/features/produtos/queries";

export const metadata: Metadata = { title: "Produtos · Sorveteria PDV" };

export default async function ProdutosPage() {
  await exigirPermissao("pode_gerenciar_produtos");
  const [produtos, categorias] = await Promise.all([listarProdutos(), listarCategorias()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Produtos" descricao="Cadastre produtos, preços e categorias do balcão." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="titulo-produtos" className="flex flex-col gap-3">
          <h2 id="titulo-produtos" className="text-xl font-semibold">
            Cardápio ({produtos.length})
          </h2>
          <ListaProdutos produtos={produtos} categorias={categorias} />
        </section>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="titulo-novo-produto">
            <Card className="flex flex-col gap-4">
              <h2 id="titulo-novo-produto" className="text-xl font-semibold">
                Novo produto
              </h2>
              <ProdutoForm categorias={categorias} />
            </Card>
          </section>
          <section aria-labelledby="titulo-categorias">
            <Card className="flex flex-col gap-4">
              <h2 id="titulo-categorias" className="text-xl font-semibold">
                Categorias
              </h2>
              <ListaCategorias categorias={categorias} />
              <CategoriaForm />
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
