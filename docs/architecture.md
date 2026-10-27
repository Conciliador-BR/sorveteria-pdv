# Código e arquitetura

> Estado em 27/10/2026: o MVP descrito em `PRODUCT.md` está implementado nas funcionalidades de `src/features/` (apresentação, login e permissões, funcionários, produtos, estoque, caixa, vendas e comandas, histórico, dashboard, precificação, configurações e NFC-e simulada), com schema em `src/db/schema/` e migrations em `drizzle/`. A árvore abaixo segue o código; ao mudar a estrutura, atualize-a junto.

## Stack efetiva

Versões efetivas no `pnpm-lock.yaml` e em `docs/setup.md`:

| Camada | Escolha | Motivo |
|---|---|---|
| Aplicação | Next.js 16.4 (Turbopack), React 19.3, TypeScript strict, Tailwind 4, ESLint 9, `src/`, `@/*` | Default do toolkit |
| Runtime e gerenciador | Node.js 24 LTS, pnpm | Default do toolkit (validado pelo toolkit em Node 24); os checks deste bootstrap rodaram em Node 22, ver `docs/setup.md` |
| Banco | PostgreSQL hospedado no Supabase | Pedido do dono; é PostgreSQL, então o default se mantém |
| ORM | Drizzle ORM + driver `pg` | Default do toolkit |
| Autenticação | Supabase Auth via `@supabase/ssr`, só no servidor (instalado na entrega do login) | Produto exige login por funcionário; mesmo provedor do banco |
| Validação | Zod | Default do toolkit |
| Logs | Pino no servidor | Default do toolkit |
| Testes | Vitest (unidade) e Playwright (E2E em `e2e/`) | Default do toolkit; ver `docs/quality.md` |
| Hospedagem | Vercel | Prevista; publicação depende de autorização |

Bibliotecas a avaliar só quando a tela pedir (não instalar no bootstrap): componentes acessíveis para modal/select (ex.: Radix), React Hook Form para o modal de pagamento, Recharts para o dashboard.

## Mapa do código

Plano. Pastas só nascem com o primeiro arquivo real.

