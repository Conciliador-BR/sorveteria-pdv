import { PageHeader } from "@/components/layout/PageHeader";
import { Aviso } from "@/components/ui/Aviso";
import { exigirFuncionario } from "@/features/auth/sessao";

export default async function CaixaPage() {
  await exigirFuncionario();
  return (
    <>
      <PageHeader titulo="Caixa" descricao="Abertura, sangria, suprimento e fechamento do seu caixa." />
      <Aviso tipo="info">A abertura de caixa chega numa próxima entrega.</Aviso>
    </>
  );
}
