# Design e acessibilidade

> Estado em 16/10/2026: **direção visual**, ainda sem código. Quando os tokens forem criados em `src/app/globals.css` (bloco `@theme` do Tailwind), aquele arquivo vira a fonte de verdade e a tabela abaixo passa a apontar para ele, sem manter valores duplicados.

## Direção

- Público: funcionários no balcão (tablet ou computador, fila, mãos geladas ou molhadas) e o dono (celular e computador).
- Idioma: português do Brasil.
- Tom: "sorveteria de praia". Leve, alegre e colorido nos destaques, mas limpo e profissional. Fundo claro, cantos arredondados, botões grandes.
- Prioridade no balcão: o total da venda e o troco sempre grandes e legíveis; ações principais ("Cobrar", "Confirmar pagamento") com o maior destaque da tela.

## Sistema existente

Nada implementado. O `src/app/globals.css` e as fontes Geist atuais vieram do scaffold do Next (inclusive um modo escuro automático) e serão substituídos na entrega de tokens. Direção dos tokens:

| Token | Nome | Valor | Uso |
|---|---|---|---|
| `primaria` | Azul-mar | `#0E7C9B` | Botões principais, menu ativo, links |
| `primaria-escura` | Azul profundo | `#0A5A72` | Hover, cabeçalhos |
| `secundaria` | Morango | `#F0567A` | Botão "Cobrar", destaques |
| `acento` | Manga | `#FFB547` | Comandas abertas, avisos leves |
| `sucesso` | Menta | `#3CC8A8` | Caixa aberto, sobra no fechamento |
| `perigo` | Framboesa | `#D93A4A` | Erros, falta no caixa, cancelar |
| `fundo` | Baunilha | `#FFF9F2` | Fundo das telas |
| `superficie` | Branco | `#FFFFFF` | Cards e modais |
| `borda` | Areia | `#EDE3D6` | Linhas e divisórias |
| `texto` | Chocolate | `#2B2220` | Texto principal |
| `texto-suave` | Cacau | `#6E615C` | Texto secundário |

- Gradiente da apresentação: `#0E7C9B` → `#3CC8A8` → `#FFB547` (135°).
- Modo escuro (área do dono, opcional): fundo `#15191C`, superfície `#1F2529`, texto `#F5EFE8`, primária `#3FB3D4`.
- Antes de fixar, conferir contraste: texto branco sobre `secundaria`, `sucesso` e `acento` pode não atingir 4.5:1; nesses casos o texto do botão usa `texto` ou a cor é escurecida.
- Tipografia: Poppins (títulos, 600/700) e Inter (texto e números, com `tabular-nums` para valores alinhados), via `next/font`.
- Escala de texto: 12, 14, 16 (base), 20, 24, 32, 48 (total da venda).
- Espaçamento em múltiplos de 4 px. Raios: 8 px (inputs), 12 px (botões), 16 px (cards), 24 px (modais). Sombras suaves.
- Ícones: Lucide. Logos das bandeiras em SVG local.

Variações do botão: `primario`, `cobrar` (morango, grande), `secundario` (contorno), `perigo`, `fantasma`. Tamanhos `md` (48 px de altura) e `lg` (64 px, balcão). Estados: normal, hover, pressionado, desabilitado, carregando.

## Interação

Use HTML semântico, navegação por teclado, foco visível e contraste adequado. Dê nome a controles e campos. Erros de validação ficam junto do campo; operações assíncronas exibem espera e resultado. Respeite movimento reduzido.

Específico do produto:

- Alvo de toque mínimo de 48 × 48 px; teclas do teclado numérico na tela com 64 px.
- Campo de dinheiro aceita digitação contínua em centavos (digitar `2580` mostra R$ 25,80).
- Botões de confirmação de pagamento ficam desabilitados e mostram "Salvando…" durante o envio, para impedir venda duplicada.
- Troco aparece em destaque assim que o valor recebido é digitado; valor insuficiente mostra o quanto falta, junto do campo.
- Ações destrutivas (cancelar venda, cancelar comanda, desativar funcionário) pedem confirmação e motivo.
- Animações de 150 a 200 ms, desligadas com `prefers-reduced-motion`.

## Layout e revisão

- Breakpoints: celular (área do dono), tablet a partir de 768 px (balcão, PDV em abas: Produtos / Venda / Comandas) e desktop a partir de 1280 px (PDV em três colunas).
- Área logada: menu lateral recolhível, barra superior com nome do funcionário, situação do caixa e botão sair.
- Estados a cobrir em cada tela: vazio (sem produtos, sem vendas, sem comandas), carregando, erro de rede e sem permissão.
- Revisão: rodar a skill `web-design-guidelines` nas telas antes de concluir cada PR de interface. Nenhuma revisão feita ainda.

## Manutenção

Mudanças visuais e de interação atualizam a fonte de tokens/componentes e esta orientação quando houver alteração de regra. Consulte as skills de UI instaladas nas revisões pertinentes.
