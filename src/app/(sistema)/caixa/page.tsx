import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirFuncionario } from "@/features/auth/sessao";
import { AbrirCaixaForm } from "@/features/caixa/components/AbrirCaixaForm";
import { AtalhosCaixa } from "@/features/caixa/components/AtalhosCaixa";
import { FecharCaixaForm } from "@/features/caixa/components/FecharCaixaForm";
import { ListaMovimentos } from "@/features/caixa/components/ListaMovimentos";
import { MovimentoCaixaForm } from "@/features/caixa/components/MovimentoCaixaForm";
import { ResumoCaixa } from "@/features/caixa/components/ResumoCaixa";
import { buscarCaixaAberto, listarMovimentosDoCaixa, resumoDoCaixa } from "@/features/caixa/queries";

export const metadata: Metadata = { title: "Caixa · Sorveteria PDV" };

export default async function CaixaPage() {
  const funcionario = await exigirFuncionario();
  const caixa = await buscarCaixaAberto(funcionario.id);

  if (!caixa) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader titulo="Abrir caixa" descricao="Sem caixa aberto não dá para vender. Confirme sua senha e o fundo de troco." />
        <Card className="flex max-w-lg flex-col gap-4">
          <AbrirCaixaForm />
        </Card>
      </div>
    );
  }

  const [resumo, movimentos] = await Promise.all([resumoDoCaixa(caixa.id), listarMovimentosDoCaixa(caixa.id)]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Caixa" descricao={`Caixa de ${funcionario.nome}: sangria, suprimento e fechamento.`} />
      <AtalhosCaixa />
      {resumo ? <ResumoCaixa abertoEm={caixa.abertoEm} semFundo={caixa.semFundo} resumo={resumo} /> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="titulo-movimentos">
          <Card className="flex flex-col gap-4">
            <h2 id="titulo-movimentos" className="text-xl font-semibold">
              Sangria e suprimento
            </h2>
            <MovimentoCaixaForm />
            <ListaMovimentos movimentos={movimentos} />
          </Card>
        </section>
        <section aria-labelledby="titulo-fechar">
          <Card className="flex flex-col gap-4">
            <h2 id="titulo-fechar" className="text-xl font-semibold">
              Fechar caixa
            </h2>
            <FecharCaixaForm />
          </Card>
        </section>
      </div>
    </div>
  );
}
