import { AppShell } from "@/components/layout/AppShell";
import { BotaoSair } from "@/features/auth/components/BotaoSair";
import { itensDoMenu, rotuloDoPapel } from "@/features/auth/menu";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarNomeLoja } from "@/features/configuracoes/queries";

export default async function SistemaLayout({ children }: LayoutProps<"/">) {
  const funcionario = await exigirFuncionario();
  const nomeLoja = await buscarNomeLoja();

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
