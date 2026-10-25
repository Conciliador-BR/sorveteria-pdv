import { ehDono, temPermissao, type Permissao, type PerfilAcesso } from "./permissoes";

export type IconeMenu =
  | "caixa"
  | "vender"
  | "estoque"
  | "produtos"
  | "historico"
  | "dashboard"
  | "funcionarios"
  | "configuracoes";

export type ItemMenu = { href: string; rotulo: string; icone: IconeMenu };

type Regra = "todos" | "dono" | Permissao;

const itens: readonly (ItemMenu & { regra: Regra })[] = [
  { href: "/caixa", rotulo: "Caixa", icone: "caixa", regra: "todos" },
  { href: "/vender", rotulo: "Vender e comandas", icone: "vender", regra: "todos" },
  { href: "/estoque", rotulo: "Estoque", icone: "estoque", regra: "pode_lancar_estoque" },
  { href: "/produtos", rotulo: "Produtos", icone: "produtos", regra: "pode_gerenciar_produtos" },
  // Todos veem as próprias vendas; quem tem `pode_ver_historico` vê as de todos.
  { href: "/vendas", rotulo: "Histórico", icone: "historico", regra: "todos" },
  { href: "/dashboard", rotulo: "Dashboard", icone: "dashboard", regra: "dono" },
  { href: "/funcionarios", rotulo: "Funcionários", icone: "funcionarios", regra: "dono" },
  { href: "/configuracoes", rotulo: "Configurações", icone: "configuracoes", regra: "dono" },
];

// Esconder item é só conforto: cada página e Server Action confere a permissão de novo.
export function itensDoMenu(perfil: PerfilAcesso): ItemMenu[] {
  if (!perfil.ativo) return [];
  return itens
    .filter(({ regra }) => {
      if (regra === "todos") return true;
      if (regra === "dono") return ehDono(perfil);
      return temPermissao(perfil, regra);
    })
    .map(({ href, rotulo, icone }) => ({ href, rotulo, icone }));
}

export function rotuloDoPapel(perfil: Pick<PerfilAcesso, "papel">) {
  return perfil.papel === "dono" ? "Dono" : "Funcionário";
}
