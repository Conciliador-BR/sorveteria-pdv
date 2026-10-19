import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { estiloBotao } from "@/components/ui/Button";
import { temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { FiltrosVendas } from "@/features/historico/components/FiltrosVendas";
import { ListaVendas } from "@/features/historico/components/ListaVendas";
import { consultaDosFiltros, filtrosEfetivos, lerFiltros } from "@/features/historico/filtros";
import { listarBandeirasDoFiltro, listarFuncionariosDoFiltro, listarVendas } from "@/features/historico/queries";

export const metadata: Metadata = { title: "Histórico de vendas · Sorveteria PDV" };

const LIMITE_LISTA = 200;

export default async function VendasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const funcionario = await exigirFuncionario();
  // Sem a permissão, o servidor força as próprias vendas, não importa a URL.
  const veTodas = temPermissao(funcionario, "pode_ver_historico");
  const filtros = filtrosEfetivos(lerFiltros(await searchParams), { veTodas, funcionarioId: funcionario.id });

  const [vendas, funcionarios, bandeiras] = await Promise.all([
    listarVendas(filtros, LIMITE_LISTA),
    veTodas ? listarFuncionariosDoFiltro() : undefined,
    listarBandeirasDoFiltro(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Histórico de vendas"
        descricao={veTodas ? "Vendas da loja por período, funcionário e pagamento." : "As suas vendas por período e pagamento."}
        acoes={
          // <a> comum: é um download do Route Handler, não uma navegação entre páginas.
          <a href={`/vendas/csv?${consultaDosFiltros(filtros)}`} download className={estiloBotao({ variante: "secundario" })}>
            <Download aria-hidden="true" className="size-5" />
            Baixar planilha (CSV)
          </a>
        }
      />
      <FiltrosVendas filtros={filtros} funcionarios={funcionarios} bandeiras={bandeiras} />
      <ListaVendas vendas={vendas} limite={LIMITE_LISTA} filtroDePagamento={Boolean(filtros.forma || filtros.bandeira)} />
    </div>
  );
}
