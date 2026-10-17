# Design e acessibilidade

> Estado em 17/10/2026: **tokens e componentes base implementados**. Fonte de verdade dos valores: `src/app/globals.css` (bloco `@theme` do Tailwind) e os componentes em `src/components/ui/` e `src/components/layout/`. Este documento guarda a direção e as regras; quando um valor mudar, mude no código e só ajuste aqui a regra, sem copiar valores.

## Direção

- Público: funcionários no balcão (tablet ou computador, fila, mãos geladas ou molhadas) e o dono (celular e computador).
- Idioma: português do Brasil.
- Tom: "sorveteria de praia". Leve, alegre e colorido nos destaques, mas limpo e profissional. Fundo claro, cantos arredondados, botões grandes.
- Prioridade no balcão: o total da venda e o troco sempre grandes e legíveis; ações principais ("Cobrar", "Confirmar pagamento") com o maior destaque da tela.

## Sistema existente

**Tokens** em `src/app/globals.css`. A paleta padrão do Tailwind está desligada (`--color-*: initial`), então só existem as cores do projeto; o modo escuro automático do scaffold foi removido.

| Token (classe `bg-*`, `text-*`, `border-*`) | Papel |
|---|---|
| `primaria`, `primaria-escura`, `primaria-suave` | Azul-mar: botão principal, menu ativo, links; escura para hover, títulos e foco; suave para fundos de hover e avisos informativos |
| `secundaria`, `secundaria-escura`, `secundaria-suave` | Morango: botão "Cobrar" e destaques |
| `acento`, `acento-suave` | Manga: comandas abertas, avisos leves; sempre com texto `texto` por cima |
| `sucesso`, `sucesso-escuro`, `sucesso-suave` | Menta: preenchimento com texto `texto`; texto verde usa `sucesso-escuro` |
| `perigo`, `perigo-escuro`, `perigo-suave` | Framboesa: erros, falta no caixa, cancelar |
| `fundo`, `superficie`, `borda`, `borda-forte`, `texto`, `texto-suave` | Baunilha, branco, areia (divisórias), contorno de campo (3:1), chocolate e cacau |

- Escala de texto: `text-xs` 12, `text-sm` 14, `text-base` 16, `text-xl` 20, `text-2xl` 24, `text-3xl` 32 e `text-total` 48 (total da venda e troco). As demais classes de tamanho do Tailwind foram desligadas.
- Raios: `rounded-campo` (inputs), `rounded-botao`, `rounded-card`, `rounded-modal`. Sombra: `shadow-suave`.
- Fontes (via `next/font/google` em `src/app/layout.tsx`): `font-sans` = Inter (padrão do corpo; use `tabular-nums` em valores) e `font-titulo` = Poppins 600/700 (aplicada em `h1`–`h3`).
- Foco: contorno global de 3 px em `primaria-escura` com afastamento de 2 px em `:focus-visible`. Movimento: transições de 150 ms, zeradas por `prefers-reduced-motion`.
- Gradiente da apresentação: `bg-linear-135 from-primaria via-sucesso to-acento`. Nenhum texto fica direto sobre o gradiente (menta e manga não dão contraste com branco nem com chocolate em todo o trecho); o conteúdo vai num cartão branco.

**Componentes** (um por arquivo, sem regra de negócio):

- `src/components/ui/`: `Button` (variantes `primario`, `cobrar`, `secundario`, `perigo`, `fantasma`; tamanhos `md` 48 px e `lg` 64 px; `carregando` desabilita e troca o texto por `textoCarregando`; `estiloBotao()` estiliza um `Link`), `Campo` (rótulo, dica e erro ligados por `aria-describedby`/`aria-invalid`), `Card`, `Badge`, `Aviso` (erro com `role="alert"`, sucesso e info com `role="status"`).
- `src/components/layout/`: `AppShell` (link "Pular para o conteúdo", menu lateral a partir de 1024 px, gaveta em `<dialog>` abaixo disso, barra superior com nome, papel e "Sair"), `ListaMenu`, `MenuCelular`, `Marca` e `PageHeader`. Os itens do menu vêm de `itensDoMenu` em `src/features/auth/menu.ts` (testado), conforme papel e permissões.

### Contrastes conferidos

Calculados pela fórmula de luminância relativa da WCAG 2.x em 17/10/2026. Mínimo AA: 4,5:1 para texto, 3:1 para contorno de componente e ícone.

