import { BotaoSair } from "@/features/auth/components/BotaoSair";
import { exigirFuncionario } from "@/features/auth/sessao";

export default async function SistemaLayout({ children }: LayoutProps<"/">) {
  const funcionario = await exigirFuncionario();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-foreground/10 px-6 py-3">
        <p className="font-medium">{funcionario.nome}</p>
        <BotaoSair />
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
