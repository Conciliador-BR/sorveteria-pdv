import type { NextRequest } from "next/server";
import { temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { LIMITE_CSV, montarCsv } from "@/features/historico/csv";
import { filtrosEfetivos, hojeNaLoja, lerFiltros } from "@/features/historico/filtros";
import { listarVendas } from "@/features/historico/queries";

// Exporta as vendas com os mesmos filtros e a mesma regra de visibilidade da tela /vendas.
export async function GET(request: NextRequest) {
  const funcionario = await exigirFuncionario();
  const veTodas = temPermissao(funcionario, "pode_ver_historico");
  const filtros = filtrosEfetivos(lerFiltros(Object.fromEntries(request.nextUrl.searchParams)), { veTodas, funcionarioId: funcionario.id });
  const vendas = await listarVendas(filtros, LIMITE_CSV);

  const nome = `vendas-${filtros.de ?? "inicio"}-a-${filtros.ate ?? hojeNaLoja()}.csv`;
  return new Response(montarCsv(vendas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
