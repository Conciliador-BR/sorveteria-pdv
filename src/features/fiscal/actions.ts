"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { temPermissao } from "@/features/auth/permissoes";
import { exigirFuncionario } from "@/features/auth/sessao";
import { buscarVendaPorId } from "@/features/historico/queries";
import { proximoEnvio, type EstadoFormulario } from "@/lib/formulario";
import { emitirNfce } from "./emissao";

const MENSAGENS = {
  emitida: "NFC-e emitida.",
  ja_emitida: "Esta venda já tem NFC-e.",
  desligada: "A emissão de NFC-e está desligada em Configurações.",
  venda_invalida: "Só venda concluída recebe NFC-e.",
} as const;

// Tentar de novo pelo comprovante, quando a emissão logo após a venda falhou.
export async function emitirNotaDaVenda(anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const funcionario = await exigirFuncionario();
  const envio = proximoEnvio(anterior);
  const vendaId = z.uuid().safeParse(formData.get("vendaId"));
  if (!vendaId.success) return { erro: "Venda inválida. Recarregue a página.", envio };

  // Mesma regra do detalhe da venda: a própria venda ou quem vê o histórico de todos.
  const venda = await buscarVendaPorId(vendaId.data, temPermissao(funcionario, "pode_ver_historico") ? undefined : funcionario.id);
  if (!venda) return { erro: "Venda não encontrada.", envio };

  const resultado = await emitirNfce(venda.id, funcionario.id);
  revalidatePath(`/comprovante/${venda.id}`);
  return resultado === "emitida" || resultado === "ja_emitida" ? { ok: MENSAGENS[resultado], envio } : { erro: MENSAGENS[resultado], envio };
}
