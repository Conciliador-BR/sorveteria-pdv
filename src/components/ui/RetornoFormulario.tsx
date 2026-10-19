import { Aviso } from "./Aviso";

// Mensagem de sucesso ou erro geral de um formulário. A `key` muda a cada envio para anunciar de novo.
export function RetornoFormulario({ estado }: { estado: { ok?: string; erro?: string; envio?: number } }) {
  if (estado.erro) return <Aviso key={estado.envio} tipo="erro">{estado.erro}</Aviso>;
  if (estado.ok) return <Aviso key={estado.envio} tipo="sucesso">{estado.ok}</Aviso>;
  return null;
}