```
sorveteria-pdv/
├── README.md, PRODUCT.md, AGENTS.md, CLAUDE.md
├── docs/                         # architecture, design, onboarding, quality, setup
├── .claude/
│   ├── agents/                   # especialistas do projeto
│   └── rules/                    # parallel-subagent-driven-development.md
├── .claude/skills/ + skills-lock.json   # skills Vercel locais (instaladas)
├── drizzle/                      # SQL gerado e revisado
├── public/                       # ícones do app instalável (icone-192, icone-512, icone-maskable-512)
├── src/
│   ├── app/
│   │   ├── page.tsx              # apresentação (pública)
│   │   ├── entrar/page.tsx       # login
│   │   ├── manifest.ts, apple-icon.png  # app instalável (PWA): nome, cores, ícones; abre em /entrar
│   │   ├── (pdv)/                # modo caixa: tela cheia sem menu, só com o caixa do próprio funcionário aberto
│   │   │   ├── layout.tsx            # PdvShell: barra com loja, caixa, abas Vender/Caixa e "Sair (Esc)"
│   │   │   ├── vender/page.tsx       # balcão e comandas abertas na mesma tela
│   │   │   ├── vender/caixa/page.tsx # resumo, sangria, suprimento e fechamento do caixa aberto
│   │   │   └── comandas/[id]/page.tsx
│   │   └── (sistema)/            # área logada com menu; layout confere sessão e prende no PDV o funcionário com caixa aberto
│   │       ├── layout.tsx
│   │       ├── caixa/page.tsx (abrir caixa; com caixa aberto leva a /vender/caixa), caixa/fechamento/[id]/page.tsx
│   │       ├── comandas/page.tsx (leva a /vender)
│   │       ├── produtos/page.tsx
│   │       ├── estoque/page.tsx
│   │       ├── vendas/page.tsx, vendas/[id]/page.tsx, vendas/csv/route.ts
│   │       ├── dashboard/page.tsx
│   │       ├── precificacao/page.tsx   # abas por ?aba= (precos, insumos, custos, taxas)
│   │       ├── funcionarios/page.tsx
│   │       └── configuracoes/page.tsx
│   ├── features/                 # um módulo por funcionalidade
│   │   ├── auth/                 # sessão, permissões, login/logout
│   │   ├── funcionarios/
│   │   ├── produtos/
│   │   ├── estoque/
│   │   ├── caixa/
│   │   ├── vendas/               # venda no balcão, comanda, itens e pagamento (carrinho em useCarrinho.ts)
│   │   ├── historico/            # filtros, lista, detalhe e CSV das vendas
│   │   ├── dashboard/
│   │   ├── precificacao/         # insumos, ficha técnica, custos fixos, máquinas, parâmetros e preço sugerido (exclusivo do dono)
│   │   ├── configuracoes/        # nome da loja, dados fiscais e bandeiras de cartão (exclusivo do dono)
│   │   └── fiscal/               # NFC-e simulada, recibo e DANFE de 80 mm (/comprovante/[id])
│   ├── components/
│   │   ├── ui/                   # Button, Campo, CampoDinheiro, Selecao, CaixaSelecao, Card, Badge, Aviso, RetornoFormulario
│   │   └── layout/               # AppShell, PdvShell, AbasPdv, ListaMenu, MenuCelular, Marca, PageHeader
│   ├── proxy.ts                  # chama a renovação de sessão (substitui o middleware no Next 16)
│   ├── db/
│   │   ├── index.ts              # getDb(): pool lazy (template do toolkit)
│   │   └── schema/               # um arquivo por grupo de tabelas
│   └── lib/
│       ├── env.ts, env-schema.ts # ambiente validado (template do toolkit)
│       ├── logger.ts             # Pino (template do toolkit)
│       ├── utils.ts              # cn() (template do toolkit)
│       ├── dinheiro.ts           # centavos ⇄ R$, troco, arredondamento
│       └── supabase/             # server.ts (cliente Auth do servidor), proxy.ts (renova a sessão), cookies.ts (opções do cookie)
├── eslint-rules/, eslint.config.mjs, eslint.typed.config.mjs, scripts/verify-quality-rules.mjs
├── drizzle.config.ts, vitest.config.mts
├── .env.example                  # nomes e defaults não sensíveis
└── .graphifyignore
```

**Dentro de cada funcionalidade** (`src/features/caixa/` como exemplo):

```
caixa/
├── components/                   # AbrirCaixaForm, ResumoCaixaCards, FecharCaixaForm, SangriaSuprimentoModal
├── actions.ts                    # Server Actions: abrirCaixa, fecharCaixa, registrarMovimento
├── queries.ts                    # leituras com projeção explícita (server-only)
├── regras.ts                     # cálculo puro do dinheiro esperado e diferença
├── regras.test.ts
└── schemas.ts                    # Zod das entradas
```

Componentização: cada peça visual é um componente em seu arquivo; páginas só montam componentes. Componentes `ui/` não conhecem regra de negócio nem banco. Componentes nascem com a tela que os usa (sem biblioteca antecipada), e o teto de 350 linhas do lint força a quebra de arquivos grandes.

## Fronteiras e fluxo

```
Navegador (Client Components: teclado, carrinho em memória, modal)
   │  chama Server Action / envia formulário
   ▼
src/features/*/actions.ts  ── confere sessão (Supabase Auth) e permissão (tabela funcionarios)
   │                        ── valida entrada com Zod
   ▼
src/features/*/regras.ts   ── cálculo puro (troco, esperado, peso)
   ▼
src/db (Drizzle, server-only) ── transação no PostgreSQL do Supabase
```

