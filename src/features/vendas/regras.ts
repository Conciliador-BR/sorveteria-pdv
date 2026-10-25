import { gramasPorValor, totalPorPeso, troco } from "@/lib/dinheiro";

export type ItemCalculo =
  | { tipoVenda: "unidade"; precoCentavos: number; quantidade: number }
  | { tipoVenda: "peso"; precoCentavos: number; pesoGramas: number };

export function totalDoItem(item: ItemCalculo) {
  return item.tipoVenda === "peso" ? totalPorPeso(item.precoCentavos, item.pesoGramas) : item.precoCentavos * item.quantidade;
}

// Item como chega da tela (ver `itensSchema`): quantidade, gramas ou o valor que a balança mostrou.
export type ItemInformado = { quantidade: number } | { pesoGramas: number } | { valorCentavos: number };

/** Erro de regra do item, com mensagem pronta para o funcionário. */
export class ErroItem extends Error {}

const PESO_MAXIMO_GRAMAS = 100_000;

// Quantidade, gramas e total de um item a partir do cadastro. No modo valor o total é o que a balança
// mostrou e as gramas são estimadas pelo preço do kg (para o estoque).
export function calcularItem(produto: { nome: string; tipoVenda: "unidade" | "peso"; precoCentavos: number }, item: ItemInformado) {
  const porPeso = produto.tipoVenda === "peso";
  if (porPeso === "quantidade" in item) throw new ErroItem(`Informe ${porPeso ? "o peso" : "a quantidade"} de ${produto.nome}.`);
  if ("quantidade" in item) {
    return { quantidade: item.quantidade, pesoGramas: null, pesoPeloValor: false, totalCentavos: totalDoItem({ tipoVenda: "unidade", precoCentavos: produto.precoCentavos, quantidade: item.quantidade }) };
  }
  if ("pesoGramas" in item) {
    return { quantidade: 1, pesoGramas: item.pesoGramas, pesoPeloValor: false, totalCentavos: totalDoItem({ tipoVenda: "peso", precoCentavos: produto.precoCentavos, pesoGramas: item.pesoGramas }) };
  }
  if (produto.precoCentavos <= 0) throw new ErroItem(`${produto.nome} está sem preço do kg. Digite o peso.`);
  const pesoGramas = gramasPorValor(produto.precoCentavos, item.valorCentavos);
  if (pesoGramas > PESO_MAXIMO_GRAMAS) throw new ErroItem(`O valor de ${produto.nome} passa de 100 kg. Confira o que foi digitado.`);
  return { quantidade: 1, pesoGramas, pesoPeloValor: true, totalCentavos: item.valorCentavos };
}

export function totalDaVenda(itens: { totalCentavos: number }[]) {
  return itens.reduce((soma, item) => soma + item.totalCentavos, 0);
}

export type PagamentoInformado =
  | { forma: "dinheiro"; valorCentavos: number; recebidoCentavos: number }
  | { forma: "pix"; valorCentavos: number }
  | { forma: "debito" | "credito"; valorCentavos: number; bandeiraId: string };

export type ConferenciaPagamento =
  | { ok: true; trocoCentavos: number }
  | { ok: false; erro: string };

// A soma dos pagamentos fecha o total; dinheiro recebido cobre a parte em dinheiro; troco nunca negativo.
export function conferirPagamentos(totalCentavos: number, pagamentos: PagamentoInformado[]): ConferenciaPagamento {
  if (totalCentavos <= 0) return { ok: false, erro: "A venda não tem itens." };
  if (pagamentos.length === 0) return { ok: false, erro: "Escolha a forma de pagamento." };
  if (pagamentos.some((pagamento) => pagamento.valorCentavos <= 0)) return { ok: false, erro: "Cada pagamento precisa ter valor." };
  if (pagamentos.filter((pagamento) => pagamento.forma === "dinheiro").length > 1) {
    return { ok: false, erro: "Use uma só parte em dinheiro." };
  }
  const soma = pagamentos.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
  if (soma !== totalCentavos) return { ok: false, erro: "A soma dos pagamentos precisa ser igual ao total." };

  const dinheiro = pagamentos.find((pagamento) => pagamento.forma === "dinheiro");
  if (!dinheiro) return { ok: true, trocoCentavos: 0 };
  if (dinheiro.recebidoCentavos < dinheiro.valorCentavos) {
    return { ok: false, erro: "O valor recebido em dinheiro é menor que a parte em dinheiro." };
  }
  return { ok: true, trocoCentavos: troco(dinheiro.recebidoCentavos, dinheiro.valorCentavos) };
}

// Carrinho da tela (navegador). O servidor recalcula tudo pelo cadastro ao gravar.
export type ProdutoVenda = { id: string; nome: string; tipoVenda: "unidade" | "peso"; precoCentavos: number };

/** Como o produto por peso é informado: gramas da balança ou o valor em reais que ela mostrou. */
export type ModoPeso = "gramas" | "valor";

