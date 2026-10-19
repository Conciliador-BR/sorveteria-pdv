# Setup e evidências

## Origem e contexto

- Data: 16/10/2026.
- Toolkit: [soumatheusgomes/vibe-coding-toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), revisão `f13bb354363dafef8ce8d8f605856cc9e1cc52cc` (15/10/2026). Receita: `docs/prompts/11-next-project-bootstrap.md`.
- Execução: sessão Claude Code na nuvem (container Linux), não na máquina do dono. Ferramentas globais da máquina do dono (prompt 10) não foram tocadas.
- Runtime da execução: Node.js 22.22.0 (o container não tem Node 24); pnpm 10.28.0. O projeto declara Node 24 em `.node-version` e `engines`, e o pnpm avisa sobre a diferença nesta execução.
- Política de subagentes: modelo da sessão, sem seleção dinâmica autorizada.

## Decisões e fontes

| Decisão | Default do toolkit | Adotado | Motivo e fonte |
|---|---|---|---|
| Framework | Next.js estável, App Router | `create-next-app@16.4.2` (`latest` no registry; canary 16.5 ignorada) | `npm view create-next-app dist-tags`, 16/10/2026 |
| Banco | Drizzle + PostgreSQL | Mantido; PostgreSQL no Supabase | Pedido do dono |
| Autenticação | Conforme o produto | Supabase Auth no servidor, instalado com a entrega do login | Evita dependência sem uso no bootstrap |
| Gerenciador | pnpm em projeto novo | pnpm 10.28.0 (`packageManager`) | — |
| `typecheck` | `tsc --noEmit` | `next typegen && tsc --noEmit` | O layout gerado usa o tipo global `LayoutProps`, criado pelo `next typegen`; documentação local em `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md` |
| Skills | `.agents/skills/` + links | Cópias em `.claude/skills/` | Com um só cliente (`--agent claude-code`), a CLI `skills` copiou direto para o diretório do Claude Code |
| `public/` | — | Removida com os SVGs de exemplo | Sem uso; assets do produto entram com o design |

## Componentes

| Componente | Ação e motivo | Escopo | Estado e evidência |
|---|---|---|---|
| Next 16.4.2, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3, ESLint 9.39.5 | Scaffold oficial | Projeto | Validado (build abaixo) |
| drizzle-orm 0.45.4, pg 8.23.1, server-only, zod 4.6.7, pino 10.4.0, clsx, tailwind-merge 3.7.0 | Núcleo do toolkit | Projeto | Validado |
| drizzle-kit 0.31.11, @types/pg, @next/env 16.4.2, vitest 5.0.5, eslint-plugin-drizzle 0.2.3, @types/node 24 | Núcleo do toolkit | Projeto | Validado |
| `templates/next/` (env, logger, utils, db e testes) | Copiado sem o sufixo `.example` | Projeto | Validado (testes) |
| ESLint perfil completo + `eslint-rules/` + self-check | `next-app.config.mjs.example` | Projeto | Validado |
| Skills Vercel (sem o `Archive.zip` da `deploy-to-vercel`, binário duplicado fora do `skills-lock.json`): `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`, `find-skills` | `npx skills@latest add … --agent claude-code` | Projeto | Arquivos presentes e `skills-lock.json` gerado; descoberta em sessão nova pendente |
| Especialistas `.claude/agents/` e `.claude/rules/parallel-subagent-driven-development.md` | Escritos a partir do guia de orquestração | Projeto | Arquivos presentes; descoberta pendente |
| `.graphifyignore` | Template do toolkit | Projeto | Presente |
| Graphify (CLI) | Reutilizar instalação global | Máquina do dono | Pendente: não instalado neste container; grafo inicial não gerado |
| RTK, Ponytail `full`, Caveman, Superpowers | Plugins do cliente (prompt 10) | Máquina do dono | Pendente |
| Context7 | Reutilizar conexão do cliente | Máquina do dono | Pendente: sem conexão nesta sessão; `.mcp.json` não criado |
| Supabase (conector claude.ai) | Conector da conta do dono | Sessões na nuvem | Conectado em 16/10/2026; projetos `sorveteria-dev` e `sorveteria-prod` visíveis. Agentes usam só o dev |
| React Native skills | Não instalado | — | Produto é só web |
| @playwright/test 1.63.0 (devDependency, script `test:e2e`) | Testes E2E em `e2e/`. Fonte: npm registry (`npm view @playwright/test`), 18/10/2026. Fixado em 1.63.0 (publicada em 04/09/2026) porque a 1.64.x tem menos de 2 semanas (1.64.0 em 07/10, 1.64.1 em 14/10/2026) | Projeto | Smoke público validado na nuvem (ver Verificações); fluxos com banco pendentes |
| Chromium para o Playwright | Máquina do dono: `pnpm exec playwright install chromium`. Nuvem: Chromium 141 (141.0.7390.37, build 1194) já instalado em `/opt/pw-browsers`, usado via `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` sem `playwright install` | Máquina do dono / nuvem | Nuvem validada; máquina do dono pendente |

