# Qualidade

> Estado em 19/10/2026: todos os comandos da tabela existem e passam (111 testes: fronteiras do servidor, login e permissões, regras de dinheiro, troco, peso, caixa, estoque, carrinho e pagamento, filtros e CSV do histórico, gráficos do dashboard, configurações da loja e bandeiras). Os testes E2E (Playwright) existem: na nuvem, sem as variáveis do Supabase, só o smoke da apresentação roda; o de login e redirecionamento passou com valores fictícios de `SUPABASE_*` (sem sessão, o servidor não chama o Supabase). O fluxo da loja e as permissões ainda não rodaram contra o Supabase de desenvolvimento. Não há teste de integração com banco.

## Comandos

| Comando | Prova |
|---|---|
| `pnpm lint` | Presets Next/TypeScript, teto de 350 linhas, logger, fronteira de dados e guardas Drizzle |
| `pnpm typecheck` | Tipos de rota gerados (`next typegen`) e TypeScript strict sem erros |
| `pnpm lint:rules` | Self-check das regras locais em `eslint-rules/` |
| `pnpm test` | Testes Vitest de regras e fronteiras |
| `pnpm build` | Build de produção do Next sem credenciais reais |
| `pnpm check` | Todos os anteriores em sequência; rodar antes de abrir ou atualizar um PR |
| `pnpm test:e2e` | Playwright no navegador (fora do `pnpm check`: os fluxos com login precisam do Supabase de desenvolvimento); ver "Testes E2E" abaixo |

Durante o trabalho, rode só os testes da pasta alterada (ex.: `pnpm test src/lib`); antes do PR, a suíte completa via `pnpm check`. O Vitest procura `src/**/*.test.ts`; testes de componente (`.tsx`) exigem ampliar o `include` e escolher um ambiente DOM quando surgirem.

## Regras de base

- TypeScript strict e presets oficiais do framework.
- Teto de 350 linhas e organização proporcional ao comportamento.
- Logger estruturado no servidor; dados não acessados diretamente pela apresentação.
- Com Drizzle, guarda contra update/delete sem where e revisão das queries/migrations.
- Validação de entradas e ambiente, erros sem segredos e testes de fronteiras relevantes.

Específicas do produto:

- Nenhuma variável sensível com prefixo `NEXT_PUBLIC_`; `src/db`, `src/lib/supabase/server.ts` e `src/lib/supabase/proxy.ts` importam `server-only`.
- Toda tabela nova usa `.enableRLS()` e o SQL gerado tem `ENABLE ROW LEVEL SECURITY`.
- Cliente do banco nomeado `db`/`getDb()` e transação `tx`: só assim as guardas Drizzle de `update/delete` sem `where` funcionam.
- Toda Server Action que altera dados chama a checagem de sessão/permissão antes de qualquer escrita.

## Estratégia de testes

Prioridade por risco (dinheiro primeiro):

1. **Unidade (Vitest), sem banco:** troco, dinheiro esperado do caixa, diferença no fechamento, total por peso e arredondamento, soma de pagamentos, saldo de estoque a partir de movimentações. Os exemplos dos critérios de aceite de `PRODUCT.md` viram casos de teste.
2. **Autorização:** cada Server Action sensível recusa sessão ausente, funcionário inativo e funcionário sem a permissão exigida.
3. **Integração com banco (Supabase dev):** transações de finalizar venda e cancelar venda, índice de um caixa aberto por funcionário. Separadas do `pnpm check` porque exigem conexão.
4. **E2E (Playwright), em `e2e/` (ver abaixo):** abrir caixa → vender em dinheiro com troco → comanda → fechar caixa; funcionário sem permissão tentando acessar estoque.

Não escreva testes que apenas repetem o código. Não declare cobertura ou E2E que ainda não existam.

## Testes E2E (Playwright)

