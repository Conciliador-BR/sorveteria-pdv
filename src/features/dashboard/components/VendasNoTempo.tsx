import type { PainelDono } from "../queries";
import { barrasPorDia, barrasPorHora } from "../graficos";
import { GraficoColunas } from "./GraficoColunas";
import { SecaoPainel } from "./SecaoPainel";

type VendasNoTempoProps = Pick<PainelDono, "porHora" | "porDia"> & { hoje: string };

const SEM_VENDAS = "Ainda não há vendas nos últimos 30 dias.";

// Faturamento dos últimos 30 dias por dia e por hora do dia (horário da loja).
export function VendasNoTempo({ porHora, porDia, hoje }: VendasNoTempoProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SecaoPainel titulo="Vendas por dia" descricao="Últimos 30 dias" vazio={porDia.length === 0} mensagemVazia={SEM_VENDAS}>
        <GraficoColunas barras={barrasPorDia(porDia, hoje)} legenda="Faturamento por dia nos últimos 30 dias" rotuloColuna="Dia" />
      </SecaoPainel>
      <SecaoPainel titulo="Vendas por hora" descricao="Soma dos últimos 30 dias, por hora do dia" vazio={porHora.length === 0} mensagemVazia={SEM_VENDAS}>
        <GraficoColunas barras={barrasPorHora(porHora)} legenda="Faturamento por hora do dia nos últimos 30 dias" rotuloColuna="Hora" />
      </SecaoPainel>
    </div>
  );
}
