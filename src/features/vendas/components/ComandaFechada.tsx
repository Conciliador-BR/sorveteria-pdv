import Link from "next/link";
import { Aviso } from "@/components/ui/Aviso";
import { estiloBotao } from "@/components/ui/Button";
import { ConfirmacaoVenda } from "./ConfirmacaoVenda";

type ComandaFechadaProps = {
  comanda: { id: string; numero: number; status: "aberta" | "concluida" | "cancelada"; totalCentavos: number; trocoCentavos: number };
};

// Comanda que já saiu de "aberta": cobrada (mostra o resumo e o troco) ou cancelada.
export function ComandaFechada({ comanda }: ComandaFechadaProps) {
  const voltar = (
    <Link href="/comandas" className={estiloBotao({ tamanho: "lg", className: "w-full sm:w-auto" })}>
      Voltar às comandas
    </Link>
  );

  if (comanda.status === "concluida") {
    return (
      <ConfirmacaoVenda titulo="Comanda cobrada" venda={comanda}>
        {voltar}
      </ConfirmacaoVenda>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <Aviso tipo="info">Essa comanda foi cancelada e não aceita mais itens.</Aviso>
      {voltar}
    </div>
  );
}
