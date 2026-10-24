import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { formatarReais } from "@/lib/dinheiro";
import { excluirCustoFixo, excluirMaquina } from "../actions";
import type { CustoFixoLista, MaquinaLista } from "../queries";
import { depreciacaoMensal } from "../regras";
import { BotaoExcluir } from "./BotaoExcluir";
import { CustoFixoForm } from "./CustoFixoForm";
import { MaquinaForm } from "./MaquinaForm";

type ListaCustosProps = {
  fixos: CustoFixoLista[];
  maquinas: MaquinaLista[];
  totalFixos: number;
  totalDepreciacao: number;
};

function Linha({ titulo, valor, children }: { titulo: string; valor: string; children: ReactNode }) {
  return (
    <li>
      <Card className="p-4">
        <details>
          <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">{titulo}</span>
            <span className="ml-auto font-semibold tabular-nums">{valor}</span>
          </summary>
          <div className="flex flex-col gap-4 pt-4">{children}</div>
        </details>
      </Card>
    </li>
  );
}

export function ListaCustos({ fixos, maquinas, totalFixos, totalDepreciacao }: ListaCustosProps) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="titulo-lista-fixos" className="flex flex-col gap-3">
        <h3 id="titulo-lista-fixos" className="text-xl font-semibold">
          Custos fixos: {formatarReais(totalFixos)} por mês
        </h3>
        {fixos.length === 0 ? <p className="text-texto-suave">Nenhum custo fixo ainda. São as contas que chegam todo mês, vendendo ou não.</p> : null}
        <ul className="flex flex-col gap-3">
          {fixos.map((custo) => (
            <Linha key={custo.id} titulo={custo.nome} valor={`${formatarReais(custo.valorMensalCentavos)} / mês`}>
              <CustoFixoForm custo={custo} />
              <BotaoExcluir acao={excluirCustoFixo} id={custo.id} rotulo="Excluir custo" />
            </Linha>
          ))}
        </ul>
      </section>
      <section aria-labelledby="titulo-lista-maquinas" className="flex flex-col gap-3">
        <h3 id="titulo-lista-maquinas" className="text-xl font-semibold">
          Depreciação das máquinas: {formatarReais(totalDepreciacao)} por mês
        </h3>
        <p className="text-sm text-texto-suave">
          Depreciação é quanto a máquina perde de valor por mês até precisar trocar. Guardar esse valor no preço paga a próxima máquina.
        </p>
        {maquinas.length === 0 ? <p className="text-texto-suave">Nenhuma máquina ainda.</p> : null}
        <ul className="flex flex-col gap-3">
          {maquinas.map((maquina) => (
            <Linha key={maquina.id} titulo={maquina.nome} valor={`${formatarReais(depreciacaoMensal(maquina))} / mês`}>
              <MaquinaForm maquina={maquina} />
              <BotaoExcluir acao={excluirMaquina} id={maquina.id} rotulo="Excluir máquina" />
            </Linha>
          ))}
        </ul>
      </section>
    </div>
  );
}