- O navegador não recebe nenhuma chave nem fala com o Supabase diretamente. Login e logout também são Server Actions.
- `src/db`, `src/lib/env.ts` e `src/lib/logger.ts` importam `server-only` (e `src/lib/supabase/server.ts`). Um módulo de cliente que puxe o banco quebra o build por causa do `server-only`.
- A regra de fronteira do lint bloqueia `db`, `getDb` e `closeDatabase` importados de `@/db` em qualquer `.tsx` e em `.ts` dentro de `src/app/` e `src/components/`. Não cobre imports relativos (`../db`), re-exports nem `import()` dinâmico; a revisão confere esses casos.
- Esconder botões na interface é conforto; a autorização real está em cada Server Action.

## Segurança

1. **Segredos só no servidor:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (usada pelo Auth do servidor) e `SUPABASE_SERVICE_ROLE_KEY` (só para criar/editar logins de funcionário). Nenhuma com prefixo `NEXT_PUBLIC_`. Valores em `.env.local` (ignorado) e nas variáveis do host; nunca no Git ou no chat.
2. **Data API bloqueada:** RLS ligado em todas as tabelas do schema `public`, sem políticas para `anon` e `authenticated`. Mesmo que alguém descubra a URL do projeto, não lê nem grava nada pela API REST. O acesso legítimo é o Drizzle no servidor.
3. **Autorização por ação:** helper `exigirPermissao('pode_lancar_estoque')` (e `exigirDono()`) chamado no início de cada Server Action sensível; funcionário inativo é recusado.
4. **Senha de novo no caixa:** abertura e fechamento reautenticam a senha do próprio funcionário no Supabase Auth antes de agir.
5. **Criar funcionário:** Server Actions exclusivas do dono (`src/features/funcionarios/actions.ts`) usam a chave secreta (`SUPABASE_SERVICE_ROLE_KEY`, cliente em `src/lib/supabase/admin.ts`) para criar o login no Auth com `usuarioParaEmail`, trocar senha e desativar. Se gravar o perfil falhar, o login criado é apagado. O dono não pode tirar o próprio papel nem se desativar, e a loja nunca fica sem um dono ativo. Trocar a senha apaga as sessões do funcionário em `auth.sessions` (o token já emitido vale até expirar, no máximo 1 hora); desativar bloqueia na hora. Todos os donos têm poder igual, inclusive de trocar a senha um do outro. Toda criação, edição e troca de senha vai para `auditoria`. Nas configurações (`src/features/configuracoes/actions.ts`, só `exigirDono()`), salvar o nome da loja e criar ou editar bandeira também gravam `auditoria` (antes e depois).
6. **Logs:** Pino com redação de `password`/`senha`, tokens, cookies, `DATABASE_URL*` e chaves `SUPABASE_*` (primeiro nível e um nível abaixo). Logue só campos escolhidos, nunca objetos de erro ou configuração inteiros.
7. **Ambientes:** Supabase de desenvolvimento (agentes podem migrar) e de produção (só migrations revisadas e autorizadas pelo dono).
8. **Revisão:** o especialista `seguranca` revisa todo PR (chaves no diff, Server Action sem checagem, RLS faltando, dados sensíveis em log).

## Login e sessão

