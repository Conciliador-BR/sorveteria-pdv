import { z } from "zod";
import { lerReais } from "@/lib/dinheiro";
import { marcado, vazioViraNulo } from "@/lib/formulario";


const precoSchema = z.preprocess(
  (valor) => (typeof valor === "string" ? lerReais(valor) : valor),
  z.number({ error: "Informe o preço, por exemplo 12,50." }).int().min(0).max(100_000_00, "Preço alto demais."),
);

export const produtoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(80, "Use até 80 caracteres."),
  categoriaId: z.preprocess(vazioViraNulo, z.uuid().nullable()),
  tipoVenda: z.enum(["unidade", "peso"], { error: "Escolha unidade ou peso." }),
  precoCentavos: precoSchema,
  codigo: z.preprocess(vazioViraNulo, z.string().trim().max(40).nullable()),
  estoqueMinimo: z.coerce.number({ error: "Use um número inteiro." }).int("Use um número inteiro.").min(0).max(1_000_000),
  baixaAutomatica: marcado,
  ativo: marcado,
});

// `id` vazio = cadastro novo; preenchido = edição.
export const salvarProdutoSchema = produtoSchema.extend({ id: z.preprocess(vazioViraNulo, z.uuid().nullable()).default(null) });

export const categoriaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(40, "Use até 40 caracteres."),
  ordem: z.coerce.number().int().min(0).max(999).default(0),
});
