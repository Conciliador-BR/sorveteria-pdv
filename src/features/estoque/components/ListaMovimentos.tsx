import { Card } from "@/components/ui/Card";
import type { MovimentoEstoque } from "../queries";
import { formatarQuantidade } from "../regras";

const rotulosMotivo: Record<MovimentoEstoque["motivo"], string> = {
  compra: "Compra",
  perda: "Perda / derreteu",
  consumo_interno: "Consumo interno",
  ajuste_contagem: "Ajuste de contagem",
  venda: "Venda",
  cancelamento: "Cancelamento de venda",
  outro: "Outro",
};

const formatoData = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export function ListaMovimentos({ movimentos }: { movimentos: MovimentoEstoque[] }) {
  if (movimentos.length === 0) {
    return (
      <Card>
        <p className="text-texto-suave">Nenhum lançamento ainda. O primeiro aparece aqui assim que for registrado.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <ul className="divide-y divide-borda">
        {movimentos.map((movimento) => {
          const entrou = movimento.quantidade > 0;
          return (
            <li key={movimento.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
              <span className="font-semibold">{movimento.produto}</span>
              <span className={entrou ? "font-semibold text-sucesso-escuro tabular-nums" : "font-semibold text-perigo tabular-nums"}>
                {entrou ? "+" : "−"}
                {formatarQuantidade(Math.abs(movimento.quantidade), movimento.tipoVenda)}
              </span>
              <span className="text-sm">{rotulosMotivo[movimento.motivo]}</span>
              <span className="w-full text-sm text-texto-suave">
                {movimento.funcionario} · <time dateTime={movimento.criadoEm.toISOString()}>{formatoData.format(movimento.criadoEm).replace(",", "")}</time>
                {movimento.observacao ? ` · ${movimento.observacao}` : null}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
