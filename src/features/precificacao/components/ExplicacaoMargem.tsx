import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import { lucroDoPreco, markupPercentual, precoSomandoNoCusto, precoSugerido } from "../regras";

// Exemplo fixo, calculado pelas mesmas regras da tela: custo R$ 2,30, despesas 20%, margem 30%.
const CUSTO = 230;
const DESPESAS = 2000;
const MARGEM = 3000;

export function ExplicacaoMargem() {
  const preco = precoSugerido(CUSTO, DESPESAS, MARGEM) ?? 0;
  const lucro = lucroDoPreco(preco, CUSTO, DESPESAS);
  const somando = precoSomandoNoCusto(CUSTO, MARGEM);
  const lucroSomando = lucroDoPreco(somando, CUSTO, DESPESAS);

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Margem e markup: qual a diferença?</h2>
      <p>
        <strong>Margem</strong> é quanto do <em>preço de venda</em> fica de lucro no seu bolso, depois de pagar tudo. Margem de 30% num
        sorvete de R$ 10,00 = R$ 3,00 de lucro.
      </p>
      <p>
        <strong>Markup</strong> é quanto você soma <em>em cima do custo</em>. Parece a mesma coisa, mas não é.
      </p>
      <div className="rounded-campo bg-primaria-suave p-4 text-primaria-escura">
        <p className="font-semibold">Exemplo: custo de {formatarReais(CUSTO)}, despesas de 20% e margem de 30%.</p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          <li>
            Pela margem, o preço é <strong>{formatarReais(preco)}</strong> e sobram {formatarReais(lucro.lucroCentavos)} de lucro (30%). O markup
            equivalente é de {markupPercentual(preco, CUSTO) / 100}%.
          </li>
          <li>
            Se só somasse 30% no custo, o preço seria {formatarReais(somando)} e sobrariam {formatarReais(lucroSomando.lucroCentavos)}: cerca de{" "}
            {Math.round(lucroSomando.margemPercentual / 100)}% de lucro.
          </li>
        </ul>
      </div>
      <p className="text-sm text-texto-suave">Aqui você sempre digita a margem. A tela mostra o markup junto, para comparar.</p>
    </Card>
  );
}
