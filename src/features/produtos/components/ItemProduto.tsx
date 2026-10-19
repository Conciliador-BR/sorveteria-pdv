import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import type { ProdutoLista } from "../queries";
import { ProdutoForm } from "./ProdutoForm";

type ItemProdutoProps = {
  produto: ProdutoLista;
  categorias: { id: string; nome: string; ativo: boolean }[];
};

// Linha do produto; abre o formulário de edição no próprio cartão.
export function ItemProduto({ produto, categorias }: ItemProdutoProps) {
  const porPeso = produto.tipoVenda === "peso";
  return (
    <Card className="p-4">
      <details>
        <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold">{produto.nome}</span>
          <span className="font-semibold text-primaria-escura tabular-nums">
            {formatarReais(produto.precoCentavos)}
            {porPeso ? "/kg" : null}
          </span>
          <Badge tom="neutro">{porPeso ? "Por peso" : "Unidade"}</Badge>
          {produto.codigo ? <span className="text-sm text-texto-suave">Cód. {produto.codigo}</span> : null}
          {produto.ativo ? <Badge tom="sucesso">Ativo</Badge> : <Badge tom="perigo">Inativo</Badge>}
          {produto.baixaAutomatica ? <Badge tom="primaria">Baixa automática</Badge> : null}
          <span className="ml-auto text-sm font-semibold text-primaria-escura">Editar</span>
        </summary>
        <div className="pt-4">
          <ProdutoForm produto={produto} categorias={categorias} />
        </div>
      </details>
    </Card>
  );
}
