import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { BandeiraLista } from "../queries";
import { rotuloTipoBandeira } from "../regras";
import { EditarBandeiraForm } from "./EditarBandeiraForm";

const tipos = ["debito", "credito"] as const;

// Bandeiras agrupadas por tipo; cada uma abre o formulário de edição no próprio cartão.
export function ListaBandeiras({ bandeiras }: { bandeiras: BandeiraLista[] }) {
  return (
    <div className="flex flex-col gap-6">
      {tipos.map((tipo) => {
        const lista = bandeiras.filter((bandeira) => bandeira.tipo === tipo);
        const idTitulo = `titulo-bandeiras-${tipo}`;
        return (
          <section key={tipo} aria-labelledby={idTitulo} className="flex flex-col gap-3">
            <h3 id={idTitulo} className="text-xl font-semibold">
              {rotuloTipoBandeira(tipo)} ({lista.length})
            </h3>
            {lista.length === 0 ? <p className="text-sm text-texto-suave">Nenhuma bandeira de {rotuloTipoBandeira(tipo).toLowerCase()} ainda.</p> : null}
            {lista.map((bandeira) => (
              <Card key={bandeira.id} className="p-4">
                <details>
                  <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">{bandeira.nome}</span>
                    {bandeira.ativo ? <Badge tom="sucesso">Ativa</Badge> : <Badge tom="perigo">Desativada</Badge>}
                    <span className="ml-auto text-sm font-semibold text-primaria-escura">Editar</span>
                  </summary>
                  <div className="pt-4">
                    <EditarBandeiraForm bandeira={bandeira} />
                  </div>
                </details>
              </Card>
            ))}
          </section>
        );
      })}
    </div>
  );
}
