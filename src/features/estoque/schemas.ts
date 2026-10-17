import { z } from "zod";
import { vazioViraNulo } from "@/lib/formulario";

const quantidade = z.coerce.number({ error: "Informe a quantidade." }).int("Use número inteiro (gramas para produto por peso).").min(1, "A quantidade precisa ser maior que zero.").max(10_000_000);
const observacao = z.preprocess(vazioViraNulo, z.string().trim().max(200).nullable()).default(null);

export const lancamentoSchema = z.discriminatedUnion("tipo", [
  z.object({ produtoId: z.uuid(), tipo: z.literal("entrada"), motivo: z.enum(["compra", "outro"]), quantidade, observacao }),
  z.object({ produtoId: z.uuid(), tipo: z.literal("saida"), motivo: z.enum(["perda", "consumo_interno", "outro"]), quantidade, observacao }),
  z.object({
    produtoId: z.uuid(),
    tipo: z.literal("ajuste"),
    contado: z.coerce.number({ error: "Informe o valor contado." }).int().min(0).max(10_000_000),
    observacao,
  }),
]);
