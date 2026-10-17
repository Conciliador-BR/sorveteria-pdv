import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { exigirDono } from "@/features/auth/sessao";
import { DistribuicaoDoMes } from "@/features/dashboard/components/DistribuicaoDoMes";
import { EstoqueBaixo } from "@/features/dashboard/components/EstoqueBaixo";
import { FechamentosComDiferenca } from "@/features/dashboard/components/FechamentosComDiferenca";
import { ResumoFaturamento } from "@/features/dashboard/components/ResumoFaturamento";
import { VendasNoTempo } from "@/features/dashboard/components/VendasNoTempo";
import { painelDoDono } from "@/features/dashboard/queries";
import { hojeNaLoja } from "@/features/historico/filtros";

export const metadata: Metadata = { title: "Dashboard · Sorveteria PDV" };

export default async function DashboardPage() {
  await exigirDono();
  const painel = await painelDoDono();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Dashboard" descricao="Vendas concluídas da loja, no horário de Brasília." />
      <ResumoFaturamento dia={painel.dia} semana={painel.semana} mes={painel.mes} />
      <VendasNoTempo porDia={painel.porDia} porHora={painel.porHora} hoje={hojeNaLoja()} />
      <DistribuicaoDoMes porForma={painel.porForma} porBandeira={painel.porBandeira} porProduto={painel.porProduto} porFuncionario={painel.porFuncionario} />
      <div className="grid gap-4 md:grid-cols-2">
        <FechamentosComDiferenca fechamentos={painel.fechamentosComDiferenca} />
        <EstoqueBaixo produtos={painel.estoque} />
      </div>
    </div>
  );
}
