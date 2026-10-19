import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { estiloBotao } from "@/components/ui/Button";
import { ehDono, temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { CabecalhoVenda } from "@/features/historico/components/CabecalhoVenda";
import { CancelarVendaForm } from "@/features/historico/components/CancelarVendaForm";
import { ItensDaVenda } from "@/features/historico/components/ItensDaVenda";
import { PagamentosDaVenda } from "@/features/historico/components/PagamentosDaVenda";
import { buscarVendaPorId, detalheDaVenda } from "@/features/historico/queries";

export const metadata: Metadata = { title: "Detalhe da venda · Sorveteria PDV" };

export default async function VendaPage({ params }: { params: Promise<{ id: string }> }) {
  const funcionario = await exigirFuncionario();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  // Sem permissão de histórico, a venda de outro funcionário simplesmente não existe para ele.
  const veTodas = temPermissao(funcionario, "pode_ver_historico");
  const [venda, detalhe] = await Promise.all([buscarVendaPorId(id, veTodas ? undefined : funcionario.id), detalheDaVenda(id)]);
  if (!venda) notFound();
  const podeCancelar = venda.status !== "cancelada" && temPermissao(funcionario, "pode_cancelar_venda");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo={`Venda nº ${venda.numero}`}
        acoes={
          <Link href="/vendas" className={estiloBotao({ variante: "fantasma" })}>
            <ArrowLeft aria-hidden="true" className="size-5" />
            Histórico
          </Link>
        }
      />
      <CabecalhoVenda venda={venda} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ItensDaVenda itens={detalhe.itens} />
        <PagamentosDaVenda pagamentos={detalhe.pagamentos} trocoCentavos={venda.trocoCentavos} />
      </div>
      {podeCancelar && venda.caixaStatus === "fechado" ? (
        <p className="text-texto-suave">
          O caixa desta venda já foi fechado. Para cancelar, o dono reabre o caixa antes
          {ehDono(funcionario) ? (
            <>
              {": "}
              <Link href={`/caixa/fechamento/${venda.caixaId}`} className="font-semibold text-primaria-escura underline">
                ver o caixa desta venda
              </Link>
            </>
          ) : null}
          .
        </p>
      ) : null}
      {podeCancelar ? <CancelarVendaForm vendaId={venda.id} numero={venda.numero} /> : null}
    </div>
  );
}
