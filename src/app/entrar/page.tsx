import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/layout/Marca";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { paginaInicial } from "@/features/auth/permissoes";
import { getFuncionarioAtual } from "@/features/auth/sessao";

export const metadata: Metadata = { title: "Entrar · Sorveteria PDV" };

export default async function EntrarPage() {
  const funcionario = await getFuncionarioAtual();
  if (funcionario) redirect(paginaInicial(funcionario));

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-6">
      <Card className="w-full max-w-md overflow-hidden p-0">
        <div aria-hidden="true" className="h-2 bg-linear-90 from-primaria via-sucesso to-acento" />
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <Marca />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Entrar no sistema</h1>
            <p className="text-texto-suave">Use o usuário e a senha que o dono cadastrou para você.</p>
          </div>
          <LoginForm />
        </div>
      </Card>
      <Link
        href="/"
        className="inline-flex min-h-12 items-center gap-2 rounded-botao px-4 font-medium text-primaria-escura hover:bg-primaria-suave"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        Voltar para o início
      </Link>
    </main>
  );
}