Ficam em `e2e/`, com configuração em `playwright.config.ts`: Chromium, um worker (os fluxos mexem no mesmo caixa), `pnpm dev` na porta 3000 subido pelo próprio Playwright (ou reaproveitado se já estiver rodando), `E2E_BASE_URL` para outro endereço e trace guardado só quando um teste falha (`pnpm exec playwright show-trace test-results/…/trace.zip`). A configuração carrega `.env*` como o Next (`@next/env`), então as variáveis do `.env.local` valem para decidir o que pular. O Vitest só procura `src/**/*.test.ts`, então não pega `e2e/`.

Dois projetos: **tablet** (768×1024, o balcão) roda tudo; **desktop** (1280×800) roda só o smoke público e as permissões, para o fluxo da loja não gravar tudo duas vezes no banco.

| Arquivo | Cobre | Precisa de |
|---|---|---|
| `e2e/publico.spec.ts` | Apresentação com título e link "Acessar o sistema"; manifesto do app instalável e ícones PNG | Nada (roda sempre) |
| | `/entrar` com campos Usuário e Senha rotulados; `/caixa`, `/vender` e `/dashboard` sem sessão levam ao login | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (sem elas essas páginas respondem 500) |
| `e2e/operacao.spec.ts` | Fluxo serial do dono: login → caixa novo com fundo R$ 300,00 → produto por unidade (R$ 25,80) e por kg (R$ 59,90) → entrada de 10 un no estoque → venda com R$ 30,00 e troco R$ 4,20 → 350 g = R$ 20,97 no crédito Hipercard → comanda cobrada no Pix → sangria R$ 10,00 → fechamento com falta de R$ 5,00 e observação obrigatória, resumo por forma e bandeira → histórico e detalhe → saldo 8 un → dashboard | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `E2E_DONO_USUARIO`, `E2E_DONO_SENHA` |
| `e2e/permissoes.spec.ts` | Funcionário sem permissões extras não vê Estoque/Produtos/Dashboard/Funcionários/Configurações e volta para `/caixa` ao abrir essas URLs; dono vê o menu completo | As do banco + `E2E_FUNCIONARIO_*` (funcionário) ou `E2E_DONO_*` (dono) |

Sem as variáveis, os testes aparecem como pulados (`skipped`) com o nome do que falta. As credenciais vêm só do ambiente (`.env.local` ou segredos do ambiente da nuvem), nunca do código.

Efeitos no `sorveteria-dev`: o fluxo do dono **fecha o caixa aberto do dono** (contado = esperado) para começar de um caixa novo e cria produtos "E2E Picolé …"/"E2E Sorvete kg …", vendas, a comanda "E2E …" e movimentos de caixa e estoque, com sufixo de data e hora. Exige a bandeira de crédito "Hipercard" ativa e nenhuma comanda aberta no caixa do dono. Nunca rode contra produção.

Como rodar: `pnpm test:e2e` (ou um arquivo: `pnpm test:e2e e2e/publico.spec.ts`). Na máquina do dono, instale o navegador uma vez com `pnpm exec playwright install chromium`. Na nuvem, use o Chromium já instalado: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium pnpm test:e2e` (sem `playwright install`).

## Revisão após implementação ou correção

Ao concluir um ciclo de implementação ou correção, sugira de 3 a 8 ciclos posteriores de code review, com quantidade proporcional ao risco, focos complementares e prompt de continuação preenchido. Essa faixa é convenção do projeto; revisões adicionais dependem de pedido do usuário.

Cada ciclo verifica o estado atual e o código conectado, registra achados com severidade, local e evidência e reavalia correções autorizadas com os checks afetados. Correções da mesma rodada não reiniciam a contagem. Termine com verificação integrada e riscos residuais, sem criar ciclos artificiais ou afirmar que uma quantidade de revisões prova ausência de bugs.

Focos úteis neste produto: regras de dinheiro, autorização e vazamento de segredo, transações e estoque, acessibilidade do balcão, integração entre telas.

## Dependências e entrega

Confira auditorias completas e de produção. Investigue advisories e registre risco conhecido e correção disponível. Lint/build aprovados não significam auditoria zerada.

Checks são comandos explícitos. Hooks Git, bloqueios de push e exigências de branch não fazem parte do padrão. Atualize este documento junto dos scripts e regras que mudarem.
