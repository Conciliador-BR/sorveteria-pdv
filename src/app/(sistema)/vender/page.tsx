import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { PainelComandas } from "@/features/vendas/components/PainelComandas";
import { PdvBalcao } from "@/features/vendas/components/PdvBalcao";
import { SemCaixaAviso } from "@/features/vendas/components/SemCaixaAviso";
import { listarBandeirasAtivas, listarComandasAbertas, listarProdutosParaVenda } from "@/features/vendas/queries";

export const metadata: Metadata = { title: "Vender e comandas · Sorveteria PDV" };

export default async function VenderPage() {
  const funcionario = await exigirFuncionario();
  const [caixa, comandas] = await Promise.all([buscarCaixaAberto(funcionario.id), listarComandasAbertas()]);

  if (!caixa) {
    return (
      <>
        <PageHeader titulo="Vender e comandas" />
        <SemCaixaAviso texto="Abra o seu caixa antes de vender ou lançar em comandas." />
        <PainelComandas comandas={comandas} podeAbrir={false} />
      </>
    );
  }

  const [produtos, bandeiras] = await Promise.all([listarProdutosParaVenda(), listarBandeirasAtivas()]);
  return (
    <>
      <PageHeader titulo="Vender e comandas" descricao="Venda no balcão aqui embaixo ou toque numa comanda para lançar e cobrar." />
      <PainelComandas comandas={comandas} podeAbrir />
      {/* Sem título visível: produtos, carrinho e pagamento já têm os próprios títulos. */}
      <section aria-label="Venda no balcão">
        <PdvBalcao produtos={produtos} bandeiras={bandeiras} />
      </section>
    </>
  );
}
