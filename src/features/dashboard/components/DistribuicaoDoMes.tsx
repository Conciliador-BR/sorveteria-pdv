import { rotuloForma } from "@/features/historico/rotulos";
import type { PainelDono } from "../queries";
import { BarrasHorizontais } from "./BarrasHorizontais";
import { SecaoPainel } from "./SecaoPainel";

type DistribuicaoDoMesProps = Pick<PainelDono, "porForma" | "porBandeira" | "porProduto" | "porFuncionario">;

const plural = (quantidade: number, singular: string, plural: string) => `${quantidade} ${quantidade === 1 ? singular : plural}`;

// Como o faturamento do mês se divide: pagamento, bandeira, produto e funcionário.
export function DistribuicaoDoMes({ porForma, porBandeira, porProduto, porFuncionario }: DistribuicaoDoMesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SecaoPainel titulo="Por forma de pagamento" descricao="Este mês" vazio={porForma.length === 0}>
        <BarrasHorizontais
          linhas={porForma
            .toSorted((a, b) => b.valorCentavos - a.valorCentavos)
            .map((linha) => ({ chave: linha.forma, rotulo: rotuloForma(linha.forma), valorCentavos: linha.valorCentavos }))}
        />
      </SecaoPainel>
      <SecaoPainel titulo="Cartão por bandeira" descricao="Este mês" vazio={porBandeira.length === 0} mensagemVazia="Nenhuma venda no cartão este mês.">
        <BarrasHorizontais
          linhas={porBandeira.map((linha) => ({
            chave: `${linha.forma}-${linha.bandeira}`,
            rotulo: `${rotuloForma(linha.forma)} ${linha.bandeira}`,
            valorCentavos: linha.valorCentavos,
          }))}
        />
      </SecaoPainel>
      <SecaoPainel titulo="Produtos mais vendidos" descricao="Top 10 do mês, por faturamento" vazio={porProduto.length === 0}>
        <BarrasHorizontais linhas={porProduto.map((linha) => ({ chave: linha.nome, rotulo: linha.nome, valorCentavos: linha.valorCentavos }))} />
      </SecaoPainel>
      <SecaoPainel titulo="Por funcionário" descricao="Este mês, por quem cobrou" vazio={porFuncionario.length === 0}>
        <BarrasHorizontais
          linhas={porFuncionario.map((linha) => ({
            chave: linha.nome,
            rotulo: linha.nome,
            valorCentavos: linha.valorCentavos,
            detalhe: plural(linha.quantidade, "venda", "vendas"),
          }))}
        />
      </SecaoPainel>
    </div>
  );
}
