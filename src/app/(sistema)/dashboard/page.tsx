import { exigirDono } from "@/features/auth/sessao";

export default async function DashboardPage() {
  await exigirDono();
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Os números da loja chegam numa próxima entrega.</p>
    </>
  );
}
