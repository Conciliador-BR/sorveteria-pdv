import { totalPorPeso, troco } from "@/lib/dinheiro";

export type ItemCalculo =
  | { tipoVenda: "unidade"; precoCentavos: number; quantidade: number }
  | { tipoVenda: "peso"; precoCentavos: number; pesoGramas: number };

export function totalDoItem(item: ItemCalculo) {
  return item.tipoVenda === "peso" ? totalPorPeso(item.precoCentavos, item.pesoGramas) : item.precoCentavos * item.quantidade;
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

export type LinhaCarrinho = {
  chave: string;
  produto: ProdutoVenda;
  quantidade: number;
  /** Só produto por peso; null enquanto o peso não foi digitado. */
  pesoGramas: number | null;
};

// Por unidade soma na linha existente; por peso abre uma linha nova (cada copo é pesado à parte).
export function adicionarAoCarrinho(linhas: LinhaCarrinho[], produto: ProdutoVenda, chave: string): LinhaCarrinho[] {
  if (produto.tipoVenda === "unidade") {
    const existente = linhas.find((linha) => linha.produto.id === produto.id);
    if (existente) return alterarQuantidade(linhas, existente.chave, existente.quantidade + 1);
  }
  return [...linhas, { chave, produto, quantidade: 1, pesoGramas: null }];
}

export function alterarQuantidade(linhas: LinhaCarrinho[], chave: string, quantidade: number) {
  if (quantidade < 1) return linhas.filter((linha) => linha.chave !== chave);
  return linhas.map((linha) => (linha.chave === chave ? { ...linha, quantidade: Math.min(quantidade, 999) } : linha));
}

export function definirPeso(linhas: LinhaCarrinho[], chave: string, pesoGramas: number | null) {
  const peso = pesoGramas && pesoGramas > 0 ? Math.min(Math.floor(pesoGramas), 100_000) : null;
  return linhas.map((linha) => (linha.chave === chave ? { ...linha, pesoGramas: peso } : linha));
}

export function totalDaLinha(linha: LinhaCarrinho) {
  if (linha.produto.tipoVenda === "peso") {
    return linha.pesoGramas ? totalDoItem({ tipoVenda: "peso", precoCentavos: linha.produto.precoCentavos, pesoGramas: linha.pesoGramas }) : 0;
  }
  return totalDoItem({ tipoVenda: "unidade", precoCentavos: linha.produto.precoCentavos, quantidade: linha.quantidade });
}

export function totalDoCarrinho(linhas: LinhaCarrinho[]) {
  return linhas.reduce((soma, linha) => soma + totalDaLinha(linha), 0);
}

/** Pronto para enviar: tem itens e todo produto por peso tem peso. */
export function carrinhoPronto(linhas: LinhaCarrinho[]) {
  return linhas.length > 0 && linhas.every((linha) => linha.produto.tipoVenda === "unidade" || linha.pesoGramas !== null);
}

// Formato esperado por `itensSchema` (schemas.ts).
export function itensParaEnvio(linhas: LinhaCarrinho[]) {
  return linhas.map((linha) =>
    linha.produto.tipoVenda === "peso" && linha.pesoGramas !== null
      ? { produtoId: linha.produto.id, pesoGramas: linha.pesoGramas }
      : { produtoId: linha.produto.id, quantidade: linha.quantidade },
  );
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
