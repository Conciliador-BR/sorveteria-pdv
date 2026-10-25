export const ABAS = [
  { id: "precos", rotulo: "Preços e fichas" },
  { id: "insumos", rotulo: "Insumos" },
  { id: "custos", rotulo: "Custos fixos e máquinas" },
  { id: "taxas", rotulo: "Impostos e margem" },
] as const;

export type Aba = (typeof ABAS)[number]["id"];

export function lerAba(valor: string | string[] | undefined): Aba {
  return ABAS.find((aba) => aba.id === valor)?.id ?? "precos";
}
