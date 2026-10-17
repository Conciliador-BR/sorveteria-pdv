import { z } from "zod";
import { usuarioSchema } from "@/features/auth/usuario";
import { marcado } from "@/lib/formulario";

const nomeSchema = z.string().trim().min(2, "Informe o nome.").max(80, "Use até 80 caracteres.");
const senhaSchema = z.string().min(6, "A senha precisa de pelo menos 6 caracteres.").max(72, "Use até 72 caracteres.");

export const permissoesSchema = z.object({
  podeLancarEstoque: marcado,
  podeGerenciarProdutos: marcado,
  podeCancelarVenda: marcado,
  podeVerHistorico: marcado,
});

export const criarFuncionarioSchema = permissoesSchema.extend({
  nome: nomeSchema,
  usuario: usuarioSchema,
  senha: senhaSchema,
  papel: z.enum(["funcionario", "dono"]).default("funcionario"),
});

export const editarFuncionarioSchema = permissoesSchema.extend({
  id: z.uuid(),
  nome: nomeSchema,
  papel: z.enum(["funcionario", "dono"]),
  ativo: marcado,
});

export const redefinirSenhaSchema = z.object({ id: z.uuid(), senha: senhaSchema });