- O funcionário digita usuário e senha; o servidor troca o usuário pelo e-mail técnico `usuario@sorveteria.local` (`src/features/auth/usuario.ts`) e chama `signInWithPassword` numa Server Action. Erros respondem sempre "Usuário ou senha incorretos.", sem revelar se o usuário existe.
- Sessão em cookies do `@supabase/ssr`. `src/proxy.ts` renova o token a cada navegação de quem tem cookie de sessão (visitante sem cookie passa direto, então a home abre mesmo sem as variáveis do Supabase); páginas e ações confirmam a identidade com `getClaims()` (assinatura verificada) e buscam papel, permissões e `ativo` na tabela `funcionarios` (`src/features/auth/sessao.ts`).
- Login válido sem linha em `funcionarios` ou com `ativo = false` é desfeito na hora. Falha do banco nesse momento também desfaz o login, com aviso "Não foi possível entrar agora". "Sair" encerra só a sessão daquele aparelho (`scope: "local"`); se o Supabase não responder, os cookies `sb-*` são apagados à mão.
- `funcionarios.usuario` tem CHECK com a mesma regra do login (minúsculas, 3 a 32 de `a-z0-9._-`), e o login no Auth deve ser criado com `usuarioParaEmail`. A FK para `auth.users` é `restrict`: quem tem login não é apagado pelo painel, é desativado.
- Cookie de sessão `httpOnly`, `sameSite=lax` e `secure` em produção (`src/lib/supabase/cookies.ts`): o JavaScript da página não lê o token.
- Riscos aceitos: o limite de tentativas do Supabase Auth conta por IP, e todas as tentativas saem do mesmo servidor, então um ataque de senha pode bloquear o login da loja inteira por alguns minutos (limite próprio por usuário fica para depois); e a resposta de senha certa de funcionário desativado demora um pouco mais que a de senha errada.
- `exigirFuncionario()`, `exigirPermissao()` e `exigirDono()` redirecionam: sem sessão vai para `/entrar`; sem permissão, para `/caixa`. O layout de `src/app/(sistema)/` protege as telas, e cada página e Server Action repete a checagem que lhe cabe (`getFuncionarioAtual` usa `cache` do React, então na renderização a repetição não consulta o banco duas vezes; em Server Action não há cache). Os `exigir*` vão na primeira linha, fora de `try/catch`: o redirect é uma exceção e um `catch` o engoliria.
- **Modo caixa:** abrir o caixa leva a `/vender`, no grupo `src/app/(pdv)/`, que exige caixa aberto (sem caixa, volta para `/caixa`). O layout de `(sistema)` redireciona para `/vender` o funcionário (não dono) com caixa aberto, pela regra pura `ficaNaTelaDeVendas` (`src/features/auth/permissoes.ts`, testada); assim, digitar outro endereço não tira ninguém da venda. Fechar o caixa leva ao fechamento, já no `(sistema)`. Esc abre o aviso `SairDoPdv` (`<dialog>`): o dono pode "Sair sem fechar o caixa" (vai ao dashboard); o funcionário só tem "Fechar o caixa". Limite conhecido: o layout não roda de novo nas navegações internas do mesmo grupo (Next), então quem já está no `(sistema)` quando o caixa é aberto em outra aba, ou reaberto pelo dono, só é levado à venda na próxima entrada no grupo ou recarga. A trava é de tela: as Server Actions continuam valendo pelas permissões de cada uma.

## Dados e migrations

Plano de schema (Drizzle, em `src/db/schema/`). Tipos inferidos com `$inferSelect`/`$inferInsert`.