| Par (texto/elemento sobre fundo) | Razão | Uso |
|---|---|---|
| branco sobre `primaria` | 4,80 | Botão primário, menu ativo |
| branco sobre `primaria-escura` | 7,73 | Hover do primário |
| branco sobre `secundaria` | 4,75 | Botão "Cobrar" |
| branco sobre `secundaria-escura` | 6,75 | Hover do "Cobrar" |
| branco sobre `perigo` / `perigo-escuro` | 5,35 / 6,84 | Botão de perigo e hover |
| `texto` sobre `fundo` / `superficie` | 14,85 / 15,53 | Texto principal |
| `texto-suave` sobre `fundo` / `superficie` | 5,69 / 5,95 | Texto secundário |
| `primaria-escura` sobre `superficie` / `fundo` | 7,73 / 7,39 | Títulos, botão secundário, anel de foco |
| `primaria-escura` sobre `primaria-suave` | 6,73 | Hover de menu, aviso informativo, badge |
| `perigo` sobre `perigo-suave` / `superficie` / `fundo` | 4,69 / 5,35 / 5,12 | Aviso de erro, erro do campo |
| `sucesso-escuro` sobre `sucesso-suave` | 5,40 | Aviso de sucesso, badge |
| `secundaria-escura` sobre `secundaria-suave` | 5,77 | Ícone de destaque da apresentação |
| `texto` sobre `acento` / `acento-suave` | 8,84 / 13,94 | Manga sempre com texto escuro |
| `texto` sobre `sucesso` | 7,41 | Menta sempre com texto escuro |
| `texto` sobre `borda` | 12,24 | Badge neutro |
| `borda-forte` sobre `superficie` / `fundo` | 3,93 / 3,76 | Contorno dos campos (não texto) |
| `secundaria` sobre `secundaria-suave` | 4,06 | Ícone da marca (não texto) |

Ajustes feitos em relação à direção original: morango `#F0567A` dava 3,32:1 com branco e virou `secundaria` mais escura; framboesa `#D93A4A` dava 4,32:1 como texto sobre o fundo e foi escurecida; a areia `#EDE3D6` (1,27:1) ficou só para divisórias, e os campos ganharam `borda-forte`. Menta e manga com texto branco não passam (2,10 e 1,76) e por isso usam texto chocolate.

Direção ainda não implementada:

- Modo escuro (área do dono, opcional): fundo `#15191C`, superfície `#1F2529`, texto `#F5EFE8`, primária `#3FB3D4`. Conferir contraste ao implementar.
- Espaçamento em múltiplos de 4 px (escala padrão do Tailwind).
- Ícones: Lucide (`lucide-react`). Logos das bandeiras em SVG local.

## Interação

Use HTML semântico, navegação por teclado, foco visível e contraste adequado. Dê nome a controles e campos. Erros de validação ficam junto do campo; operações assíncronas exibem espera e resultado. Respeite movimento reduzido.

Específico do produto:

- Alvo de toque mínimo de 48 × 48 px; teclas do teclado numérico na tela com 64 px.
- Campo de dinheiro aceita digitação contínua em centavos (digitar `2580` mostra R$ 25,80).
- Botões de confirmação de pagamento ficam desabilitados e mostram "Salvando…" durante o envio, para impedir venda duplicada.
- Formulários com campos não controlados enviam com `useEnvioSemReset` (`src/lib/`; o pagamento e o lançamento na comanda usam estado controlado e não precisam): o React 19 apaga campos não controlados em todo `<form action>`, mesmo quando a action devolve erro; o hook evita isso e leva o foco ao primeiro campo inválido.
- Total, troco e "falta pagar" ficam em regiões `aria-live` sempre montadas, com rótulo e valor juntos (`aria-atomic`).
- Troco aparece em destaque assim que o valor recebido é digitado; valor insuficiente mostra o quanto falta, junto do campo.
- Ações destrutivas (cancelar venda, cancelar comanda, desativar funcionário) pedem confirmação e motivo.
- Animações de 150 a 200 ms, desligadas com `prefers-reduced-motion`.

## Layout e revisão

- Breakpoints: celular (área do dono), tablet a partir de 768 px (balcão: produtos e carrinho lado a lado, carrinho fixo ao rolar; Comandas fica no menu) e desktop a partir de 1280 px (mesmas duas colunas, mais largas).
- Área logada: menu lateral recolhível, barra superior com nome do funcionário, situação do caixa e botão sair. Implementado sem recolher o menu lateral e sem a situação do caixa (entra com o caixa).
- Estados a cobrir em cada tela: vazio (sem produtos, sem vendas, sem comandas), carregando, erro de rede e sem permissão.
- Revisão: rodar a skill `web-design-guidelines` nas telas antes de concluir cada PR de interface. Primeira revisão em 17/10/2026 (apresentação, entrar, área logada e componentes base); segunda em 17/10/2026 (caixa, venda, comandas, produtos, estoque, histórico e dashboard), com os achados corrigidos.

## Manutenção

Mudanças visuais e de interação atualizam a fonte de tokens/componentes e esta orientação quando houver alteração de regra. Consulte as skills de UI instaladas nas revisões pertinentes.
