# Preparação local

> O bootstrap já foi feito. Para trabalhar no seu computador você precisa das partes 1 a 3 e depois da "Primeira execução".

## Pré-requisitos

### 1. Preparar a máquina (uma vez)

A máquina é preparada pelo [prompt 10 do toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit/blob/main/docs/prompts/10-development-environment-setup.md). Ele instala e confere Git, GitHub CLI, fnm, Node.js LTS, pnpm, ripgrep, fd, jq, Docker, Claude Code, Codex e as extensões RTK, Ponytail, Caveman, Superpowers, Context7 e Graphify.

1. Instale o Claude Code, se ainda não tiver. No Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`. No macOS/Linux: `curl -fsSL https://claude.ai/install.sh | bash`.
2. Abra um terminal novo, rode `claude` e faça o login pelo navegador.
3. Cole no Claude Code:

   ```text
   Leia https://raw.githubusercontent.com/soumatheusgomes/vibe-coding-toolkit/main/docs/prompts/10-development-environment-setup.md
   e execute integralmente o bloco da seção "Prompt" neste computador. Grave relatório e manifesto em um diretório de setup do usuário, fora dos projetos, e informe os caminhos finais.
   ```

4. Acompanhe: o agente pode pedir login no navegador, senha do sistema ou para abrir o Docker Desktop. Senhas e códigos são digitados só nessas telas, nunca no chat.

### 2. VS Code

- Instale a extensão **Claude Code** no VS Code.
- Depois de criar o repositório, clone-o (`gh repo clone <usuario>/sorveteria-pdv`) e abra a pasta no VS Code.

### 3. Supabase

1. Crie dois projetos em supabase.com: `sorveteria-dev` e `sorveteria-prod`.
2. Em **Authentication → Sign In / Providers**, desligue "Allow new users to sign up" nos dois. Os logins são criados pelo dono dentro do sistema.
3. Para o agente de dados trabalhar no projeto de desenvolvimento pelo Claude Code, no terminal do VS Code, dentro da pasta do repositório:

   ```bash
   claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<ref-do-sorveteria-dev>"
   ```

   O `<ref-do-sorveteria-dev>` aparece na URL do painel, depois de `/project/`. Depois rode `claude`, digite `/mcp`, escolha **supabase** → **Authenticate** e faça login no navegador. Não use o projeto de produção nesse comando.
4. Para os agentes na nuvem (projeto no claude.ai), conecte o Supabase em **Configurações → Conectores** e cadastre as variáveis da seção "Ambiente" nos segredos do ambiente da nuvem, nunca no chat.

## Primeira execução

```bash
pnpm install
cp .env.example .env.local     # preencha com os valores do sorveteria-dev
pnpm dev
```

## Ambiente

Variáveis (todas só no servidor; nenhuma com `NEXT_PUBLIC_`).

| Variável | Onde obter no Supabase | Uso |
|---|---|---|
| `DATABASE_URL` | Connect → connection string do pooler (modo transação) | Consultas do app |
| `DATABASE_URL_UNPOOLED` | Connect → conexão direta ou pooler em modo sessão | Migrations |
| `SUPABASE_URL` | Project Settings → API | Auth no servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Project Settings → API keys (chave publishable, `sb_publishable_…`) | Auth no servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API keys (chave secreta) | Só para criar/editar logins de funcionário (entra com a tela de funcionários) |
| `LOG_LEVEL` | — (padrão `info`) | Nível dos logs do servidor |

`.env.local` fica fora do Git. `.env.example` tem os nomes e só defaults não sensíveis.

O cookie de sessão é `Secure` quando o app roda em modo produção (`pnpm start`). Para testar no tablet pela rede local (`http://192.168…`), use `pnpm dev`; em produção o site é HTTPS.

## Banco

- Desenvolvimento usa sempre o `sorveteria-dev`. Produção nunca é ambiente de teste.
- Fluxo: alterar `src/db/schema/` → `pnpm db:generate` → revisar o SQL gerado em `drizzle/` → `pnpm db:migrate` (no dev) → testar.
- Produção recebe migrations só depois de aprovadas pelo dono, apontando `DATABASE_URL_UNPOOLED` para o `sorveteria-prod` naquele momento.

## Verificar

`pnpm check` roda lint, tipos, regras locais, testes e build. Não precisa de banco nem de credenciais. Testes que dependem do Supabase de desenvolvimento ficam separados; veja `docs/quality.md`.

Testes de ponta a ponta (E2E, o navegador clicando nas telas como uma pessoa), na máquina do dono:

1. No `.env.local`, além das variáveis do `sorveteria-dev`, preencha `E2E_DONO_USUARIO`/`E2E_DONO_SENHA` (seu login de dono) e, se quiser testar permissões, `E2E_FUNCIONARIO_USUARIO`/`E2E_FUNCIONARIO_SENHA` (um funcionário de teste sem permissões extras).
2. Uma vez por máquina: `pnpm exec playwright install chromium` (baixa o navegador de teste).
3. `pnpm test:e2e`. Ele sobe o `pnpm dev` sozinho (ou usa o que já estiver rodando na porta 3000) e grava dados de teste no `sorveteria-dev`; nunca rode contra produção.

## Agentes

Leia [AGENTS.md](../AGENTS.md). [CLAUDE.md](../CLAUDE.md) importa as mesmas instruções. Consulte [setup.md](setup.md) para skills locais, integrações e escopos configurados.

Especialistas do projeto em `.claude/agents/`: `componentes`, `design`, `dados-supabase`, `seguranca`, `testes` e `revisor`. A sessão principal do Claude Code é a coordenadora (o "agente chefe"): planeja, distribui, integra, faz os commits e abre o PR. Subagentes não chamam outros subagentes; por isso o chefe é sempre a sessão principal.

Fluxo de cada entrega:

1. Coordenador lê `PRODUCT.md` e escolhe a próxima entrega do cronograma; com Superpowers, faz o plano com `Files:` e `Depends-on:` por tarefa.
2. Tarefas independentes e com arquivos distintos rodam em ondas paralelas (`.claude/rules/parallel-subagent-driven-development.md`); as demais, em sequência.
3. `dados-supabase` cuida de schema e migrations; `componentes` e `design`, das telas; `testes`, das regras e fluxos.
4. `seguranca` revisa o diff e pode bloquear; o coordenador roda `pnpm check` e abre o PR.
5. O coordenador sugere de 3 a 8 ciclos de code review com o `revisor`; o dono decide quantos rodar e aprova o PR.

Rotina noturna (só depois que o dono autorizar):

```text
Você é o coordenador da Sorveteria PDV. Leia AGENTS.md e PRODUCT.md.
1. Se houver PR aberto com comentários do dono, corrija primeiro e atualize o PR.
2. Senão, pegue a próxima entrega não feita do cronograma em PRODUCT.md e crie uma branch.
3. Planeje com Files/Depends-on e use os especialistas de .claude/agents conforme docs/onboarding.md.
4. Rode pnpm check. Só abra o PR se passar e o agente seguranca responder APROVADO.
5. Abra o PR em português com prints e o resultado dos checks. Não faça merge nem toque no Supabase de produção.
6. Termine com um resumo de 3 linhas: o que foi feito, o que precisa de aprovação e o que vem a seguir.
```

## Dificuldades conhecidas

Nenhuma registrada ainda.
