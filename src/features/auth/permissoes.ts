import type { Funcionario } from "@/db/schema";

export type Permissao = "pode_lancar_estoque" | "pode_gerenciar_produtos" | "pode_cancelar_venda" | "pode_ver_historico";

export type PerfilAcesso = Pick<
  Funcionario,
  "papel" | "ativo" | "podeLancarEstoque" | "podeGerenciarProdutos" | "podeCancelarVenda" | "podeVerHistorico"
>;

const campoDaPermissao = {
  pode_lancar_estoque: "podeLancarEstoque",
  pode_gerenciar_produtos: "podeGerenciarProdutos",
  pode_cancelar_venda: "podeCancelarVenda",
  pode_ver_historico: "podeVerHistorico",
} as const satisfies Record<Permissao, keyof PerfilAcesso>;

export function ehDono(perfil: PerfilAcesso) {
  return perfil.ativo && perfil.papel === "dono";
}

// Dono tem todas as permissões; funcionário inativo não tem nenhuma.
export function temPermissao(perfil: PerfilAcesso, permissao: Permissao) {
  if (!perfil.ativo) return false;
  return perfil.papel === "dono" || perfil[campoDaPermissao[permissao]];
}

export function paginaInicial(perfil: PerfilAcesso) {
  return ehDono(perfil) ? "/dashboard" : "/caixa";
}

// Modo caixa: com o caixa aberto, o funcionário só sai da tela de vendas fechando o caixa; o dono sai quando quiser.
export function ficaNaTelaDeVendas(perfil: PerfilAcesso, temCaixaAberto: boolean) {
  return temCaixaAberto && !ehDono(perfil);
}
