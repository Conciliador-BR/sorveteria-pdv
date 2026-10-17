import { formatarReais } from "@/lib/dinheiro";
import { cn } from "@/lib/utils";
import { conferir } from "../regras";

const situacoes = {
  certo: { rotulo: "Sem diferença", classes: "border-sucesso bg-sucesso-suave text-sucesso-escuro" },
  sobra: { rotulo: "Sobra", classes: "border-primaria bg-primaria-suave text-primaria-escura" },
  falta: { rotulo: "Falta", classes: "border-perigo bg-perigo-suave text-perigo" },
} as const;

// Esperado × contado na gaveta, com a diferença destacada (falta em vermelho, sobra em azul).
export function ConferenciaCaixa({ esperadoCentavos, contadoCentavos }: { esperadoCentavos: number; contadoCentavos: number }) {
  const { diferencaCentavos, situacao } = conferir(esperadoCentavos, contadoCentavos);
  const { rotulo, classes } = situacoes[situacao];
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-campo border border-borda bg-fundo p-3">
          <dt className="text-sm text-texto-suave">Esperado na gaveta</dt>
          <dd className="text-2xl font-bold tabular-nums">{formatarReais(esperadoCentavos)}</dd>
        </div>
        <div className="rounded-campo border border-borda bg-fundo p-3">
          <dt className="text-sm text-texto-suave">Contado</dt>
          <dd className="text-2xl font-bold tabular-nums">{formatarReais(contadoCentavos)}</dd>
        </div>
      </dl>
      <p className={cn("flex flex-wrap items-baseline justify-between gap-2 rounded-campo border-l-4 px-4 py-3", classes)}>
        <span className="text-xl font-semibold">{rotulo}</span>
        <span className="text-3xl font-bold tabular-nums">{formatarReais(Math.abs(diferencaCentavos))}</span>
      </p>
    </div>
  );
}
