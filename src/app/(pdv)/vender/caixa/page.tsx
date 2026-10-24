import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ehDono } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { FecharCaixaForm } from "@/features/caixa/components/FecharCaixaForm";
import { ListaMovimentos } from "@/features/caixa/components/ListaMovimentos";
import { MovimentoCaixaForm } from "@/features/caixa/components/MovimentoCaixaForm";
import { ResumoCaixa } from "@/features/caixa/components/ResumoCaixa";
import { buscarCaixaAberto, listarMovimentosDoCaixa, resumoDoCaixa } from "@/features/caixa/queries";

export const metadata: Metadata = { title: "Caixa · Sorveteria PDV" };

// Caixa aberto dentro da tela de vendas: sangria, suprimento e fechamento (a única saída do funcionário).
export default async function CaixaAbertoPage() {
  const funcionario = await exigirFuncionario();
  const caixa = await buscarCaixaAberto(funcionario.id);
  if (!caixa) redirect("/caixa");

  const [resumo, movimentos] = await Promise.all([resumoDoCaixa(caixa.id), listarMovimentosDoCaixa(caixa.id)]);
  const saida = ehDono(funcionario) ? "" : " Para sair da tela de vendas, feche o caixa.";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Caixa" descricao={`Caixa de ${funcionario.nome}: sangria, suprimento e fechamento.${saida}`} />
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
        {/* `id="fechar"`: o aviso do Esc leva direto a este formulário. */}
        <section id="fechar" aria-labelledby="titulo-fechar" className="scroll-mt-24">
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
