import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirPermissao } from "@/features/auth/sessao";
import { LancamentoForm } from "@/features/estoque/components/LancamentoForm";
import { ListaMovimentos } from "@/features/estoque/components/ListaMovimentos";
import { TabelaSaldos } from "@/features/estoque/components/TabelaSaldos";
import { listarSaldos, listarUltimosMovimentos } from "@/features/estoque/queries";

export const metadata: Metadata = { title: "Estoque · Sorveteria PDV" };

export default async function EstoquePage() {
  await exigirPermissao("pode_lancar_estoque");
  const [saldos, movimentos] = await Promise.all([listarSaldos(), listarUltimosMovimentos()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Estoque" descricao="Saldo por produto, entradas, saídas e ajustes de contagem." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="titulo-saldos" className="flex flex-col gap-3">
          <h2 id="titulo-saldos" className="text-xl font-semibold">
            Saldos
          </h2>
          <TabelaSaldos saldos={saldos} />
        </section>
        <section aria-labelledby="titulo-lancamento">
          <Card className="flex flex-col gap-4">
            <h2 id="titulo-lancamento" className="text-xl font-semibold">
              Novo lançamento
            </h2>
            <LancamentoForm produtos={saldos} />
          </Card>
        </section>
      </div>
      <section aria-labelledby="titulo-movimentos" className="flex flex-col gap-3">
        <h2 id="titulo-movimentos" className="text-xl font-semibold">
          Últimos lançamentos
        </h2>
        <ListaMovimentos movimentos={movimentos} />
      </section>
    </div>
  );
}
