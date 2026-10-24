import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Aviso } from "@/components/ui/Aviso";
import { estiloBotao } from "@/components/ui/Button";
import { temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarDadosFiscais, buscarNomeLoja } from "@/features/configuracoes/queries";
import { BotaoImprimir } from "@/features/fiscal/components/BotaoImprimir";
import { DanfeNfce } from "@/features/fiscal/components/DanfeNfce";
import { EmitirNotaForm } from "@/features/fiscal/components/EmitirNotaForm";
import { ReciboVenda } from "@/features/fiscal/components/ReciboVenda";
import { buscarNotaDaVenda } from "@/features/fiscal/queries";
import { buscarVendaPorId, detalheDaVenda } from "@/features/historico/queries";

export const metadata: Metadata = { title: "Comprovante · Sorveteria PDV" };

// Fora da moldura da área logada: só o cupom de 72 mm e, na tela, os botões (que não saem na impressão).
export default async function ComprovantePage({ params, searchParams }: PageProps<"/comprovante/[id]">) {
  const funcionario = await exigirFuncionario();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  // Mesma regra do detalhe da venda: a própria venda ou quem vê o histórico de todos.
  const veTodas = temPermissao(funcionario, "pode_ver_historico");
  const [venda, detalhe, nota, fiscal, nomeLoja] = await Promise.all([
    buscarVendaPorId(id, veTodas ? undefined : funcionario.id),
    detalheDaVenda(id),
    buscarNotaDaVenda(id),
    buscarDadosFiscais(),
    buscarNomeLoja(),
  ]);
  if (!venda) notFound();

  const semNota = !nota && fiscal.emitirNfce && venda.status === "concluida";
  // Vindo da venda, imprime sozinho; com a NFC-e pendente, espera a emissão para não sair o recibo errado.
  const automatico = (await searchParams).imprimir === "1" && !semNota;

  return (
    <main className="cupom-pagina flex min-h-full flex-1 flex-col items-center gap-6 px-4 py-6 print:p-0">
      <div className="flex w-full max-w-sm flex-col gap-3 print:hidden">
        {venda.status === "aberta" ? <Aviso tipo="info">Esta comanda ainda está aberta: o comprovante mostra os itens até agora.</Aviso> : null}
        {semNota ? (
          <>
            <Aviso tipo="erro">Esta venda ainda não tem NFC-e. Emita antes de imprimir.</Aviso>
            <EmitirNotaForm vendaId={venda.id} />
          </>
        ) : (
          <BotaoImprimir automatico={automatico} />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/vender" className={estiloBotao({ variante: "secundario" })}>
            Nova venda
          </Link>
          <Link href={`/vendas/${venda.id}`} className={estiloBotao({ variante: "fantasma" })}>
            Ver a venda
          </Link>
        </div>
      </div>
      <article
        aria-label={nota ? "DANFE NFC-e" : "Comprovante de venda"}
        className="flex w-[72mm] flex-col gap-2 bg-superficie p-3 font-mono text-xs leading-snug text-texto shadow-suave print:p-0 print:shadow-none"
      >
        {venda.status === "cancelada" ? <p className="border-2 border-texto p-1 text-center text-sm font-bold">VENDA CANCELADA</p> : null}
        {nota ? <DanfeNfce nota={nota} venda={venda} detalhe={detalhe} /> : <ReciboVenda nomeLoja={nomeLoja} venda={venda} detalhe={detalhe} />}
      </article>
    </main>
  );
}
