import { describe, expect, it } from "vitest";
import { GALERIA } from "./galeria";
import { salvarProdutoSchema, TAMANHO_MAXIMO_FOTO, tipoDaImagem } from "./schemas";

const base = { nome: "Picolé de uva", categoriaId: "", codigo: "", tipoVenda: "unidade", precoCentavos: "8,00", estoqueMinimo: "0", ativo: "on" };
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const webp = Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1");
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const dataUrl = (tipo: string, bytes: Buffer) => `data:${tipo};base64,${bytes.toString("base64")}`;
const foto = (valor?: string) => salvarProdutoSchema.safeParse({ ...base, foto: valor });

describe("tipoDaImagem", () => {
  it("reconhece JPEG, PNG e WebP pelos primeiros bytes", () => {
    expect(tipoDaImagem(jpeg)).toBe("image/jpeg");
    expect(tipoDaImagem(png)).toBe("image/png");
    expect(tipoDaImagem(webp)).toBe("image/webp");
    expect(tipoDaImagem(Buffer.from("<svg></svg>"))).toBeNull();
  });
});

describe("campo foto do produto", () => {
  it("sem foto quando o campo vem vazio ou não vem", () => {
    expect(foto("").data?.foto).toEqual({ tipo: "nenhuma" });
    expect(foto(undefined).data?.foto).toEqual({ tipo: "nenhuma" });
  });

  it("aceita só imagens que existem na galeria", () => {
    expect(foto(`galeria:${GALERIA[0].id}`).data?.foto).toEqual({ tipo: "galeria", id: GALERIA[0].id });
    expect(foto("galeria:../../segredo").success).toBe(false);
    expect(foto("galeria:nao-existe").success).toBe(false);
  });

  it("mantém a foto já enviada", () => {
    expect(foto("manter").data?.foto).toEqual({ tipo: "manter" });
  });

  it("usa o tipo real do arquivo, não o declarado", () => {
    const resultado = foto(dataUrl("image/jpeg", png)).data?.foto;
    expect(resultado).toMatchObject({ tipo: "nova", formato: "image/png" });
  });

  it("recusa arquivo que não é imagem ou é grande demais", () => {
    expect(foto(dataUrl("image/png", Buffer.from("<svg onload=alert(1)>"))).success).toBe(false);
    expect(foto("data:image/svg+xml;base64,PHN2Zz4=").success).toBe(false);
    const grande = Buffer.concat([jpeg, Buffer.alloc(TAMANHO_MAXIMO_FOTO)]);
    const resultado = foto(dataUrl("image/jpeg", grande));
    expect(resultado.error?.issues[0]?.message).toBe("Foto grande demais. Tente outra foto.");
  });
});
