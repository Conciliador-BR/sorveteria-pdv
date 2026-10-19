import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { estiloBotao } from "@/components/ui/Button";

// Atalho grande do balcão a partir do caixa aberto: vendas e comandas ficam na mesma tela.
export function AtalhosCaixa() {
  return (
    <nav aria-label="Atalhos do caixa" className="grid gap-3 sm:max-w-md">
      <Link href="/vender" className={estiloBotao({ variante: "cobrar", tamanho: "lg" })}>
        <ShoppingCart aria-hidden="true" className="size-6" />
        Vender e comandas
      </Link>
    </nav>
  );
}