## Documentação criada

PRODUCT.md, README.md, AGENTS.md (com o bloco de regras gerado pelo Next preservado no topo), CLAUDE.md (`@AGENTS.md`), docs/architecture.md, docs/design.md, docs/onboarding.md, docs/quality.md e este arquivo.

## Verificações

| Item | Estado | Evidência |
|---|---|---|
| `pnpm lint` | Validado | Sem erros |
| `pnpm typecheck` | Validado | Sem erros após `next typegen` |
| `pnpm lint:rules` | Validado | Self-check das regras locais aprovado |
| `pnpm test` | Validado | 7 arquivos, 32 testes aprovados (env, logger, pool do banco, usuário do login, permissões, `exigir*` e action de login) |
| `pnpm build` | Validado | Build Turbopack concluído; `/` estática; `/entrar`, `/caixa` e `/dashboard` dinâmicas; proxy ativo |
| `pnpm db:generate` | Validado | "1 tables… No schema changes" (schema e SQL de `drizzle/` em sincronia, sem conexão) |
| `pnpm audit --prod` | Validado | Nenhuma vulnerabilidade conhecida |
| `pnpm audit` (dev) | Validado com ressalvas | 2 advisories só de desenvolvimento: `braces` (alta, via `eslint-config-next`, sem versão corrigida publicada) e `esbuild` ≤0.24.2 (moderada, via `drizzle-kit`). Não afetam o app em produção; acompanhar atualizações |
| Aplicação respondendo em porta local | Validado | `pnpm start -p 3217` respondeu HTTP 200 com a página provisória; processo encerrado |
| Migrations `0000_funcionarios` e `0001_usuario_formato_e_restrict` no `sorveteria-dev` | Validado | Aplicadas pelo conector em 16/10/2026 e registradas em `drizzle.__drizzle_migrations`; advisor de segurança só aponta "RLS sem políticas" (INFO), que é o bloqueio intencional da Data API |
| `pnpm test:e2e` (nuvem, 18/10/2026) | Validado parcialmente | `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`: 2 aprovados (apresentação no tablet e no desktop), 34 pulados por falta de `DATABASE_URL`, `SUPABASE_*` e `E2E_*`. Com valores fictícios de `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` só no comando, os 10 testes de `e2e/publico.spec.ts` passaram. `pnpm dev` encerrado pelo Playwright ao fim |
| Login ponta a ponta | Pendente | Falta o dono criar o primeiro usuário e cadastrar as variáveis de ambiente |
| Descoberta de skills e agentes | Pendente | Conferir numa sessão nova do Claude Code |

## Pendências e próxima entrega

1. Dono: rodar o prompt 10 na máquina (RTK, Ponytail, Caveman, Superpowers, Context7, Graphify).
2. Dono: criar o próprio login no `sorveteria-dev` em Authentication → Users com o e-mail `mateus@sorveteria.local` (o usuário do login é a parte antes do `@`: 3 a 32 de `a-z0-9._-`) e Auto Confirm. Em seguida o agente insere a linha em `funcionarios` com o mesmo `id`, `usuario = mateus` e `papel = dono`; sem essa linha o login responde "Usuário ou senha incorretos". Depois, cadastrar `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no `.env.local`.
3. Próxima tarefa do MVP: tokens visuais, apresentação e tela de funcionários.

## Revisão do bootstrap (16/10/2026)

Três ciclos pedidos pelo dono, com os especialistas `seguranca` e `revisor`:

1. **Segurança de variáveis e segredos:** aprovado. Correções: `Archive.zip` removido; regras em `AGENTS.md` para não imprimir valores de `.env*`, só aceitar skills novas com aprovação e não usar o `deploy.sh` de terceiros; logger passou a redigir `senha` e chaves `SUPABASE_*` (com teste).
2. **Lint e fronteira de dados:** guardas Drizzle agora cobrem `getDb()` e `tx`, verificado com `eslint --stdin`; `closeDatabase` entrou na fronteira. Limites restantes da regra (imports relativos, re-export, `import()`) documentados em `docs/architecture.md`. Comentários herdados do toolkit em `eslint-rules/` e `scripts/` ficaram como estão.
3. **Coerência da documentação:** 13 ajustes (variáveis de ambiente, estado do Ponytail, pendências, tokens do scaffold, arquivos futuros, `.enableRLS()`, Node 22 vs 24).

Riscos residuais: advisories de desenvolvimento listados acima; checks rodados em Node 22.
