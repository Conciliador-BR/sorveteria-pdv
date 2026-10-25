import { z } from "zod";
import { cnpjValido, limparCnpj, UFS } from "@/features/fiscal/regras";
import { marcado, vazioViraNulo } from "@/lib/formulario";

export const nomeLojaSchema = z.object({
  nomeLoja: z.string({ error: "Informe o nome da loja." }).trim().min(1, "Informe o nome da loja.").max(60, "Use até 60 caracteres."),
});

const nomeBandeira = z.string({ error: "Informe o nome da bandeira." }).trim().min(2, "Informe o nome da bandeira.").max(30, "Use até 30 caracteres.");

export const novaBandeiraSchema = z.object({
  nome: nomeBandeira,
  tipo: z.enum(["debito", "credito"], { error: "Escolha débito ou crédito." }),
});

// O tipo não muda na edição: pagamentos antigos gravaram a bandeira junto da forma (débito/crédito).
export const editarBandeiraSchema = z.object({
  id: z.uuid("Bandeira inválida. Recarregue a página."),
  nome: nomeBandeira,
  ativo: marcado,
});

// Vazio vira null; com a emissão ligada, todos os dados do emitente são obrigatórios.
const textoOpcional = (maximo: number) =>
  z.preprocess(vazioViraNulo, z.string().trim().max(maximo, `Use até ${maximo} caracteres.`).nullable().default(null));

export const dadosFiscaisSchema = z
  .object({
    emitirNfce: marcado,
    razaoSocial: textoOpcional(120),
    cnpj: z.preprocess(vazioViraNulo, z.string().transform(limparCnpj).refine(cnpjValido, "CNPJ inválido. Confira os números.").nullable().default(null)),
    inscricaoEstadual: z.preprocess(
      vazioViraNulo,
      z.string().transform((ie) => ie.replace(/\D/g, "")).pipe(z.string().regex(/^\d{2,14}$/, "Use só os números da inscrição estadual.")).nullable().default(null),
    ),
    endereco: textoOpcional(160),
    uf: z.preprocess(vazioViraNulo, z.enum(UFS, { error: "Escolha a UF." }).nullable().default(null)),
  })
  .superRefine((dados, contexto) => {
    if (!dados.emitirNfce) return;
    const faltando = { razaoSocial: "Informe a razão social.", cnpj: "Informe o CNPJ.", inscricaoEstadual: "Informe a inscrição estadual.", endereco: "Informe o endereço.", uf: "Escolha a UF." } as const;
    for (const [campo, mensagem] of Object.entries(faltando)) {
      if (!dados[campo as keyof typeof faltando]) contexto.addIssue({ code: "custom", path: [campo], message: mensagem });
    }
  });
