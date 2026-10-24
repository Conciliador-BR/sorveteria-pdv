import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirDono } from "@/features/auth/sessao";
import { lerAba } from "@/features/precificacao/abas";
import { AbasPrecificacao } from "@/features/precificacao/components/AbasPrecificacao";
import { CustoFixoForm } from "@/features/precificacao/components/CustoFixoForm";
import { ExplicacaoMargem } from "@/features/precificacao/components/ExplicacaoMargem";
import { InsumoForm } from "@/features/precificacao/components/InsumoForm";
import { ListaCustos } from "@/features/precificacao/components/ListaCustos";
import { ListaInsumos } from "@/features/precificacao/components/ListaInsumos";
import { ListaPrecos } from "@/features/precificacao/components/ListaPrecos";
import { MaquinaForm } from "@/features/precificacao/components/MaquinaForm";
import { ParametrosForm } from "@/features/precificacao/components/ParametrosForm";
import { ResumoDespesas } from "@/features/precificacao/components/ResumoDespesas";
import {
  buscarParametros,
  custosMensais,
  listarInsumos,
  listarItensFicha,
  listarProdutosParaPrecificar,
  resumoUltimos30Dias,
} from "@/features/precificacao/queries";
import { despesasSobreVenda } from "@/features/precificacao/regras";

export const metadata: Metadata = { title: "Precificação · Sorveteria PDV" };

export default async function PrecificacaoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await exigirDono();
  const aba = lerAba((await searchParams).aba);
  const [parametros, custos] = await Promise.all([buscarParametros(), custosMensais()]);
  const despesas = despesasSobreVenda(parametros, custos.total);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Precificação" descricao="Seus custos para fabricar, a margem que você quer e o preço certo de cada produto. Só você vê esta tela." />
      <AbasPrecificacao atual={aba} />
      {aba === "precos" ? <AbaPrecos parametros={parametros} custosMensaisCentavos={custos.total} /> : null}
      {aba === "insumos" ? <AbaInsumos /> : null}
      {aba === "custos" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ListaCustos fixos={custos.fixos} maquinas={custos.maquinas} totalFixos={custos.totalFixos} totalDepreciacao={custos.totalDepreciacao} />
          <div className="flex flex-col gap-6">
            <FormularioNovo titulo="Novo custo fixo">
              <CustoFixoForm />
            </FormularioNovo>
            <FormularioNovo titulo="Nova máquina">
              <MaquinaForm />
            </FormularioNovo>
          </div>
        </div>
      ) : null}
      {aba === "taxas" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <FormularioNovo titulo="Impostos, taxas e margem">
            <ParametrosForm parametros={parametros} ultimos30Dias={await resumoUltimos30Dias()} />
          </FormularioNovo>
          <div className="flex flex-col gap-6">
            <ResumoDespesas despesas={despesas} custosMensaisCentavos={custos.total} temFaturamento={parametros.faturamentoMensalCentavos !== null} />
            <ExplicacaoMargem />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FormularioNovo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo}>
      <Card className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{titulo}</h2>
        {children}
      </Card>
    </section>
  );
}

async function AbaInsumos() {
  const insumos = await listarInsumos();
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section aria-labelledby="titulo-insumos" className="flex flex-col gap-3">
        <h2 id="titulo-insumos" className="text-2xl font-semibold">
          Insumos ({insumos.length})
        </h2>
        <ListaInsumos insumos={insumos} />
      </section>
      <FormularioNovo titulo="Novo insumo">
        <InsumoForm />
      </FormularioNovo>
    </div>
  );
}

async function AbaPrecos({ parametros, custosMensaisCentavos }: { parametros: Awaited<ReturnType<typeof buscarParametros>>; custosMensaisCentavos: number }) {
  const [produtos, itens, insumos] = await Promise.all([listarProdutosParaPrecificar(), listarItensFicha(), listarInsumos()]);
  return (
    <section aria-labelledby="titulo-precos" className="flex flex-col gap-3">
      <h2 id="titulo-precos" className="text-2xl font-semibold">
        Produtos
      </h2>
      <p className="text-texto-suave">Abra um produto, monte a receita com os insumos e digite a margem que você quer ganhar.</p>
      <ListaPrecos produtos={produtos} itens={itens} insumos={insumos} parametros={parametros} custosMensaisCentavos={custosMensaisCentavos} />
    </section>
  );
}
