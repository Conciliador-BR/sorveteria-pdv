import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { estiloBotao } from "@/components/ui/Button";
import { temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { CancelarComandaForm } from "@/features/vendas/components/CancelarComandaForm";
import { ComandaFechada } from "@/features/vendas/components/ComandaFechada";
import { ItensDaComanda } from "@/features/vendas/components/ItensDaComanda";
import { PdvComanda } from "@/features/vendas/components/PdvComanda";
import { buscarComanda, listarBandeirasAtivas, listarProdutosParaVenda } from "@/features/vendas/queries";
import { formatarDataHora } from "@/features/vendas/regras";

export const metadata: Metadata = { title: "Comanda · Sorveteria PDV" };

export default async function ComandaPage({ params }: PageProps<"/comandas/[id]">) {
  const funcionario = await exigirFuncionario();
  const { id } = await params;
  const [comanda, caixa] = await Promise.all([buscarComanda(id), buscarCaixaAberto(funcionario.id)]);
  // O layout não roda de novo em toda navegação: a página confere o caixa por conta própria.
  if (!caixa) redirect("/caixa");
  if (!comanda) notFound();

  const voltar = (
    <Link href="/vender" className={estiloBotao({ variante: "secundario" })}>
      Vender e comandas
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
