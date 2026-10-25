"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { CampoDinheiro } from "@/components/ui/CampoDinheiro";
import { formatarPeso, formatarReais, gramasPorValor } from "@/lib/dinheiro";
import { totalDaLinha, type LinhaCarrinho, type ModoPeso } from "../regras";
import { BotaoOpcao } from "./BotaoOpcao";

type LinhaDoCarrinhoProps = {
  linha: LinhaCarrinho;
  aoAlterarQuantidade: (quantidade: number) => void;
  aoDefinirPeso: (pesoGramas: number | null) => void;
  aoDefinirModoPeso: (modo: ModoPeso) => void;
  aoDefinirValorPeso: (valorCentavos: number | null) => void;
  aoRemover: () => void;
  /** "copo 2" quando o mesmo produto por peso aparece em mais de uma linha; diferencia os rótulos. */
  sufixo?: string;
};

export function LinhaDoCarrinho({ linha, aoAlterarQuantidade, aoDefinirPeso, aoDefinirModoPeso, aoDefinirValorPeso, aoRemover, sufixo }: LinhaDoCarrinhoProps) {
  const { produto } = linha;
  const nome = sufixo ? `${produto.nome}, ${sufixo}` : produto.nome;
  // Sem preço do kg não dá para estimar as gramas; o servidor também recusa.
  const aceitaValor = produto.precoCentavos > 0;
  const porPeso = produto.tipoVenda === "peso";

  return (
    <li className="flex flex-col gap-2 border-b border-borda py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{nome}</p>
          <p className="text-sm text-texto-suave tabular-nums">
            {formatarReais(produto.precoCentavos)}
            {porPeso ? " o kg" : " cada"}
          </p>
        </div>
        <p className="text-xl font-bold tabular-nums">{formatarReais(totalDaLinha(linha))}</p>
      </div>

      <div className="flex items-end gap-2">
        {porPeso ? (
          <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label={`Como informar ${nome}`}>
              <BotaoOpcao
                selecionado={linha.modoPeso === "gramas"}
                aria-label="Informar peso em gramas"
                className="min-h-12 text-base"
                onClick={() => aoDefinirModoPeso("gramas")}
              >
                Peso (g)
              </BotaoOpcao>
              <BotaoOpcao
                selecionado={linha.modoPeso === "valor"}
                aria-label="Informar valor em reais"
                disabled={!aceitaValor}
                className="min-h-12 text-base"
                onClick={() => aoDefinirModoPeso("valor")}
              >
                Valor (R$)
              </BotaoOpcao>
            </div>
            {linha.modoPeso === "gramas" || !aceitaValor ? (
              <Campo
                rotulo={`Peso de ${nome} (gramas)`}
                inputMode="numeric"
                autoComplete="off"
                // Linha nova de peso já recebe o foco para digitar o que a balança mostrou.
                autoFocus={linha.pesoGramas === null}
                value={linha.pesoGramas ?? ""}
                onChange={(evento) => {
                  const digitos = evento.target.value.replace(/\D/g, "").slice(0, 6);
                  aoDefinirPeso(digitos ? Number(digitos) : null);
                }}
                placeholder="Ex.: 350"
                dica={linha.pesoGramas === null ? "Digite o peso que a balança mostrou." : formatarPeso(linha.pesoGramas)}
                className="text-right text-xl tabular-nums"
              />
            ) : (
              <CampoDinheiro
                rotulo={`Valor de ${nome} na balança`}
                autoFocus={linha.valorCentavos === null}
                valorInicialCentavos={linha.valorCentavos ?? 0}
                aoMudar={(centavos) => aoDefinirValorPeso(centavos || null)}
                dica={
                  linha.valorCentavos === null
                    ? "Digite o valor em reais que a balança mostrou."
                    : `Cerca de ${formatarPeso(gramasPorValor(produto.precoCentavos, linha.valorCentavos))}`
                }
              />
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2" role="group" aria-label={`Quantidade de ${produto.nome}`}>
            <Button variante="secundario" className="w-12 px-0" aria-label={`Diminuir ${produto.nome}`} onClick={() => aoAlterarQuantidade(linha.quantidade - 1)}>
              <Minus aria-hidden="true" className="size-5" />
            </Button>
            <output aria-live="polite" className="min-w-10 text-center text-xl font-bold tabular-nums">
              {linha.quantidade}
            </output>
            <Button variante="secundario" className="w-12 px-0" aria-label={`Aumentar ${produto.nome}`} onClick={() => aoAlterarQuantidade(linha.quantidade + 1)}>
              <Plus aria-hidden="true" className="size-5" />
            </Button>
          </div>
        )}
        <Button variante="fantasma" className="w-12 px-0 text-perigo" aria-label={`Tirar ${nome} do carrinho`} onClick={aoRemover}>
          <Trash2 aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </li>
  );
}
