// O dono não pode se trancar fora: não tira o próprio papel de dono nem se desativa.
export function alteracaoTrancaODono(params: {
  idEditado: string;
  idDono: string;
  novoPapel: "funcionario" | "dono";
  novoAtivo: boolean;
}) {
  if (params.idEditado !== params.idDono) return false;
  return params.novoPapel !== "dono" || !params.novoAtivo;
}
