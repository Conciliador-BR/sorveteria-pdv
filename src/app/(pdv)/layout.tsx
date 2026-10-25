import { redirect } from "next/navigation";
import { AbasPdv } from "@/components/layout/AbasPdv";
import { PdvShell } from "@/components/layout/PdvShell";
import { rotuloDoPapel } from "@/features/auth/menu";
import { ehDono } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { DataHora } from "@/features/caixa/components/DataHora";
import { SairDoPdv } from "@/features/caixa/components/SairDoPdv";
import { buscarCaixaAberto } from "@/features/caixa/queries";
import { buscarNomeLoja } from "@/features/configuracoes/queries";

// Modo caixa: só existe com o caixa do próprio funcionário aberto. Cada página repete a checagem do caixa.
export default async function PdvLayout({ children }: LayoutProps<"/">) {
  const funcionario = await exigirFuncionario();
  const [nomeLoja, caixa] = await Promise.all([buscarNomeLoja(), buscarCaixaAberto(funcionario.id)]);
  if (!caixa) redirect("/caixa");

  return (
    <PdvShell
      nomeLoja={nomeLoja}
      operador={`${funcionario.nome} (${rotuloDoPapel(funcionario)})`}
      situacao={
        <>
          Caixa aberto desde <DataHora valor={caixa.abertoEm} />
        </>
      }
      abas={<AbasPdv />}
      sair={<SairDoPdv podeSairSemFechar={ehDono(funcionario)} />}
    >
      {children}
    </PdvShell>
  );
}
