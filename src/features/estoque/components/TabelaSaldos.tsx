import { Badge, type TomBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import type { SaldoProduto } from "../queries";
import { formatarQuantidade, situacaoEstoque, valorEmEstoque, type SituacaoEstoque } from "../regras";

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

  const linhas = saldos.map((item) => ({ ...item, valor: valorEmEstoque(item.saldo, item.precoCentavos, item.tipoVenda) }));
  const valorTotal = linhas.reduce((soma, item) => soma + item.valor, 0);

  return (
    <>
      <Card className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">Total em estoque</span>
        <span className="text-2xl font-bold whitespace-nowrap tabular-nums">{formatarReais(valorTotal)}</span>
      </Card>
      {/* Rolável no celular: recebe foco pelo teclado para rolar com as setas. */}
      <Card className="overflow-x-auto p-0" tabIndex={0} role="region" aria-label="Saldo de estoque por produto">
        <table className="w-full text-left">
          <caption className="sr-only">Saldo de estoque por produto</caption>
          <thead className="border-b border-borda text-sm text-texto-suave">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Produto</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Saldo</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Valor</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Mínimo</th>
              <th scope="col" className="px-4 py-3 font-semibold">Situação</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((item) => {
              const situacao = situacoes[situacaoEstoque(item.saldo, item.estoqueMinimo)];
              return (
                <tr key={item.id} className="border-b border-borda last:border-b-0">
                  <th scope="row" className="px-4 py-3 font-medium">{item.nome}</th>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">{formatarQuantidade(item.saldo, item.tipoVenda)}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">{formatarReais(item.valor)}</td>
                  <td className="px-4 py-3 text-right text-texto-suave whitespace-nowrap tabular-nums">{formatarQuantidade(item.estoqueMinimo, item.tipoVenda)}</td>
                  <td className="px-4 py-3">
                    <Badge tom={situacao.tom}>{situacao.rotulo}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
