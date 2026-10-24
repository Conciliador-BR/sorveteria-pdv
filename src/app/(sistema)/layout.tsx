import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BotaoSair } from "@/features/auth/components/BotaoSair";
import { itensDoMenu, rotuloDoPapel } from "@/features/auth/menu";
import { ehDono, ficaNaTelaDeVendas } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { buscarNomeLoja } from "@/features/configuracoes/queries";

export default async function SistemaLayout({ children }: LayoutProps<"/">) {
  const funcionario = await exigirFuncionario();
  const [nomeLoja, caixa] = await Promise.all([buscarNomeLoja(), ehDono(funcionario) ? null : buscarCaixaAberto(funcionario.id)]);
  // Funcionário com caixa aberto só sai da tela de vendas fechando o caixa, nem digitando o endereço.
  if (ficaNaTelaDeVendas(funcionario, caixa !== null)) redirect("/vender");

  return (
    <AppShell
      nomeLoja={nomeLoja}
      nome={funcionario.nome}
      papel={rotuloDoPapel(funcionario)}
      itens={itensDoMenu(funcionario)}
      acaoSair={<BotaoSair />}
    >
      {children}
    </AppShell>
  );
}
