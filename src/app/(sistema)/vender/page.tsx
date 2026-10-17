import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { PdvBalcao } from "@/features/vendas/components/PdvBalcao";
import { SemCaixaAviso } from "@/features/vendas/components/SemCaixaAviso";
import { listarBandeirasAtivas, listarProdutosParaVenda } from "@/features/vendas/queries";

export const metadata: Metadata = { title: "Vender · Sorveteria PDV" };

export default async function VenderPage() {
  const funcionario = await exigirFuncionario();
  const caixa = await buscarCaixaAberto(funcionario.id);

  if (!caixa) {
    return (
      <>
        <PageHeader titulo="Vender" />
        <SemCaixaAviso />
      </>
    );
  }

  const [produtos, bandeiras] = await Promise.all([listarProdutosParaVenda(), listarBandeirasAtivas()]);
  return (
    <>
      <PageHeader titulo="Vender" descricao="Toque nos produtos, confira o total e cobre." />
      <PdvBalcao produtos={produtos} bandeiras={bandeiras} />
    </>
  );
}
