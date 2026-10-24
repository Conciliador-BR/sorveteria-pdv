import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { PainelComandas } from "@/features/vendas/components/PainelComandas";
import { PdvBalcao } from "@/features/vendas/components/PdvBalcao";
import { listarBandeirasAtivas, listarComandasAbertas, listarProdutosParaVenda } from "@/features/vendas/queries";

export const metadata: Metadata = { title: "Vender e comandas · Sorveteria PDV" };

export default async function VenderPage() {
  const funcionario = await exigirFuncionario();
  // O layout não roda de novo em toda navegação: a página confere o caixa por conta própria.
  const caixa = await buscarCaixaAberto(funcionario.id);
  if (!caixa) redirect("/caixa");

  const [comandas, produtos, bandeiras] = await Promise.all([listarComandasAbertas(), listarProdutosParaVenda(), listarBandeirasAtivas()]);
  return (
    <>
      {/* PDV sem cabeçalho de página: o título fica só para leitores de tela. */}
      <h1 className="sr-only">Vender e comandas</h1>
      <PainelComandas comandas={comandas} podeAbrir />
      {/* Sem título visível: produtos, carrinho e pagamento já têm os próprios títulos. */}
      <section aria-label="Venda no balcão" className="md:min-h-0 md:flex-1">
        <PdvBalcao produtos={produtos} bandeiras={bandeiras} />
      </section>
    </>
  );
}
