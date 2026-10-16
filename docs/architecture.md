# Código e arquitetura

> Estado em 16/10/2026: **base do bootstrap implementada** (Next, núcleo do servidor, lint, testes e skills; ver `docs/setup.md`). Funcionalidades, schema e telas ainda são **plano**. Ao implementar, substitua cada seção pelo que realmente existir.
>
> Existe hoje: `src/app/` (layout e página provisória), `src/db/index.ts` (pool lazy) e `src/db/schema/index.ts` (vazio), `src/lib/` (`env`, `env-schema`, `logger`, `utils` e testes), `eslint-rules/`, `scripts/verify-quality-rules.mjs`, `drizzle.config.ts`, `vitest.config.mts`, `.claude/` (agentes, regra de ondas e skills).

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
| Testes | Vitest; Playwright entra com os fluxos de caixa e venda | Default do toolkit; E2E quando o fluxo existir |
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
├── src/
│   ├── app/
│   │   ├── page.tsx              # apresentação (pública)
│   │   ├── entrar/page.tsx       # login
│   │   └── (sistema)/            # área logada; layout confere sessão
│   │       ├── layout.tsx
│   │       ├── caixa/page.tsx
│   │       ├── vender/page.tsx
│   │       ├── comandas/[id]/page.tsx
│   │       ├── estoque/page.tsx
│   │       ├── vendas/page.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── funcionarios/page.tsx
│   │       └── configuracoes/page.tsx
│   ├── features/                 # um módulo por funcionalidade
│   │   ├── auth/                 # sessão, permissões, login/logout
│   │   ├── funcionarios/
│   │   ├── produtos/
│   │   ├── estoque/
│   │   ├── caixa/
│   │   ├── vendas/               # venda, comanda, itens
│   │   ├── pagamento/
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/                   # Button, MoneyInput, WeightInput, Keypad, Modal, Card, Badge, Table...
│   │   └── layout/               # AppShell, Sidebar, Topbar, PageHeader
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
├── eslint-rules/, eslint.config.mjs, scripts/verify-quality-rules.mjs
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
5. **Criar funcionário:** Server Action exclusiva do dono usa a `service_role` para criar o usuário no Auth (e-mail técnico `usuario@sorveteria.local`, cadastro público desligado).
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

## Dados e migrations

Plano de schema (Drizzle, em `src/db/schema/`). Tipos inferidos com `$inferSelect`/`$inferInsert`.

| Tabela | Campos principais |
|---|---|
| `funcionarios` | `id` (= `auth.users.id`), `nome`, `usuario` (único), `papel` (`funcionario`/`dono`), `pode_lancar_estoque`, `pode_gerenciar_produtos`, `pode_cancelar_venda`, `pode_ver_historico`, `ativo`, `criado_em` |
| `categorias` | `id`, `nome`, `ordem`, `ativo` |
| `produtos` | `id`, `nome`, `categoria_id`, `tipo_venda` (`unidade`/`peso`), `preco_centavos` (por unidade ou kg), `codigo`, `estoque_minimo`, `baixa_automatica`, `ativo` |
| `estoque_movimentos` | `id`, `produto_id`, `tipo` (`entrada`/`saida`/`ajuste`/`venda`/`cancelamento`), `quantidade` (numeric, sinal indica direção), `motivo`, `observacao`, `venda_id`, `funcionario_id`, `criado_em` |
| `caixas` | `id`, `funcionario_id`, `status`, `aberto_em`, `fechado_em`, `fundo_centavos`, `esperado_centavos`, `contado_centavos`, `diferenca_centavos`, `observacao`, `sem_fundo`; índice único parcial: um `aberto` por funcionário |
| `caixa_movimentos` | `id`, `caixa_id`, `tipo` (`sangria`/`suprimento`), `valor_centavos`, `motivo`, `funcionario_id`, `criado_em` |
| `vendas` | `id`, `numero` (sequencial), `caixa_id`, `funcionario_id`, `tipo` (`balcao`/`comanda`), `identificacao`, `status` (`aberta`/`concluida`/`cancelada`), `total_centavos`, `troco_centavos`, `aberta_em`, `concluida_em`, `cancelada_por`, `cancelada_em`, `motivo_cancelamento` |
| `venda_itens` | `id`, `venda_id`, `produto_id`, `nome_produto` (cópia), `tipo_venda`, `quantidade`, `peso_gramas`, `preco_unitario_centavos` (cópia), `total_centavos`, `lancado_por`, `criado_em` |
| `pagamentos` | `id`, `venda_id`, `forma` (`dinheiro`/`pix`/`debito`/`credito`), `bandeira_id`, `valor_centavos`, `valor_recebido_centavos`, `criado_em` |
| `bandeiras` | `id`, `nome`, `tipo` (`debito`/`credito`), `ativo`, `ordem` |
| `configuracoes` | `nome_loja` |
| `auditoria` | `id`, `tabela`, `registro_id`, `acao`, `dados_antes`, `dados_depois`, `funcionario_id`, `criado_em` |

Saldo de estoque: soma de `estoque_movimentos` por produto (view ou consulta agregada).

Operações em transação (`db.transaction`): abrir caixa, fechar caixa, adicionar item, finalizar venda (conferir soma = total, calcular troco, gerar baixa de estoque), cancelar venda (devolver estoque) e lançar estoque.

Ciclo das migrations: alterar schema (cada `pgTable` com `.enableRLS()`) → `pnpm db:generate` → revisar o SQL em `drizzle/` (incluindo `ENABLE ROW LEVEL SECURITY` de cada tabela nova) → `pnpm db:migrate` no Supabase de desenvolvimento → testar → PR. Sem `DATABASE_URL_UNPOOLED` na sessão, o agente aplica o mesmo SQL pelo conector Supabase (`apply_migration`) e grava a linha correspondente em `drizzle.__drizzle_migrations` (hash SHA-256 do arquivo `.sql` e o `when` do `_journal.json`), para o `pnpm db:migrate` não reaplicar. Produção só com autorização do dono. Nada de `db:push`.

Conexão: `DATABASE_URL` aponta para o pooler do Supabase (modo transação) e `DATABASE_URL_UNPOOLED` para a conexão direta ou de sessão, usada pelas migrations. Pool pequeno e lazy, conforme o template do toolkit e a orientação de pooling da Vercel.

## Decisões

| Decisão | Motivo | Alternativa | Fonte/data | Revisar quando |
|---|---|---|---|---|
| Next.js em vez de Vite | Default do toolkit; Server Actions deixam banco e chaves fora do navegador | React + Vite com Supabase direto no cliente (versão 0.1 desta especificação) | Toolkit, revisão `f13bb35`, 16/10/2026 | Nunca, salvo pedido do dono |
| Drizzle no servidor + Data API bloqueada | Atende "nenhuma API exposta no front-end" e o default Drizzle | supabase-js com RLS por política no cliente | Toolkit `docs/06-project-defaults.md` | Se precisar de tempo real no navegador |
| Supabase Auth | Login por funcionário no mesmo provedor do banco | Auth próprio ou outro provedor | Pedido do dono | Se o Supabase for trocado |
| Lógica de negócio em TypeScript com transação Drizzle | Testável com Vitest; um lugar só para as regras | Funções SQL (RPC) no banco | Toolkit (Drizzle, transações) | Se surgir concorrência que exija lock no banco |
| Centavos inteiros | Evitar erro de ponto flutuante | `numeric` com decimais no app | Toolkit, "valores monetários" | — |

## Manutenção

Atualize este mapa ao alterar diretórios, dependências relevantes, contratos ou fronteiras. Registre comportamento comprovado; remova decisões que deixaram de valer.
