import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { paginaInicial } from "@/features/auth/permissoes";
import { getFuncionarioAtual } from "@/features/auth/sessao";

export const metadata: Metadata = { title: "Entrar · Sorveteria PDV" };

export default async function EntrarPage() {
  const funcionario = await getFuncionarioAtual();
  if (funcionario) redirect(paginaInicial(funcionario));

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Entrar no sistema</h1>
      <LoginForm />
    </main>
  );
}
