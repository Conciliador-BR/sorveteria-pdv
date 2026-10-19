# Sorveteria PDV

> Instruções compartilhadas com todos os agentes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Produto e stack

- Produto e escopo: `PRODUCT.md`.
- Stack: Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript 5.9 strict, Tailwind 4, ESLint 9, Drizzle ORM 0.45 + `pg` (PostgreSQL no Supabase), Zod 4, Pino 10, Vitest 5. Supabase Auth no servidor entra com o login. Runtime Node.js 24 LTS (`.node-version`); gerenciador pnpm 10. Versões exatas no `pnpm-lock.yaml`.
- Setup e validações: `docs/setup.md`.

## Comandos canônicos

- Instalar: `pnpm install`
- Desenvolver: `pnpm dev`
- Lint: `pnpm lint`
- Tipos: `pnpm typecheck` (gera os tipos de rota com `next typegen` antes do `tsc`)
- Regras locais de lint: `pnpm lint:rules`
- Testes: `pnpm test`
- Build: `pnpm build`
- Gerar SQL: `pnpm db:generate` (sem conectar)
- Aplicar migrations: `pnpm db:migrate` (somente no Supabase de desenvolvimento, salvo autorização do dono)
- Verificar base: `pnpm check`

## Acordos de trabalho

- Leia código e instruções pertinentes antes de editar. Declare hipóteses que alterem comportamento ou escopo.
- Complete o pedido com a menor mudança suficiente. Reutilize padrões, componentes e dependências existentes.
- Preserve alterações locais, validação, tratamento de erros, segurança, acessibilidade e requisitos explícitos.
- Não crie abstrações, arquitetura, opções, dependências ou funcionalidades para necessidades não solicitadas.
- Execute checks adequados. Teste lógica relevante e regressões; mudanças triviais não precisam de testes que apenas reproduzem a implementação.
- Não transforme hipóteses em fatos ou integrações pendentes em resultados simulados.
- Continue trabalho já autorizado. Pergunte somente por informação indispensável ou por ação fora da autorização.
- Publicação, mensagens a terceiros, custos e ações destrutivas dependem de autorização pertinente. Instalar ferramentas não concede essa autorização.

## Continuidade de execução

- Durante trabalho autorizado, responda a perguntas de status e retome as ações restantes. Pare se o usuário pedir pausa, cancelar ou mudar o objetivo. Sem execução em andamento, um pedido apenas informativo termina com a resposta.
- Um bloqueio impede só tarefas dependentes. Conclua as independentes que ainda forem seguras e autorizadas; antes de encerrar, confira se resta ação executável no escopo.
- Se um agente falhar ou ficar com estado incerto, confirme que parou antes de assumir seus arquivos. Inspecione alterações parciais e retome do ponto verificado, sem escritores concorrentes.
- Não repita tentativa idêntica sem evidência nova. Respeite limites de custo, tempo e tentativas, gates explícitos e negativas; decisões anteriores não ampliam autorização.
- Ao retomar por handoff, confira arquivos, Git, checks e processos reais. Só afirme execução em segundo plano quando houver processo, agente ou automação ativo e verificável.
- Sem alternativa segura, informe o bloqueio, o trabalho concluído e o que falta para retomar; não apresente pendência como resultado nem prometa continuação automática.

## Padrões e documentação

