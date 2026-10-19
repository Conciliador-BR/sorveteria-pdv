import Link from "next/link";
import { Button, estiloBotao } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { Card } from "@/components/ui/Card";
import { Selecao } from "@/components/ui/Selecao";
import { consultaDosFiltros, type FiltrosHistorico } from "../filtros";
import { rotulosForma, rotulosStatus } from "../rotulos";

type Opcao = { id: string; nome: string };

type FiltrosVendasProps = {
  filtros: FiltrosHistorico;
  /** Lista só para quem vê as vendas de todos; sem ela, o campo não aparece. */
  funcionarios?: Opcao[];
  bandeiras: (Opcao & { tipo: "debito" | "credito" })[];
};

// Formulário GET: os filtros ficam na URL, dá para voltar e compartilhar o link.
// A key recria o formulário quando a URL muda por link, para os campos mostrarem os filtros atuais.
export function FiltrosVendas({ filtros, funcionarios, bandeiras }: FiltrosVendasProps) {
  return (
    <Card className="p-4">
      <form key={consultaDosFiltros(filtros)} method="get" action="/vendas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Filtrar vendas">
        <Campo type="date" name="de" rotulo="De" defaultValue={filtros.de} />
        <Campo type="date" name="ate" rotulo="Até" defaultValue={filtros.ate} />
        {funcionarios ? (
          <Selecao name="funcionario" rotulo="Funcionário" defaultValue={filtros.funcionario ?? ""}>
            <option value="">Todos</option>
            {funcionarios.map((funcionario) => (
              <option key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
              </option>
            ))}
          </Selecao>
        ) : null}
        <Selecao name="forma" rotulo="Forma de pagamento" defaultValue={filtros.forma ?? ""}>
          <option value="">Todas</option>
          {Object.entries(rotulosForma).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </Selecao>
        <Selecao name="bandeira" rotulo="Bandeira" defaultValue={filtros.bandeira ?? ""}>
          <option value="">Todas</option>
          {bandeiras.map((bandeira) => (
            <option key={bandeira.id} value={bandeira.id}>
              {bandeira.nome} ({rotulosForma[bandeira.tipo]})
            </option>
          ))}
        </Selecao>
        <Selecao name="status" rotulo="Situação" defaultValue={filtros.status ?? ""}>
          <option value="">Todas</option>
          {Object.entries(rotulosStatus).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </Selecao>
        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-3">
          <Button type="submit">Filtrar</Button>
          <Link href="/vendas" className={estiloBotao({ variante: "fantasma" })}>
            Voltar para hoje
          </Link>
        </div>
      </form>
    </Card>
  );
}
