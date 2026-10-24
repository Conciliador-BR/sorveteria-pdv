import { z } from "zod";
import { lerReais } from "@/lib/dinheiro";
import { marcado, vazioViraNulo } from "@/lib/formulario";
import { imagemDaGaleriaExiste } from "./galeria";


const precoSchema = z.preprocess(
  (valor) => (typeof valor === "string" ? lerReais(valor) : valor),
  z.number({ error: "Informe o preço, por exemplo 12,50." }).int().min(0).max(100_000_00, "Preço alto demais."),
);

export const TAMANHO_MAXIMO_FOTO = 300 * 1024;

// Confere o tipo pelos primeiros bytes do arquivo, não pelo que o navegador declarou.
export function tipoDaImagem(bytes: Uint8Array) {
  const texto = (inicio: number, fim: number) => String.fromCharCode(...bytes.subarray(inicio, fim));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (texto(0, 8) === "\x89PNG\r\n\x1a\n") return "image/png";
  if (texto(0, 4) === "RIFF" && texto(8, 12) === "WEBP") return "image/webp";
  return null;
}

// Campo `foto` do formulário: vazio (sem foto), "manter" (foto enviada antes),
// "galeria:<id>" ou a foto nova como data URL (já reduzida no navegador).
const fotoSchema = z
  .string()
  .default("")
  .transform((valor, contexto) => {
    if (valor === "") return { tipo: "nenhuma" } as const;
    if (valor === "manter") return { tipo: "manter" } as const;
    if (valor.startsWith("galeria:")) {
      const id = valor.slice("galeria:".length);
      if (imagemDaGaleriaExiste(id)) return { tipo: "galeria", id } as const;
    } else {
      const base64 = /^data:image\/(?:webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(valor)?.[1];
      const conteudo = base64 ? Buffer.from(base64, "base64") : null;
      const tipo = conteudo ? tipoDaImagem(conteudo) : null;
      if (conteudo && conteudo.length > TAMANHO_MAXIMO_FOTO) {
        contexto.addIssue({ code: "custom", message: "Foto grande demais. Tente outra foto." });
        return z.NEVER;
      }
      if (conteudo && tipo) return { tipo: "nova", conteudo, formato: tipo } as const;
    }
    contexto.addIssue({ code: "custom", message: "Foto inválida. Escolha outra imagem." });
    return z.NEVER;
  });

export const produtoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(80, "Use até 80 caracteres."),
  categoriaId: z.preprocess(vazioViraNulo, z.uuid().nullable()),
  tipoVenda: z.enum(["unidade", "peso"], { error: "Escolha unidade ou peso." }),
  precoCentavos: precoSchema,
  codigo: z.preprocess(vazioViraNulo, z.string().trim().max(40).nullable()),
  estoqueMinimo: z.coerce.number({ error: "Use um número inteiro." }).int("Use um número inteiro.").min(0).max(1_000_000),
  baixaAutomatica: marcado,
  ativo: marcado,
  foto: fotoSchema,
});

// `id` vazio = cadastro novo; preenchido = edição.
export const salvarProdutoSchema = produtoSchema.extend({ id: z.preprocess(vazioViraNulo, z.uuid().nullable()).default(null) });

export const categoriaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(40, "Use até 40 caracteres."),
  ordem: z.coerce.number().int().min(0).max(999).default(0),
});
