import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { estiloBotao } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { CancelarComandaForm } from "@/features/vendas/components/CancelarComandaForm";
import { ComandaFechada } from "@/features/vendas/components/ComandaFechada";
import { ItensDaComanda } from "@/features/vendas/components/ItensDaComanda";
import { PdvComanda } from "@/features/vendas/components/PdvComanda";
import { SemCaixaAviso } from "@/features/vendas/components/SemCaixaAviso";
import { TotalDestaque } from "@/features/vendas/components/TotalDestaque";
import { buscarComanda, listarBandeirasAtivas, listarProdutosParaVenda } from "@/features/vendas/queries";
import { formatarDataHora } from "@/features/vendas/regras";

export const metadata: Metadata = { title: "Comanda · Sorveteria PDV" };

export default async function ComandaPage({ params }: PageProps<"/comandas/[id]">) {
  const funcionario = await exigirFuncionario();
  const { id } = await params;
  const [comanda, caixa] = await Promise.all([buscarComanda(id), buscarCaixaAberto(funcionario.id)]);
  if (!comanda) notFound();

  const voltar = (
    <Link href="/vender" className={estiloBotao({ variante: "secundario" })}>
      Ir para Vender
    </Link>
  );
  const cabecalho = (
    <PageHeader
      titulo={`Comanda ${comanda.identificacao ?? comanda.numero}`}
      descricao={`Aberta por ${comanda.abertaPor} em ${formatarDataHora(comanda.abertaEm)}`}
      acoes={voltar}
    />
  );

  if (comanda.status !== "aberta") {
    return (
      <>
        {cabecalho}
        <ComandaFechada comanda={comanda} />
      </>
    );
  }

  const cancelar = temPermissao(funcionario, "pode_cancelar_venda") ? <CancelarComandaForm vendaId={comanda.id} /> : null;

  if (!caixa) {
    return (
      <>
        {cabecalho}
        <SemCaixaAviso texto="Abra o seu caixa para lançar itens ou cobrar esta comanda." />
        <Card className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-xl font-semibold">Itens da comanda</h2>
          <ItensDaComanda itens={comanda.itens} podeRemover={false} />
          <TotalDestaque rotulo="Total da comanda" centavos={comanda.totalCentavos} className="border-t border-borda pt-3" />
        </Card>
        {cancelar}
      </>
    );
  }

  const [produtos, bandeiras] = await Promise.all([listarProdutosParaVenda(), listarBandeirasAtivas()]);
  return (
    <>
      {cabecalho}
      <PdvComanda
        vendaId={comanda.id}
        totalCentavos={comanda.totalCentavos}
        produtos={produtos}
        bandeiras={bandeiras}
        itensLancados={<ItensDaComanda itens={comanda.itens} podeRemover />}
        cancelar={cancelar}
      />
    </>
  );
}
