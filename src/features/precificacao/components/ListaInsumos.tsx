import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import { excluirInsumo } from "../actions";
import type { InsumoLista } from "../queries";
import { custoDeReferencia, rotuloUnidade } from "../regras";
import { BotaoExcluir } from "./BotaoExcluir";
import { InsumoForm } from "./InsumoForm";

export function ListaInsumos({ insumos }: { insumos: InsumoLista[] }) {
  if (insumos.length === 0) {
    return <p className="text-texto-suave">Nenhum insumo ainda. Cadastre o que você compra para fabricar: leite, açúcar, base, casquinha, copo.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {insumos.map((insumo) => {
        const referencia = custoDeReferencia(insumo);
        return (
          <li key={insumo.id}>
            <Card className="p-4">
              <details>
                <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold">{insumo.nome}</span>
                  <span className="text-sm text-texto-suave tabular-nums">
                    {formatarReais(insumo.embalagemPrecoCentavos)} por {insumo.embalagemQuantidade} {rotuloUnidade(insumo.unidade)}
                  </span>
                  <span className="ml-auto text-sm font-semibold tabular-nums">
                    {formatarReais(referencia.centavos)} / {referencia.medida}
                  </span>
                </summary>
                <div className="flex flex-col gap-4 pt-4">
                  <InsumoForm insumo={insumo} />
                  <BotaoExcluir acao={excluirInsumo} id={insumo.id} rotulo="Excluir insumo" />
                </div>
              </details>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
