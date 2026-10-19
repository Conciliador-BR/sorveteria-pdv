import { z } from "zod";
import { lerReais } from "@/lib/dinheiro";
import { marcado, vazioViraNulo } from "@/lib/formulario";

export const valorReais = (mensagem: string) =>
  z.preprocess((valor) => (typeof valor === "string" ? lerReais(valor) : valor), z.number({ error: mensagem }).int().min(0).max(10_000_000));

export const abrirCaixaSchema = z
  .object({ senha: z.string().min(1, "Digite sua senha."), fundo: z.preprocess(vazioViraNulo, valorReais("Informe o fundo de troco, por exemplo 300,00.").nullable()), semFundo: marcado })
  .superRefine((dados, contexto) => {
    if (dados.semFundo) return;
    if (dados.fundo === null) contexto.addIssue({ code: "custom", path: ["fundo"], message: "Informe o fundo de troco ou marque \"Abrir sem fundo\"." });
    else if (dados.fundo === 0) contexto.addIssue({ code: "custom", path: ["fundo"], message: "Fundo de R$ 0,00 só com \"Abrir sem fundo\" marcado." });
  });

export const movimentoCaixaSchema = z.object({
  tipo: z.enum(["sangria", "suprimento"]),
  valor: valorReais("Informe o valor.").refine((valor) => valor > 0, "O valor precisa ser maior que zero."),
  motivo: z.string().trim().min(3, "Diga o motivo.").max(120),
});

export const fecharCaixaSchema = z.object({
  senha: z.string().min(1, "Digite sua senha."),
  contado: valorReais("Informe quanto dinheiro tem na gaveta."),
  observacao: z.preprocess(vazioViraNulo, z.string().trim().max(300).nullable()).default(null),
});

export const reabrirCaixaSchema = z.object({ caixaId: z.uuid(), motivo: z.string().trim().min(3, "Diga o motivo.").max(200) });
