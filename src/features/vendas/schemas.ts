import { z } from "zod";

const itemSchema = z.union([
  z.object({ produtoId: z.uuid(), quantidade: z.number().int().min(1).max(999) }),
  z.object({ produtoId: z.uuid(), pesoGramas: z.number().int().min(1).max(100_000) }),
  // Produto por peso cobrado pelo valor que a balança mostrou.
  z.object({ produtoId: z.uuid(), valorCentavos: z.number().int().min(1).max(10_000_000) }),
]);

const centavos = z.number().int().min(0).max(10_000_000);

const pagamentoSchema = z.discriminatedUnion("forma", [
  z.object({ forma: z.literal("dinheiro"), valorCentavos: centavos, recebidoCentavos: centavos }),
  z.object({ forma: z.literal("pix"), valorCentavos: centavos }),
  z.object({ forma: z.enum(["debito", "credito"]), valorCentavos: centavos, bandeiraId: z.uuid() }),
]);

export const itensSchema = z.array(itemSchema).min(1, "Adicione pelo menos um produto.").max(100);
export const pagamentosSchema = z.array(pagamentoSchema).min(1, "Escolha a forma de pagamento.").max(4);

export const vendaBalcaoSchema = z.object({ id: z.uuid(), itens: itensSchema, pagamentos: pagamentosSchema });
export const abrirComandaSchema = z.object({ identificacao: z.string().trim().min(1, "Dê um nome ou número à comanda.").max(40) });
export const lancarNaComandaSchema = z.object({ vendaId: z.uuid(), itens: itensSchema });
export const cobrarComandaSchema = z.object({ vendaId: z.uuid(), pagamentos: pagamentosSchema });
export const removerItemSchema = z.object({ itemId: z.uuid() });
export const cancelarVendaSchema = z.object({ vendaId: z.uuid(), motivo: z.string().trim().min(3, "Diga o motivo.").max(200) });

export type ItemPedido = z.infer<typeof itemSchema>;

// As telas enviam o carrinho como JSON num campo do formulário.
export function lerJson(formData: FormData, campo = "dados"): unknown {
  try {
    return JSON.parse(String(formData.get(campo) ?? ""));
  } catch {
    return null;
  }
}
