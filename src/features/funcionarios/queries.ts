import "server-only";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { funcionarios } from "@/db/schema";

export async function listarFuncionarios() {
  return getDb()
    .select({
      id: funcionarios.id,
      nome: funcionarios.nome,
      usuario: funcionarios.usuario,
      papel: funcionarios.papel,
      ativo: funcionarios.ativo,
      podeLancarEstoque: funcionarios.podeLancarEstoque,
      podeGerenciarProdutos: funcionarios.podeGerenciarProdutos,
      podeCancelarVenda: funcionarios.podeCancelarVenda,
      podeVerHistorico: funcionarios.podeVerHistorico,
    })
    .from(funcionarios)
    .orderBy(asc(funcionarios.nome))
    .limit(200);
}

export type FuncionarioLista = Awaited<ReturnType<typeof listarFuncionarios>>[number];
