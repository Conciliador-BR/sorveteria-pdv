import { exigirFuncionario } from "@/features/auth/sessao";

export default async function CaixaPage() {
  await exigirFuncionario();
  return (
    <>
      <h1 className="text-2xl font-semibold">Caixa</h1>
      <p>A abertura de caixa chega numa próxima entrega.</p>
    </>
  );
}
