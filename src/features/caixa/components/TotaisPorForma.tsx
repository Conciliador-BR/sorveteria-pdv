import type { ResumoCaixa } from "../queries";
import { LinhaValor } from "./LinhaValor";

const rotulosForma = [
  ["dinheiro", "Dinheiro"],
  ["pix", "Pix"],
  ["debito", "Débito"],
  ["credito", "Crédito"],
] as const;

// Vendas concluídas do caixa por forma de pagamento e, no cartão, por bandeira.
export function TotaisPorForma({ pagamentos }: { pagamentos: ResumoCaixa["pagamentos"] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section aria-labelledby="titulo-por-forma">
        <h3 id="titulo-por-forma" className="mb-2 text-base font-semibold">
          Vendas por forma
        </h3>
        <dl className="divide-y divide-borda">
          {rotulosForma.map(([forma, rotulo]) => (
            <LinhaValor key={forma} rotulo={rotulo} centavos={pagamentos.porForma[forma]} />
          ))}
          <LinhaValor rotulo="Total vendido" centavos={pagamentos.total} className="font-semibold" />
        </dl>
      </section>
      <section aria-labelledby="titulo-por-bandeira">
        <h3 id="titulo-por-bandeira" className="mb-2 text-base font-semibold">
          Cartão por bandeira
        </h3>
        {pagamentos.porBandeira.length === 0 ? (
          <p className="text-texto-suave">Nenhuma venda no cartão.</p>
        ) : (
          <dl className="divide-y divide-borda">
            {pagamentos.porBandeira.map((linha) => (
              <LinhaValor key={linha.nome} rotulo={linha.nome} centavos={linha.valorCentavos} />
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
