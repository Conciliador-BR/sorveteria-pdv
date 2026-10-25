import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { notasFiscais } from "@/db/schema";

export async function buscarNotaDaVenda(vendaId: string) {
  const [nota] = await getDb()
    .select({
      ambiente: notasFiscais.ambiente,
      serie: notasFiscais.serie,
      numero: notasFiscais.numero,
      chaveAcesso: notasFiscais.chaveAcesso,
      protocolo: notasFiscais.protocolo,
      emitente: notasFiscais.emitente,
      emitidaEm: notasFiscais.emitidaEm,
    })
    .from(notasFiscais)
    .where(eq(notasFiscais.vendaId, vendaId))
    .limit(1);
  return nota ?? null;
}

export type NotaDaVenda = NonNullable<Awaited<ReturnType<typeof buscarNotaDaVenda>>>;
