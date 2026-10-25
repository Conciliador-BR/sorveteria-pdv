import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirFuncionario } from "@/features/auth/sessao";
import { AbrirCaixaForm } from "@/features/caixa/components/AbrirCaixaForm";
import { buscarCaixaAberto } from "@/features/caixa/queries";

export const metadata: Metadata = { title: "Abrir caixa · Sorveteria PDV" };

export default async function CaixaPage() {
  const funcionario = await exigirFuncionario();
  // Caixa aberto vive na tela de vendas (modo caixa), com sangria e fechamento.
  if (await buscarCaixaAberto(funcionario.id)) redirect("/vender/caixa");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Abrir caixa"
        descricao="Confirme sua senha e o fundo de troco. Depois de abrir, o sistema entra na tela de vendas."
      />
      <Card className="flex max-w-lg flex-col gap-4">
        <AbrirCaixaForm />
      </Card>
    </div>
  );
}
