import { z } from "zod";
import { lerReais } from "@/lib/dinheiro";
import { vazioViraNulo } from "@/lib/formulario";
import { lerPercentual } from "./regras";

const LIMITE_REAIS = 100_000_000; // R$ 1.000.000,00: cabe com folga no integer.

const reais = (mensagem: string) =>
  z.preprocess(
    (valor) => (typeof valor === "string" ? lerReais(valor) : valor),
    z.number({ error: mensagem }).int().min(0).max(LIMITE_REAIS, "Valor alto demais."),
  );

const percentual = (maximo: number) =>
  z.preprocess(
    (valor) => (typeof valor === "string" ? lerPercentual(valor) : valor),
    z.number({ error: "Informe um percentual, por exemplo 6 ou 2,5." }).int().min(0).max(maximo, `Use até ${maximo / 100}%.`),
  );

const inteiro = (mensagem: string, maximo: number) =>
  z.coerce.number({ error: mensagem }).int(mensagem).min(1, mensagem).max(maximo, "Número alto demais.");

const nome = z.string({ error: "Informe o nome." }).trim().min(2, "Informe o nome.").max(60, "Use até 60 caracteres.");

// `id` vazio = cadastro novo; preenchido = edição.
const idOpcional = z.preprocess(vazioViraNulo, z.uuid().nullable()).default(null);

export const idSchema = z.object({ id: z.uuid("Registro inválido. Recarregue a página.") });

export const insumoSchema = z.object({
  id: idOpcional,
  nome,
  unidade: z.enum(["g", "ml", "un"], { error: "Escolha a unidade." }),
  embalagemQuantidade: inteiro("Informe quanto vem na embalagem (número inteiro).", 10_000_000),
  embalagemPrecoCentavos: reais("Informe quanto você pagou, por exemplo 20,00."),
});

export const custoFixoSchema = z.object({
  id: idOpcional,
  nome,
  valorMensalCentavos: reais("Informe o valor do mês, por exemplo 1.500,00."),
});

export const maquinaSchema = z
  .object({
    id: idOpcional,
    nome,
    valorCompraCentavos: reais("Informe quanto a máquina custou."),
    valorResidualCentavos: z.preprocess((valor) => (valor === "" ? "0" : valor), reais("Informe por quanto venderia no fim, ou deixe vazio.")),
    vidaUtilAnos: inteiro("Informe a vida útil em anos (número inteiro).", 50),
  })
  .refine((m) => m.valorResidualCentavos <= m.valorCompraCentavos, {
    path: ["valorResidualCentavos"],
    message: "O valor no fim não pode passar do valor de compra.",
  });

export const parametrosSchema = z.object({
  faturamentoMensalCentavos: z.preprocess(
    vazioViraNulo,
    reais("Informe o faturamento médio do mês, por exemplo 50.000,00.").refine((v) => v > 0, "Informe um valor maior que zero.").nullable(),
  ),
  impostoPercentual: percentual(9900),
  taxaCartaoPercentual: percentual(9900),
  parteCartaoPercentual: percentual(10_000),
  perdasPercentual: percentual(9900),
  margemPadraoPercentual: percentual(9900),
});

export const itemFichaSchema = z.object({
  produtoId: z.uuid("Produto inválido. Recarregue a página."),
  insumoId: z.uuid("Escolha o insumo."),
  quantidade: inteiro("Informe a quantidade (número inteiro maior que zero).", 1_000_000),
});

export const produtoPrecificacaoSchema = z.object({
  produtoId: z.uuid("Produto inválido. Recarregue a página."),
  rendimento: inteiro("Informe quanto a receita rende (número inteiro maior que zero).", 1_000_000),
  // Vazio = usa a margem padrão.
  margemPercentual: z.preprocess(vazioViraNulo, percentual(9900).nullable()),
});

// O preço que a tela mostrou: o servidor recalcula e recusa se mudou nesse meio-tempo.
export const aplicarPrecoSchema = z.object({
  produtoId: z.uuid("Produto inválido. Recarregue a página."),
  precoCentavos: z.coerce.number().int().min(1).max(100_000_00),
});
