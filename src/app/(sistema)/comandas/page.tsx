import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { AbrirComandaForm } from "@/features/vendas/components/AbrirComandaForm";
import { ListaComandas } from "@/features/vendas/components/ListaComandas";
import { SemCaixaAviso } from "@/features/vendas/components/SemCaixaAviso";
import { listarComandasAbertas } from "@/features/vendas/queries";

export const metadata: Metadata = { title: "Comandas · Sorveteria PDV" };

export default async function ComandasPage() {
  const funcionario = await exigirFuncionario();
  const [caixa, comandas] = await Promise.all([buscarCaixaAberto(funcionario.id), listarComandasAbertas()]);

  return (
    <>
      <PageHeader titulo="Comandas" descricao="Contas abertas de grupos e mesas. Qualquer funcionário com caixa aberto lança itens." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="titulo-abertas" className="flex flex-col gap-3">
          <h2 id="titulo-abertas" className="text-xl font-semibold">
            Abertas ({comandas.length})
          </h2>
          <ListaComandas comandas={comandas} />
        </section>
        <section aria-labelledby="titulo-nova-comanda">
          <Card className="flex flex-col gap-4">
            <h2 id="titulo-nova-comanda" className="text-xl font-semibold">
              Abrir comanda
            </h2>
            {caixa ? <AbrirComandaForm /> : <SemCaixaAviso texto="Abra o seu caixa para abrir ou lançar em comandas." />}
          </Card>
        </section>
      </div>
    </>
  );
}
