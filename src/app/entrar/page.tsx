import { ArrowLeft, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Marca } from "@/components/layout/Marca";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { paginaInicial } from "@/features/auth/permissoes";
import { getFuncionarioAtual } from "@/features/auth/sessao";

export const metadata: Metadata = { title: "Entrar · Sorveteria PDV" };

const lembretes = ["Abra o caixa com o fundo de troco", "Venda, cobre e veja o troco na hora", "Feche e confira antes de ir embora"];

export default async function EntrarPage() {
  const funcionario = await getFuncionarioAtual();
  if (funcionario) redirect(paginaInicial(funcionario));

  return (
    <main className="grid flex-1 lg:grid-cols-[1fr_1.1fr]">
      {/* Painel da marca: só a partir do desktop; no celular a tela vai direto ao formulário. */}
      <section
        aria-hidden="true"
        className="relative isolate hidden flex-col justify-between overflow-hidden bg-tinta p-10 text-superficie lg:flex xl:p-14"
      >
        <span className="absolute -top-32 -left-24 -z-10 size-[28rem] rounded-full bg-primaria/50 blur-3xl" />
        <span className="absolute -right-24 -bottom-32 -z-10 size-[24rem] rounded-full bg-secundaria/35 blur-3xl" />
        <span className="absolute top-1/2 right-10 -z-10 size-40 rounded-full bg-acento/25 blur-2xl" />
        <Marca fundo="escuro" />
        <div className="flex flex-col gap-6">
          <p className="font-titulo text-4xl font-extrabold tracking-tight text-balance">Bom turno! A fila não espera, e o sistema também não.</p>
          <ul className="flex flex-col gap-3 text-superficie/85">
            {lembretes.map((lembrete) => (
              <li key={lembrete} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-sucesso text-tinta">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {lembrete}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-superficie/60">Praia do Morro</p>
      </section>

      <div className="relative isolate flex flex-col items-center justify-center gap-6 overflow-hidden p-4 sm:p-8">
        <span aria-hidden="true" className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-acento/25 blur-3xl lg:hidden" />
        <span aria-hidden="true" className="absolute -bottom-24 -left-24 -z-10 size-72 rounded-full bg-primaria/20 blur-3xl lg:hidden" />
        <div className="flex w-full max-w-md flex-col gap-8 rounded-modal border border-borda/80 bg-superficie p-6 shadow-elevada sm:p-10">
          <Marca className="lg:hidden" />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold">Entrar no sistema</h1>
            <p className="text-texto-suave">Use o usuário e a senha que o dono cadastrou para você.</p>
          </div>
          <LoginForm />
        </div>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 rounded-botao px-4 font-medium text-primaria-escura hover:bg-primaria-suave"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