| Tabela | Campos principais |
|---|---|
| `funcionarios` | `id` (= `auth.users.id`), `nome`, `usuario` (único), `papel` (`funcionario`/`dono`), `pode_lancar_estoque`, `pode_gerenciar_produtos`, `pode_cancelar_venda`, `pode_ver_historico`, `ativo`, `criado_em` |
| `categorias` | `id`, `nome`, `ordem`, `ativo` |
| `produtos` | `id`, `nome`, `categoria_id`, `tipo_venda` (`unidade`/`peso`), `preco_centavos` (por unidade ou kg), `codigo`, `estoque_minimo`, `baixa_automatica`, `ativo`, `imagem` (id da galeria padrão em `public/produtos/galeria/`) ou `foto_id` (foto enviada); nunca os dois (CHECK) |
| `produto_fotos` | `id`, `tipo` (`image/webp`/`jpeg`/`png`, conferido pelos primeiros bytes), `conteudo` (`bytea`, até 300 KB), `criado_em`. Entregue por `GET /fotos-produtos/[id]` só para quem está logado; trocar ou remover a foto apaga a antiga e cria `id` novo (cache longo sem imagem velha) |
| `estoque_movimentos` | `id`, `produto_id`, `tipo` (`entrada`/`saida`/`ajuste`/`venda`/`cancelamento`), `quantidade` (numeric, sinal indica direção), `motivo`, `observacao`, `venda_id`, `funcionario_id`, `criado_em` |
| `caixas` | `id`, `funcionario_id`, `status`, `aberto_em`, `fechado_em`, `fundo_centavos`, `esperado_centavos`, `contado_centavos`, `diferenca_centavos`, `observacao`, `sem_fundo`; índice único parcial: um `aberto` por funcionário |
| `caixa_movimentos` | `id`, `caixa_id`, `tipo` (`sangria`/`suprimento`), `valor_centavos`, `motivo`, `funcionario_id`, `criado_em` |
| `vendas` | `id`, `numero` (sequencial), `caixa_id`, `funcionario_id`, `tipo` (`balcao`/`comanda`), `identificacao`, `status` (`aberta`/`concluida`/`cancelada`), `total_centavos`, `troco_centavos`, `aberta_em`, `concluida_em`, `cancelada_por`, `cancelada_em`, `motivo_cancelamento` |
| `venda_itens` | `id`, `venda_id`, `produto_id`, `nome_produto` (cópia), `tipo_venda`, `quantidade`, `peso_gramas`, `peso_pelo_valor` (as gramas foram estimadas pelo valor da balança; só em `tipo_venda = 'peso'`), `preco_unitario_centavos` (cópia), `total_centavos`, `lancado_por`, `criado_em` |
| `comanda_lancamentos` | `id` (gerado na tela, um por envio de "Lançar na comanda"; envio repetido esbarra na chave e não lança de novo), `venda_id`, `lancado_por`, `criado_em` |
| `pagamentos` | `id`, `venda_id`, `forma` (`dinheiro`/`pix`/`debito`/`credito`), `bandeira_id`, `valor_centavos`, `valor_recebido_centavos`, `criado_em` |
| `bandeiras` | `id`, `nome`, `tipo` (`debito`/`credito`), `ativo`, `ordem`; únicas por nome (sem diferenciar maiúsculas) e tipo. O dono cadastra, renomeia e desativa em `/configuracoes`; não se apagam, porque pagamentos apontam para elas. Desativada some dos cards de pagamento (e o servidor a recusa), mas continua no histórico e no filtro |
| `configuracoes` | Linha única (`id` = 1, garantido por CHECK, semeada pela migration): `nome_loja` (1 a 60 caracteres ou vazio), `emitir_nfce` e dados do emitente (`razao_social`, `cnpj` numérico ou alfanumérico sem máscara, `inscricao_estadual`, `endereco`, `uf`; CHECK exige todos com a emissão ligada), `atualizado_em`. Sem nome, o menu mostra "Sorveteria PDV"; as telas públicas sempre mostram esse nome |
| `notas_fiscais` | Uma NFC-e por venda (`venda_id` único): `ambiente` (hoje só `homologacao`), `serie`, `numero`, `chave_acesso` (44 caracteres, única), `protocolo` (vazio na simulação; obrigatório em produção por CHECK), `emitente` (cópia em JSON), `emitida_em`, `emitida_por`. Emitida em `src/features/fiscal/emissao.ts` logo depois da transação da venda; falha só gera log e o comprovante oferece emitir de novo |
| `insumos` | `id`, `nome` (único sem diferenciar maiúsculas), `unidade` (`g`/`ml`/`un`), `embalagem_quantidade`, `embalagem_preco_centavos`, `atualizado_em`. Não se exclui insumo que está numa ficha (FK `restrict`) |
| `ficha_tecnica_itens` | `id`, `produto_id` (cascade), `insumo_id`, `quantidade` (na unidade do insumo); único por produto e insumo |
| `precificacao_produtos` | `produto_id` (PK, cascade), `rendimento` (unidades, ou gramas no produto por peso), `margem_percentual` (vazio = padrão). Sem linha: rende 1 unidade ou 1 kg |
| `custos_fixos` | `id`, `nome`, `valor_mensal_centavos` |
| `maquinas` | `id`, `nome`, `valor_compra_centavos`, `valor_residual_centavos`, `vida_util_meses` |
| `precificacao_parametros` | Linha única (`id` = 1, semeada): `faturamento_mensal_centavos`, `imposto_percentual`, `taxa_cartao_percentual`, `parte_cartao_percentual`, `perdas_percentual`, `margem_padrao_percentual`. Percentuais em centésimos de ponto (3000 = 30%). Imposto: `regime_imposto` (`percentual`/`simples`/`mei`), `anexo_simples` (`I`/`II`), `receita_12_meses_centavos`, `das_mensal_centavos`; tabelas do Simples em `src/features/precificacao/imposto.ts` |
| `auditoria` | `id`, `tabela`, `registro_id`, `acao`, `dados` (jsonb), `funcionario_id`, `criado_em` |

