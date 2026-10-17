import Link from "next/link";
import { Aviso } from "@/components/ui/Aviso";
import { estiloBotao } from "@/components/ui/Button";

export function SemCaixaAviso({ texto = "Abra o seu caixa antes de vender." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <Aviso tipo="info">{texto}</Aviso>
      <Link href="/caixa" className={estiloBotao({ tamanho: "lg" })}>
        Abrir caixa
      </Link>
    </div>
  );
}
