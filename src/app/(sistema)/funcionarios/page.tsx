import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { exigirDono } from "@/features/auth/sessao";
import { EditarFuncionarioForm } from "@/features/funcionarios/components/EditarFuncionarioForm";
import { NovoFuncionarioForm } from "@/features/funcionarios/components/NovoFuncionarioForm";
import { listarFuncionarios } from "@/features/funcionarios/queries";

export const metadata: Metadata = { title: "Funcionários · Sorveteria PDV" };

const rotulosPermissao = [
  ["podeLancarEstoque", "Estoque"],
  ["podeGerenciarProdutos", "Produtos"],
  ["podeCancelarVenda", "Cancelar venda"],
  ["podeVerHistorico", "Histórico"],
] as const;

export default async function FuncionariosPage() {
  const dono = await exigirDono();
  const lista = await listarFuncionarios();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Funcionários" descricao="Crie logins, ligue permissões e desative quem saiu." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="titulo-equipe" className="flex flex-col gap-3">
          <h2 id="titulo-equipe" className="text-xl font-semibold">
            Equipe ({lista.length})
          </h2>
          {lista.map((funcionario) => (
            <Card key={funcionario.id} className="p-4">
              <details>
                <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-2">
                  <span className="font-semibold">{funcionario.nome}</span>
                  <span className="text-sm text-texto-suave">@{funcionario.usuario}</span>
                  <Badge tom={funcionario.papel === "dono" ? "primaria" : "neutro"}>{funcionario.papel === "dono" ? "Dono" : "Funcionário"}</Badge>
                  {funcionario.ativo ? null : <Badge tom="perigo">Desativado</Badge>}
                  {funcionario.papel === "funcionario"
                    ? rotulosPermissao.filter(([campo]) => funcionario[campo]).map(([campo, rotulo]) => <Badge key={campo} tom="sucesso">{rotulo}</Badge>)
                    : null}
                  <span className="ml-auto text-sm font-semibold text-primaria-escura">Editar</span>
                </summary>
                <div className="pt-4">
                  <EditarFuncionarioForm funcionario={funcionario} ehVoce={funcionario.id === dono.id} />
                </div>
              </details>
            </Card>
          ))}
        </section>
        <section aria-labelledby="titulo-novo">
          <Card className="flex flex-col gap-4">
            <h2 id="titulo-novo" className="text-xl font-semibold">
              Novo funcionário
            </h2>
            <NovoFuncionarioForm />
          </Card>
        </section>
      </div>
    </div>
  );
}
