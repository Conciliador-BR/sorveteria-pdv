import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { estiloBotao } from "@/components/ui/Button";
import { formatarQuantidade, situacaoEstoque } from "@/features/estoque/regras";
import type { PainelDono } from "../queries";
import { SecaoPainel } from "./SecaoPainel";

// Produtos ativos no mínimo, abaixo dele ou negativos.
export function EstoqueBaixo({ produtos }: { produtos: PainelDono["estoque"] }) {
  return (
    <SecaoPainel
      titulo="Estoque baixo"
      descricao="Produtos no mínimo ou abaixo dele"
      vazio={produtos.length === 0}
      mensagemVazia="Nenhum produto com estoque baixo. Tudo certo!"
    >
      <ul className="flex flex-col divide-y divide-borda">
        {produtos.map((produto) => {
          const negativo = situacaoEstoque(produto.saldo, produto.estoqueMinimo) === "negativo";
          return (
            <li key={produto.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="font-medium">{produto.nome}</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="tabular-nums">
                  {formatarQuantidade(produto.saldo, produto.tipoVenda)}
                  <span className="text-texto-suave"> / mín. {formatarQuantidade(produto.estoqueMinimo, produto.tipoVenda)}</span>
                </span>
                <Badge tom={negativo ? "perigo" : "acento"}>{negativo ? "Negativo" : "Baixo"}</Badge>
              </span>
            </li>
          );
        })}
      </ul>
      <Link href="/estoque" className={estiloBotao({ variante: "secundario", className: "self-start" })}>
        Ir para o estoque
      </Link>
    </SecaoPainel>
  );
}
