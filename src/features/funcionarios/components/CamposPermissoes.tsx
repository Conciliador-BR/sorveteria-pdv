import { CaixaSelecao } from "@/components/ui/CaixaSelecao";

type Permissoes = { podeLancarEstoque: boolean; podeGerenciarProdutos: boolean; podeCancelarVenda: boolean; podeVerHistorico: boolean };

const opcoes: { nome: keyof Permissoes; rotulo: string; dica: string }[] = [
  { nome: "podeLancarEstoque", rotulo: "Lançar estoque", dica: "Entradas, saídas e ajustes de contagem" },
  { nome: "podeGerenciarProdutos", rotulo: "Gerenciar produtos", dica: "Cadastrar produtos, preços e categorias" },
  { nome: "podeCancelarVenda", rotulo: "Cancelar venda", dica: "Cancelar vendas e comandas, com motivo" },
  { nome: "podeVerHistorico", rotulo: "Ver histórico", dica: "Vendas de todos os funcionários" },
];

export function CamposPermissoes({ valores }: { valores?: Permissoes }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-sm font-semibold">Permissões extras</legend>
      {opcoes.map((opcao) => (
        <CaixaSelecao key={opcao.nome} name={opcao.nome} rotulo={opcao.rotulo} dica={opcao.dica} defaultChecked={valores?.[opcao.nome]} />
      ))}
    </fieldset>
  );
}
