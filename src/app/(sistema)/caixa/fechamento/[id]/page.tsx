import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { estiloBotao } from "@/components/ui/Button";
import { ehDono } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { ReabrirCaixaForm } from "@/features/caixa/components/ReabrirCaixaForm";
import { ResumoFechamento } from "@/features/caixa/components/ResumoFechamento";
import { buscarCaixaPorId, resumoDoCaixa } from "@/features/caixa/queries";

export const metadata: Metadata = { title: "Fechamento de caixa · Sorveteria PDV" };

export default async function FechamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const funcionario = await exigirFuncionario();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const caixa = await buscarCaixaPorId(id);
  // Só o dono do caixa ou o dono da loja veem o fechamento; para os demais, a página não existe.
  if (!caixa || (caixa.funcionarioId !== funcionario.id && !ehDono(funcionario))) notFound();
  const resumo = await resumoDoCaixa(caixa.id);
  if (!resumo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Fechamento de caixa"
        descricao="Conferência do dinheiro e vendas do caixa."
        acoes={
          <Link href="/caixa" className={estiloBotao({ variante: "secundario" })}>
            Voltar ao caixa
          </Link>
        }
      />
      <ResumoFechamento caixa={caixa} resumo={resumo} />
      {/* Só o dono reabre; o componente fica montado depois de reabrir para mostrar a confirmação. */}
      {ehDono(funcionario) ? <ReabrirCaixaForm caixaId={caixa.id} caixaFechado={caixa.status === "fechado"} /> : null}
    </div>
  );
}