export type LinhaCarrinho = {
  chave: string;
  produto: ProdutoVenda;
  quantidade: number;
  /** Só produto por peso; null enquanto o peso não foi digitado. */
  pesoGramas: number | null;
  modoPeso: ModoPeso;
  /** Só no modo "valor"; null enquanto o valor não foi digitado. */
  valorCentavos: number | null;
};

// Por unidade soma na linha existente; por peso abre uma linha nova (cada copo é pesado à parte).
export function adicionarAoCarrinho(linhas: LinhaCarrinho[], produto: ProdutoVenda, chave: string, modoPeso: ModoPeso = "gramas"): LinhaCarrinho[] {
  if (produto.tipoVenda === "unidade") {
    const existente = linhas.find((linha) => linha.produto.id === produto.id);
    if (existente) return alterarQuantidade(linhas, existente.chave, existente.quantidade + 1);
  }
  // Sem preço do kg não há como estimar as gramas: a linha começa sempre pelo peso.
  const modo = produto.precoCentavos > 0 ? modoPeso : "gramas";
  return [...linhas, { chave, produto, quantidade: 1, pesoGramas: null, modoPeso: modo, valorCentavos: null }];
}

export function alterarQuantidade(linhas: LinhaCarrinho[], chave: string, quantidade: number) {
  if (quantidade < 1) return linhas.filter((linha) => linha.chave !== chave);
  return linhas.map((linha) => (linha.chave === chave ? { ...linha, quantidade: Math.min(quantidade, 999) } : linha));
}

export function definirPeso(linhas: LinhaCarrinho[], chave: string, pesoGramas: number | null) {
  const peso = pesoGramas && pesoGramas > 0 ? Math.min(Math.floor(pesoGramas), 100_000) : null;
  return linhas.map((linha) => (linha.chave === chave ? { ...linha, pesoGramas: peso } : linha));
}

export function definirModoPeso(linhas: LinhaCarrinho[], chave: string, modoPeso: ModoPeso) {
  return linhas.map((linha) => (linha.chave === chave ? { ...linha, modoPeso } : linha));
}

export function definirValorPeso(linhas: LinhaCarrinho[], chave: string, valorCentavos: number | null) {
  const valor = valorCentavos && valorCentavos > 0 ? Math.min(Math.floor(valorCentavos), 10_000_000) : null;
  return linhas.map((linha) => (linha.chave === chave ? { ...linha, valorCentavos: valor } : linha));
}

export function totalDaLinha(linha: LinhaCarrinho) {
  if (linha.produto.tipoVenda === "peso" && linha.modoPeso === "valor") return linha.valorCentavos ?? 0;
  if (linha.produto.tipoVenda === "peso") {
    return linha.pesoGramas ? totalDoItem({ tipoVenda: "peso", precoCentavos: linha.produto.precoCentavos, pesoGramas: linha.pesoGramas }) : 0;
  }
  return totalDoItem({ tipoVenda: "unidade", precoCentavos: linha.produto.precoCentavos, quantidade: linha.quantidade });
}

export function totalDoCarrinho(linhas: LinhaCarrinho[]) {
  return linhas.reduce((soma, linha) => soma + totalDaLinha(linha), 0);
}

function pesoInformado(linha: LinhaCarrinho) {
  return linha.modoPeso === "valor" ? linha.valorCentavos !== null : linha.pesoGramas !== null;
}

/** Pronto para enviar: tem itens e todo produto por peso tem peso ou valor, conforme o modo. */
export function carrinhoPronto(linhas: LinhaCarrinho[]) {
  return linhas.length > 0 && linhas.every((linha) => linha.produto.tipoVenda === "unidade" || pesoInformado(linha));
}

// Formato esperado por `itensSchema` (schemas.ts).
export function itensParaEnvio(linhas: LinhaCarrinho[]) {
  return linhas.map((linha) => {
    if (linha.produto.tipoVenda === "peso" && linha.modoPeso === "valor" && linha.valorCentavos !== null) {
      return { produtoId: linha.produto.id, valorCentavos: linha.valorCentavos };
    }
    if (linha.produto.tipoVenda === "peso" && linha.modoPeso === "gramas" && linha.pesoGramas !== null) {
      return { produtoId: linha.produto.id, pesoGramas: linha.pesoGramas };
    }
    return { produtoId: linha.produto.id, quantidade: linha.quantidade };
  });
}

// "há 5 min", "há 1 h 20 min".
export function tempoAberta(minutos: number) {
  const total = Math.max(0, Math.floor(minutos));
  if (total < 1) return "agora há pouco";
  if (total < 60) return `há ${total} min`;
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return resto ? `há ${horas} h ${resto} min` : `há ${horas} h`;
}

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

// "17/10/2026 14:32", sempre no fuso da loja.
export function formatarDataHora(data: Date) {
  return formatoDataHora.format(data).replace(",", "");
}

// UUID v4 com getRandomValues: `crypto.randomUUID` só existe em HTTPS ou localhost,
// e o tablet pode abrir o sistema pela rede local.
export function novoIdVenda() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
