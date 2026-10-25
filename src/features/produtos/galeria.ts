// Galeria de imagens padrão para os produtos, servidas de `public/produtos/galeria/`.
// Ilustrações próprias (sem marcas) + Fluent UI Emoji da Microsoft (licença MIT, ver LICENCA-fluentui-emoji.txt).
// O produto guarda só o `id` (nome do arquivo sem `.svg`).

export type GrupoGaleria = "Sorvetes" | "Picolés e geladinhos" | "Açaí" | "Bebidas" | "Doces" | "Frutas" | "Lanches" | "Outros";

type ImagemGaleria = { id: string; nome: string; grupo: GrupoGaleria };

export const GALERIA: readonly ImagemGaleria[] = [
  { id: "casquinha", nome: "Casquinha", grupo: "Sorvetes" },
  { id: "casquinha-duas-bolas", nome: "Casquinha duas bolas", grupo: "Sorvetes" },
  { id: "casquinha-chocolate", nome: "Casquinha de chocolate", grupo: "Sorvetes" },
  { id: "copinho-sorvete", nome: "Copinho de sorvete", grupo: "Sorvetes" },
  { id: "taca-sorvete", nome: "Taça de sorvete", grupo: "Sorvetes" },
  { id: "sundae", nome: "Sundae", grupo: "Sorvetes" },
  { id: "sorvete-quilo", nome: "Sorvete por quilo", grupo: "Sorvetes" },
  { id: "pote-sorvete", nome: "Pote de sorvete", grupo: "Sorvetes" },
  { id: "pote-sorvete-chocolate", nome: "Pote de sorvete chocolate", grupo: "Sorvetes" },
  { id: "milkshake-morango", nome: "Milkshake de morango", grupo: "Sorvetes" },
  { id: "milkshake-chocolate", nome: "Milkshake de chocolate", grupo: "Sorvetes" },
  { id: "milkshake-baunilha", nome: "Milkshake de baunilha", grupo: "Sorvetes" },
  { id: "raspadinha", nome: "Raspadinha", grupo: "Sorvetes" },

  { id: "picole-chocolate", nome: "Picolé de chocolate", grupo: "Picolés e geladinhos" },
  { id: "picole-coberto", nome: "Picolé coberto", grupo: "Picolés e geladinhos" },
  { id: "picole-morango", nome: "Picolé de morango", grupo: "Picolés e geladinhos" },
  { id: "picole-limao", nome: "Picolé de limão", grupo: "Picolés e geladinhos" },
  { id: "picole-coco", nome: "Picolé de coco", grupo: "Picolés e geladinhos" },
  { id: "picole-uva", nome: "Picolé de uva", grupo: "Picolés e geladinhos" },
  { id: "picole-manga", nome: "Picolé de manga", grupo: "Picolés e geladinhos" },
  { id: "geladinho-morango", nome: "Geladinho de morango", grupo: "Picolés e geladinhos" },
  { id: "geladinho-chocolate", nome: "Geladinho de chocolate", grupo: "Picolés e geladinhos" },
  { id: "geladinho-maracuja", nome: "Geladinho de maracujá", grupo: "Picolés e geladinhos" },

  { id: "acai-tigela", nome: "Açaí na tigela", grupo: "Açaí" },
  { id: "acai-copo", nome: "Açaí no copo", grupo: "Açaí" },
  { id: "tigela", nome: "Tigela", grupo: "Açaí" },

  { id: "lata-refrigerante-cola", nome: "Refrigerante cola (lata)", grupo: "Bebidas" },
  { id: "lata-refrigerante-guarana", nome: "Guaraná (lata)", grupo: "Bebidas" },
  { id: "lata-refrigerante-laranja", nome: "Refrigerante laranja (lata)", grupo: "Bebidas" },
  { id: "lata-refrigerante-limao", nome: "Refrigerante limão (lata)", grupo: "Bebidas" },
  { id: "lata-refrigerante-uva", nome: "Refrigerante uva (lata)", grupo: "Bebidas" },
  { id: "lata-energetico", nome: "Energético (lata)", grupo: "Bebidas" },
  { id: "garrafa-refrigerante", nome: "Refrigerante cola (garrafa)", grupo: "Bebidas" },
  { id: "garrafa-refrigerante-guarana", nome: "Guaraná (garrafa)", grupo: "Bebidas" },
  { id: "copo-refrigerante", nome: "Copo de refrigerante", grupo: "Bebidas" },
  { id: "garrafa-agua", nome: "Água", grupo: "Bebidas" },
  { id: "agua-com-gas", nome: "Água com gás", grupo: "Bebidas" },
  { id: "suco-laranja", nome: "Suco de laranja", grupo: "Bebidas" },
  { id: "suco-limao", nome: "Suco de limão", grupo: "Bebidas" },
  { id: "suco-morango", nome: "Suco de morango", grupo: "Bebidas" },
  { id: "suco-caixinha", nome: "Suco de caixinha", grupo: "Bebidas" },
  { id: "drink-tropical", nome: "Drink tropical", grupo: "Bebidas" },
  { id: "bubble-tea", nome: "Bubble tea", grupo: "Bebidas" },
  { id: "copo-leite", nome: "Leite", grupo: "Bebidas" },
  { id: "cafe", nome: "Café", grupo: "Bebidas" },
  { id: "cha", nome: "Chá", grupo: "Bebidas" },
  { id: "chope", nome: "Chope / cerveja", grupo: "Bebidas" },
  { id: "gelo", nome: "Gelo", grupo: "Bebidas" },

  { id: "chocolate", nome: "Chocolate", grupo: "Doces" },
  { id: "bala", nome: "Bala", grupo: "Doces" },
  { id: "pirulito", nome: "Pirulito", grupo: "Doces" },
  { id: "rosquinha", nome: "Rosquinha", grupo: "Doces" },
  { id: "cookie", nome: "Cookie", grupo: "Doces" },
  { id: "cupcake", nome: "Cupcake", grupo: "Doces" },
  { id: "fatia-bolo", nome: "Fatia de bolo", grupo: "Doces" },
  { id: "bolo", nome: "Bolo", grupo: "Doces" },
  { id: "torta", nome: "Torta", grupo: "Doces" },
  { id: "pudim", nome: "Pudim", grupo: "Doces" },
  { id: "mel", nome: "Mel", grupo: "Doces" },
  { id: "waffle", nome: "Waffle", grupo: "Doces" },
  { id: "panqueca", nome: "Panqueca", grupo: "Doces" },
  { id: "pipoca", nome: "Pipoca", grupo: "Doces" },
  { id: "amendoim", nome: "Amendoim", grupo: "Doces" },
  { id: "castanha", nome: "Castanha", grupo: "Doces" },

  { id: "morango", nome: "Morango", grupo: "Frutas" },
  { id: "banana", nome: "Banana", grupo: "Frutas" },
  { id: "uva", nome: "Uva", grupo: "Frutas" },
  { id: "melancia", nome: "Melancia", grupo: "Frutas" },
  { id: "manga", nome: "Manga", grupo: "Frutas" },
  { id: "abacaxi", nome: "Abacaxi", grupo: "Frutas" },
  { id: "coco", nome: "Coco", grupo: "Frutas" },
  { id: "cereja", nome: "Cereja", grupo: "Frutas" },
  { id: "pessego", nome: "Pêssego", grupo: "Frutas" },
  { id: "kiwi", nome: "Kiwi", grupo: "Frutas" },
  { id: "limao", nome: "Limão", grupo: "Frutas" },
  { id: "mexerica", nome: "Mexerica", grupo: "Frutas" },
  { id: "mirtilo", nome: "Mirtilo", grupo: "Frutas" },
  { id: "maca", nome: "Maçã", grupo: "Frutas" },
  { id: "melao", nome: "Melão", grupo: "Frutas" },
  { id: "abacate", nome: "Abacate", grupo: "Frutas" },

  { id: "sanduiche", nome: "Sanduíche", grupo: "Lanches" },
  { id: "hamburguer", nome: "Hambúrguer", grupo: "Lanches" },
  { id: "cachorro-quente", nome: "Cachorro-quente", grupo: "Lanches" },
  { id: "batata-frita", nome: "Batata frita", grupo: "Lanches" },
  { id: "pizza", nome: "Pizza", grupo: "Lanches" },
  { id: "croissant", nome: "Croissant", grupo: "Lanches" },
  { id: "pao", nome: "Pão", grupo: "Lanches" },
  { id: "queijo", nome: "Queijo", grupo: "Lanches" },

  { id: "embalagem", nome: "Embalagem / outros", grupo: "Outros" },
];

const IDS = new Set(GALERIA.map((imagem) => imagem.id));
export const imagemDaGaleriaExiste = (id: string) => IDS.has(id);

/** Endereço da foto do produto: foto enviada vence a imagem da galeria. */
export function enderecoFoto(produto: { imagem: string | null; fotoId: string | null }) {
  if (produto.fotoId) return `/fotos-produtos/${produto.fotoId}`;
  if (produto.imagem) return `/produtos/galeria/${produto.imagem}.svg`;
  return null;
}
