import { ClipboardList, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { estiloBotao } from "@/components/ui/Button";

// Atalhos grandes do balcão a partir do caixa aberto.
export function AtalhosCaixa() {
  return (
    <nav aria-label="Atalhos do caixa" className="grid gap-3 sm:grid-cols-2">
      <Link href="/vender" className={estiloBotao({ variante: "cobrar", tamanho: "lg" })}>
        <ShoppingCart aria-hidden="true" className="size-6" />
        Vender
      </Link>
      <Link href="/comandas" className={estiloBotao({ variante: "secundario", tamanho: "lg" })}>
        <ClipboardList aria-hidden="true" className="size-6" />
        Comandas
      </Link>
    </nav>
  );
}
