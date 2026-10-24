import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { exigirDono } from "@/features/auth/sessao";
import { DadosFiscaisForm } from "@/features/configuracoes/components/DadosFiscaisForm";
import { ListaBandeiras } from "@/features/configuracoes/components/ListaBandeiras";
import { NomeLojaForm } from "@/features/configuracoes/components/NomeLojaForm";
import { NovaBandeiraForm } from "@/features/configuracoes/components/NovaBandeiraForm";
import { buscarDadosFiscais, buscarNomeLojaSalvo, listarBandeiras } from "@/features/configuracoes/queries";

export const metadata: Metadata = { title: "Configurações · Sorveteria PDV" };

export default async function ConfiguracoesPage() {
  await exigirDono();
  const [nomeSalvo, bandeiras, fiscal] = await Promise.all([buscarNomeLojaSalvo(), listarBandeiras(), buscarDadosFiscais()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Configurações" descricao="Nome da loja, nota fiscal e bandeiras de cartão aceitas no pagamento." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="titulo-bandeiras" className="flex flex-col gap-3">
          <h2 id="titulo-bandeiras" className="text-2xl font-semibold">
            Bandeiras de cartão
          </h2>
          <ListaBandeiras bandeiras={bandeiras} />
        </section>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="titulo-nome-loja">
            <Card className="flex flex-col gap-4">
              <h2 id="titulo-nome-loja" className="text-xl font-semibold">
                Nome da loja
              </h2>
              <NomeLojaForm nomeSalvo={nomeSalvo} />
            </Card>
          </section>
          <section aria-labelledby="titulo-nota-fiscal">
            <Card className="flex flex-col gap-4">
              <h2 id="titulo-nota-fiscal" className="text-xl font-semibold">
                Nota fiscal (NFC-e)
              </h2>
              <DadosFiscaisForm dados={fiscal} />
            </Card>
          </section>
          <section aria-labelledby="titulo-nova-bandeira">
            <Card className="flex flex-col gap-4">
              <h2 id="titulo-nova-bandeira" className="text-xl font-semibold">
                Nova bandeira
              </h2>
              <NovaBandeiraForm />
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