- Persistência: Drizzle ORM + PostgreSQL no Supabase. Schema em `src/db/schema/`, SQL versionado em `drizzle/`, conexão única em `src/db/index.ts`.
- Conexão servidor única, pool limitado e inicialização sob demanda. Gere e revise SQL antes de aplicar migrations em destino autorizado; não migre no build ou por request. Nunca aplique migration no Supabase de produção sem autorização do dono.
- Valide entradas e ambiente com Zod. Use Pino no servidor, sem segredos ou corpos completos. Apresentação chama módulos da funcionalidade, sem importar o cliente de banco.
- Prefira tipos inferidos, consultas parametrizadas, projeções explícitas, listagens limitadas e DTOs seguros. Operações de venda, pagamento, caixa e estoque usam transação.
- Consulte fontes oficiais atuais e o canal estável antes de alterar stack/APIs. Aplique melhorias compatíveis no escopo autorizado; registre fonte, motivo e resultado em `docs/setup.md`. Não migre versões principais ou serviços automaticamente.
- `PRODUCT.md` guarda escopo; `docs/architecture.md`, estrutura e decisões; `docs/design.md`, interface; `docs/onboarding.md`, preparação; `docs/quality.md`, checks. Atualize o documento responsável junto da mudança, sem duplicar regras.

## Ferramentas e estilo

- **Ponytail:** plugin/skill em intensidade `full` para programação, quando instalado na máquina (estado em `docs/setup.md`). `stop ponytail` desativa o modo.
- **Caveman:** conversa concisa em português do Brasil, preservando clareza e explicações completas quando solicitadas. O dono é iniciante: explique termos técnicos quando eles aparecerem. Código, documentação e commits têm redação normal. `stop caveman` desativa o estilo.
- **Superpowers:** use skills pertinentes e proporcione o fluxo ao escopo. Instruções explícitas e execução já autorizada prevalecem sobre aprovações repetidas.
- **Context7:** consulte documentação atual para Next.js, Drizzle, Supabase Auth, Zod e Tailwind. Resolva o identificador e consulte um conceito por vez. Nunca envie segredos ou código privado. Se indisponível, use fontes oficiais e registre a limitação.
- **RTK:** use comandos suportados. Com hook nativo ativo, evite wrapper duplicado; sem hook, prefixe comandos suportados. Use `rtk proxy <comando>` para saída original.
- **Graphify:** use grafo existente quando ajudar em perguntas de estrutura. Registre evidência desatualizada/incompleta; não invente relações. Exclua segredos, dependências, skills vendorizadas e arquivos gerados.
- **LLMs:** preserve cliente nativo, modelo principal e autenticação autorizados, inclusive em Graphify e Caveman. Sem política de seleção autorizada, subagentes usam o modelo da sessão. Não troque provedor nem ative API paga ou proxy silenciosamente.

Confira instalação e descoberta antes de depender de uma ferramenta. Ausência precisa de registro ou alternativa oficialmente suportada; uma preferência escrita não instala um plugin.

## Skills para Next.js

Instaladas no projeto em `.claude/skills/` (cópias para o Claude Code), registradas em `skills-lock.json`.

- `vercel-react-best-practices`: ao escrever/revisar React/Next, dados e desempenho.
- `vercel-composition-patterns`: em decisões concretas de composição e API de componentes.
- `web-design-guidelines`: revisão de interface e acessibilidade.
- `writing-guidelines`: revisão de documentação e prosa.
- `vercel-react-view-transitions`: transições solicitadas e compatíveis com as versões.
- `vercel-optimize`: otimização com tarefa pertinente e métricas Vercel disponíveis.
- `deploy-to-vercel`: publicação/preview autorizados.
- `vercel-cli-with-tokens`: operações Vercel com esse método de autenticação escolhido.
- `find-skills`: descoberta quando faltar uma capacidade concreta.

Instalar skills não executa suas ações. Não force animações, cache, deploy ou mudanças de arquitetura só porque uma skill está disponível.

## Git e colaboração

- Não adicione bloqueios de push em `main`, exigência de branch/worktree ou hooks `pre-commit`/`pre-push` por padrão.
- Lint, tipos, testes e build são checks explícitos; configurações Git adicionais entram quando solicitadas.
- Cada entrega vai num Pull Request em português, com descrição, prints de tela e resultado do `pnpm check`. Agentes não fazem merge: o dono aprova.
- Delegue quando solicitado ou pelo fluxo pertinente e suportado. Tarefas paralelas precisam de arquivos distintos e independência na mesma onda.
- Use ferramentas reais do host; nomes ilustrativos de agentes não são capacidades instaladas.

