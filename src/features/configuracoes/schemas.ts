import { z } from "zod";
import { marcado } from "@/lib/formulario";

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
