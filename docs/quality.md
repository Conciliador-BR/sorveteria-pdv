# Qualidade

> Estado em 16/10/2026: todos os comandos abaixo existem e passam (32 testes: fronteiras do servidor, regras de login e permissões, autorização dos `exigir*` e da action de login com mocks). Testes de regras de negócio entram com cada funcionalidade.

## Comandos

| Comando | Prova |
|---|---|
| `pnpm lint` | Presets Next/TypeScript, teto de 350 linhas, logger, fronteira de dados e guardas Drizzle |
| `pnpm typecheck` | Tipos de rota gerados (`next typegen`) e TypeScript strict sem erros |
| `pnpm lint:rules` | Self-check das regras locais em `eslint-rules/` |
| `pnpm test` | Testes Vitest de regras e fronteiras |
| `pnpm build` | Build de produção do Next sem credenciais reais |
| `pnpm check` | Todos os anteriores em sequência; rodar antes de abrir ou atualizar um PR |

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
4. **E2E (Playwright), quando os fluxos existirem:** abrir caixa → vender em dinheiro com troco → comanda → fechar caixa; funcionário sem permissão tentando acessar estoque.

Não escreva testes que apenas repetem o código. Não declare cobertura ou E2E que ainda não existam.

## Revisão após implementação ou correção

Ao concluir um ciclo de implementação ou correção, sugira de 3 a 8 ciclos posteriores de code review, com quantidade proporcional ao risco, focos complementares e prompt de continuação preenchido. Essa faixa é convenção do projeto; revisões adicionais dependem de pedido do usuário.

Cada ciclo verifica o estado atual e o código conectado, registra achados com severidade, local e evidência e reavalia correções autorizadas com os checks afetados. Correções da mesma rodada não reiniciam a contagem. Termine com verificação integrada e riscos residuais, sem criar ciclos artificiais ou afirmar que uma quantidade de revisões prova ausência de bugs.

Focos úteis neste produto: regras de dinheiro, autorização e vazamento de segredo, transações e estoque, acessibilidade do balcão, integração entre telas.

## Dependências e entrega

Confira auditorias completas e de produção. Investigue advisories e registre risco conhecido e correção disponível. Lint/build aprovados não significam auditoria zerada.

Checks são comandos explícitos. Hooks Git, bloqueios de push e exigências de branch não fazem parte do padrão. Atualize este documento junto dos scripts e regras que mudarem.