Precificação: cálculo puro em `src/features/precificacao/regras.ts`, usado pela tela (simulador ao vivo) e pelo servidor. O custo do produto não é copiado para `produtos`; `custoUnitarioDosProdutos()` (`queries.ts`) devolve o custo por unidade ou kg de quem tem ficha, para outras telas (ex.: valor do estoque) usarem `custo ?? preço`. Todas as Server Actions chamam `exigirDono()`; só "usar este preço" mexe em `produtos.preco_centavos`, numa transação com trava do produto e linha em `auditoria` (`origem: precificacao`). Os cadastros da precificação são planejamento e não vão para a auditoria.

Saldo de estoque: soma de `estoque_movimentos` por produto (consulta agregada). `quantidade` é inteiro: unidades ou gramas, conforme o `tipo_venda` do produto; por isso o tipo não muda depois que o produto tem venda ou estoque.

Operações em transação (`db.transaction`): abrir caixa, fechar caixa, sangria/suprimento, abrir comanda, lançar e remover item, finalizar venda (conferir soma = total, calcular troco, gerar baixa de estoque), cancelar venda (devolver estoque) e lançar estoque. Erros do Postgres chegam embrulhados em `DrizzleQueryError`; o código fica em `cause.code` (`src/db/erros.ts`).

## Venda, caixa e concorrência

- **Preço e total vêm do banco.** A tela manda só produto, quantidade ou gramas e as partes do pagamento; o servidor busca preço e nome no cadastro, recalcula o total e confere a soma. Se o total mudou desde que a tela abriu, a resposta diz o novo valor. Exceção: produto por peso informado pelo valor da balança vale o valor digitado (até R$ 100.000,00); as gramas são estimadas por `gramasPorValor` e o servidor recusa produto sem preço do kg ou mais de 100 kg (`calcularItem` em `src/features/vendas/regras.ts`).
- **Travas (`for update`) sempre na mesma ordem: caixa, depois venda.** Venda, cobrança de comanda, abertura de comanda, sangria e suprimento travam o caixa aberto, então nada entra num caixa que está fechando. O cancelamento lê o caixa da venda, trava esse caixa e só depois a venda, para não se cruzar com uma cobrança.
- **Venda repetida:** a tela do balcão gera o `id` da venda (UUID v4 com `getRandomValues`, porque `crypto.randomUUID` não existe fora de HTTPS e o tablet pode abrir o sistema pela rede local). Um segundo envio esbarra na chave primária e recebe a venda já gravada.
- **Comanda cobrada por outro funcionário** passa para o caixa de quem cobrou: o dinheiro está na gaveta dele.
- **Baixa de estoque** trava os produtos em ordem de id, para não correr junto com um ajuste de contagem.
- **Limite por venda:** R$ 100.000,00 por item, venda ou comanda (o mesmo dos pagamentos), abaixo do teto do `integer`.
- **Histórico:** quem tem `pode_ver_historico` (ou é dono) vê todas as vendas; os demais veem só as próprias, na lista, no detalhe e no CSV (filtro forçado no servidor). O CSV protege texto livre contra fórmula de planilha.
- **Riscos aceitos:** `estoque_movimentos.venda_id` não tem chave estrangeira (os schemas de estoque e de venda se importariam em ciclo; só o servidor grava nessa coluna). Sangria não confere se há dinheiro suficiente na gaveta: o esperado pode ficar negativo e aparece na conferência. Venda de caixa fechado só se cancela depois que o dono reabre aquele caixa (pelo detalhe da venda), e a reabertura é recusada se o funcionário já tem outro caixa aberto: ele fecha o atual antes.

