import type { ComandaAberta } from "../queries";
import { CartaoComanda } from "./CartaoComanda";

export function ListaComandas({ comandas }: { comandas: ComandaAberta[] }) {
  if (comandas.length === 0) {
    return <p className="rounded-card border border-borda bg-superficie p-6 text-texto-suave">Nenhuma comanda aberta agora.</p>;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {comandas.map((comanda) => (
        <li key={comanda.id}>
          <CartaoComanda comanda={comanda} />
        </li>
      ))}
    </ul>
  );
}
