import { CircleCheck } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { Card } from "@/components/ui/Card";
import { TotalDestaque } from "./TotalDestaque";

type ConfirmacaoVendaProps = {
  titulo: string;
  venda: { numero: number; totalCentavos: number; trocoCentavos: number };
  /** Ação seguinte: "Nova venda", "Voltar às comandas". */
  children: ReactNode;
  /** Para levar o foco ao título quando a confirmação aparece. */
  refTitulo?: Ref<HTMLHeadingElement>;
};

export function ConfirmacaoVenda({ titulo, venda, children, refTitulo }: ConfirmacaoVendaProps) {
  return (
    <Card className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center">
      <div role="status" className="flex flex-col items-center gap-2">
        <CircleCheck aria-hidden="true" className="size-12 text-sucesso-escuro" />
        <h2 ref={refTitulo} tabIndex={-1} className="text-2xl font-bold">
          {titulo}
        </h2>
        <p className="text-xl text-texto-suave">Venda nº {venda.numero}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
        <TotalDestaque rotulo="Total" centavos={venda.totalCentavos} aoVivo={false} />
        <TotalDestaque rotulo="Troco" centavos={venda.trocoCentavos} tom="sucesso" aoVivo={false} />
      </div>
      {children}
    </Card>
  );
}