Ciclo das migrations: alterar schema (cada `pgTable` com `.enableRLS()`) → `pnpm db:generate` → revisar o SQL em `drizzle/` (incluindo `ENABLE ROW LEVEL SECURITY` de cada tabela nova) → `pnpm db:migrate` no Supabase de desenvolvimento → testar → PR. Sem `DATABASE_URL_UNPOOLED` na sessão, o agente aplica o mesmo SQL pelo conector Supabase (`apply_migration`) e grava a linha correspondente em `drizzle.__drizzle_migrations` (hash SHA-256 do arquivo `.sql` e o `when` do `_journal.json`), para o `pnpm db:migrate` não reaplicar. Produção só com autorização do dono. Nada de `db:push`.

Conexão: `DATABASE_URL` aponta para o pooler do Supabase (modo transação) e `DATABASE_URL_UNPOOLED` para a conexão direta ou de sessão, usada pelas migrations. Pool pequeno e lazy, conforme o template do toolkit e a orientação de pooling da Vercel.

## Decisões

| Decisão | Motivo | Alternativa | Fonte/data | Revisar quando |
|---|---|---|---|---|
| Next.js em vez de Vite | Default do toolkit; Server Actions deixam banco e chaves fora do navegador | React + Vite com Supabase direto no cliente (versão 0.1 desta especificação) | Toolkit, revisão `f13bb35`, 16/10/2026 | Nunca, salvo pedido do dono |
| Drizzle no servidor + Data API bloqueada | Atende "nenhuma API exposta no front-end" e o default Drizzle | supabase-js com RLS por política no cliente | Toolkit `docs/06-project-defaults.md` | Se precisar de tempo real no navegador |
| Supabase Auth | Login por funcionário no mesmo provedor do banco | Auth próprio ou outro provedor | Pedido do dono | Se o Supabase for trocado |
| Lógica de negócio em TypeScript com transação Drizzle | Testável com Vitest; um lugar só para as regras | Funções SQL (RPC) no banco | Toolkit (Drizzle, transações) | Se surgir concorrência que exija lock no banco |
| Fotos enviadas no Postgres (`bytea`), reduzidas no navegador para 480×480 | Poucas dezenas de KB por produto; sem bucket, chave ou política nova; a mesma transação salva produto e foto | Supabase Storage (bucket privado + chave secreta no servidor) | Pedido do dono, 24/10/2026 | Se as fotos passarem de alguns MB no total ou precisarem de CDN |
| Galeria padrão como SVG no repositório | Versionada, sem banco e sem marca registrada: ilustrações próprias + Fluent UI Emoji (MIT, licença em `public/produtos/galeria/`) | Fotos de banco de imagens | Pedido do dono, 24/10/2026 | — |
| NFC-e simulada, sem emissor contratado | Entregar a tela e o fluxo sem credenciais; nada sai com valor fiscal | Integrar já com Focus NFe, PlugNotas ou NFE.io | Pedido do dono, 24/10/2026 | Quando o dono tiver certificado A1, CSC e conta no emissor |
| Centavos inteiros | Evitar erro de ponto flutuante | `numeric` com decimais no app | Toolkit, "valores monetários" | — |

## Manutenção

Atualize este mapa ao alterar diretórios, dependências relevantes, contratos ou fronteiras. Registre comportamento comprovado; remova decisões que deixaram de valer.