## Delegação e revisão

- Delegue somente quando isolamento de contexto, especialização ou paralelismo independente compensarem a coordenação; prefira ferramenta determinística ou execução direta para tarefas simples.
- A sessão principal é a coordenadora. Os especialistas do projeto ficam em `.claude/agents/` e a regra de ondas paralelas em `.claude/rules/parallel-subagent-driven-development.md`. A "tabela de roteamento" citada pela regra é o fluxo de entrega em `docs/onboarding.md`; o contrato da skill-base depende do Superpowers instalado.
- Quebre o trabalho por fluxo do produto (fatia vertical: tela, ação do servidor, dados e testes da mesma funcionalidade), não por camada técnica. Especialistas de design, dados e segurança entram como revisores com checklist próprio ou em tarefas que realmente só tocam seu domínio.
- Cada tarefa recebe objetivo, contexto mínimo, arquivos permitidos, dependências, aceite e checks. Um escritor por arquivo; coordenador cuida de lockfiles, configuração compartilhada, migrations e integração. Revisores paralelos trabalham somente em leitura.
- Verifique diff e checks antes de aceitar o resultado de um trabalhador. Diante de falha, investigue e escale capacidade/contexto quando necessário; respeite limites finitos de tentativas, tempo e recursos. Não estime economia sem medição.
- Após cada ciclo de implementação ou correção, sempre sugira ao usuário de **3 a 8 ciclos posteriores de code review**, escolhendo quantidade e focos conforme risco e escopo. Entregue motivo e prompt copiável com número, focos e checks reais. Essa faixa é convenção do projeto, não garantia de qualidade; a sugestão não autoriza executar novas rodadas automaticamente.
- Em uma rodada solicitada, cada ciclo revisa o estado atual, registra achados com severidade/local/evidência e verifica correções autorizadas. Use focos complementares, com revisão de integração ao final. Correções internas não reiniciam a contagem; respeite a quantidade combinada e informe riscos residuais.

## Convenções e contexto

- Idioma: interface, nomes de domínio (tabelas, funções de regra de negócio), commits e PRs em português; termos do framework ficam como estão.
- Dinheiro sempre em centavos inteiros (`*_centavos`), peso em gramas. Formatação só em `src/lib/dinheiro.ts` (criado na primeira tela com valores).
- Organização: rotas em `src/app/`, funcionalidades em `src/features/<funcionalidade>/`, componentes visuais genéricos em `src/components/ui/`. Um componente por arquivo, criado quando a tela que o usa for implementada. Detalhes em `docs/architecture.md`.
- Estilo só com os tokens de `src/app/globals.css` (tema Tailwind). Nada de cor solta. Hoje esse arquivo e as fontes Geist ainda são do scaffold e serão trocados na entrega de tokens; até lá, a referência é `docs/design.md`.
- Banco: cliente do Drizzle sempre nomeado `db` (ou `getDb()`) e transação `tx`, para as guardas de `update/delete` do lint funcionarem. Cada `pgTable` usa `.enableRLS()`; a revisão confere o `ENABLE ROW LEVEL SECURITY` no SQL gerado.
- Segredos: nunca leia, imprima ou copie valores de `.env*` para a conversa, logs ou histórico do shell; confira só se a variável existe. Variáveis de host são cadastradas pelo dono no painel.
- Skills: novas skills só entram com aprovação do dono e revisão do agente `seguranca`, nunca com `-g -y`. `.claude/skills/` é código de terceiros: revise o diff a cada atualização.
- Deploy: só no projeto Vercel do dono e com autorização dele; não use o `deploy.sh` da skill `deploy-to-vercel`, que envia o código a um endpoint de terceiros.
- Segurança: navegador nunca recebe chave do Supabase, `DATABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY`; nenhuma variável sensível com prefixo `NEXT_PUBLIC_`. Toda Server Action confere sessão e permissão antes de agir.
