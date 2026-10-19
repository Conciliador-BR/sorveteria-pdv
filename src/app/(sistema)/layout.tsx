import { AppShell } from "@/components/layout/AppShell";
import { BotaoSair } from "@/features/auth/components/BotaoSair";
import { itensDoMenu, rotuloDoPapel } from "@/features/auth/menu";
import { exigirFuncionario } from "@/features/auth/sessao";

export default async function SistemaLayout({ children }: LayoutProps<"/">) {
  const funcionario = await exigirFuncionario();

  return (
    <AppShell
      nome={funcionario.nome}
      papel={rotuloDoPapel(funcionario)}
      itens={itensDoMenu(funcionario)}
      acaoSair={<BotaoSair />}
    >
      {children}
    </AppShell>
  );
}
