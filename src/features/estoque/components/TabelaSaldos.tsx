import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { SaldoProduto } from "../queries";
import { formatarQuantidade, situacaoEstoque, type SituacaoEstoque } from "../regras";

const situacoes: Record<SituacaoEstoque, { rotulo: string; tom: TomBadge }> = {
  negativo: { rotulo: "Negativo", tom: "perigo" },
  baixo: { rotulo: "Baixo", tom: "acento" },
  ok: { rotulo: "OK", tom: "sucesso" },
};

export function TabelaSaldos({ saldos }: { saldos: SaldoProduto[] }) {
  if (saldos.length === 0) {
    return (
      <Card>
        <p className="font-semibold">Nenhum produto ativo.</p>
        <p className="text-texto-suave">Cadastre produtos na tela Produtos para controlar o estoque aqui.</p>
      </Card>
    );
  }

  return (
    // Rolável no celular: recebe foco pelo teclado para rolar com as setas.
    <Card className="overflow-x-auto p-0" tabIndex={0} role="region" aria-label="Saldo de estoque por produto">
      <table className="w-full text-left">
        <caption className="sr-only">Saldo de estoque por produto</caption>
        <thead className="border-b border-borda text-sm text-texto-suave">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Produto</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Saldo</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Mínimo</th>
            <th scope="col" className="px-4 py-3 font-semibold">Situação</th>
          </tr>
        </thead>
        <tbody>
          {saldos.map((item) => {
            const situacao = situacoes[situacaoEstoque(item.saldo, item.estoqueMinimo)];
            return (
              <tr key={item.id} className="border-b border-borda last:border-b-0">
                <th scope="row" className="px-4 py-3 font-medium">{item.nome}</th>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatarQuantidade(item.saldo, item.tipoVenda)}</td>
                <td className="px-4 py-3 text-right text-texto-suave tabular-nums">{formatarQuantidade(item.estoqueMinimo, item.tipoVenda)}</td>
                <td className="px-4 py-3">
                  <Badge tom={situacao.tom}>{situacao.rotulo}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
