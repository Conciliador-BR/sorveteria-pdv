import { PageHeader } from "@/components/layout/PageHeader";
import { Aviso } from "@/components/ui/Aviso";
import { exigirDono } from "@/features/auth/sessao";

export default async function DashboardPage() {
  await exigirDono();
  return (
    <>
      <PageHeader titulo="Dashboard" descricao="Faturamento, ticket médio e fechamentos da loja." />
      <Aviso tipo="info">Os números da loja chegam numa próxima entrega.</Aviso>
    </>
  );
}
