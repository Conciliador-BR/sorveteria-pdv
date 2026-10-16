import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold">Sorveteria PDV</h1>
      <p>A página de apresentação completa chega numa próxima entrega.</p>
      <Link href="/entrar" className="flex h-12 items-center rounded-xl bg-foreground px-6 font-semibold text-background">
        Acessar o sistema
      </Link>
    </main>
  );
}
