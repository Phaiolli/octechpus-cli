# 🐙 Octechpus

**CLI instalável que scaffolda um sistema completo de orquestração de agentes em qualquer projeto Claude Code.**

`octechpus init` detecta sua stack automaticamente e instala 13 agentes especializados (incluindo **Privacy/LGPD** e um **Designer** stack-agnóstico), templates de CI/GitHub e documentação estruturada — tudo configurado para o seu projeto, pronto para usar com `/pipeline` no Claude Code.

---

## Instalação

```bash
# Sem instalar (recomendado para uso pontual)
npx octechpus init

# Global
npm install -g octechpus
octechpus init
```

**Requisitos:** Node.js >= 18

---

## Quick start

```bash
npx octechpus init
```

Sem flags, o `init` pergunta **como você quer instalar**, com dois caminhos:

- **A) Projeto em andamento** — o CLI lê a base de código existente e auto-detecta
  a stack coerente, instalando de forma harmoniosa com o que já está lá.
- **B) Projeto novo** — você aponta um documento **PID** (`.md`) descrevendo o
  projeto; o CLI lê o documento e escolhe a stack ideal para começar.

Você pode **pular o menu** com flags:

```bash
# Stack explícita (bypass total)
npx octechpus init --stack=python-fastapi

# Projeto novo: aponta o PID direto (entra no caminho B, não-interativo)
npx octechpus init --describe=docs/pid.md
```

> 💡 **Não precisa do caminho completo.** Basta o **nome** do arquivo (com ou sem
> `.md`) — o CLI procura o documento em `projectDir` e no diretório atual, ignorando
> `node_modules`, `.git`, `dist`, etc. Ex.: `--describe=pid`. Se houver mais de um
> arquivo com o mesmo nome, o CLI lista os caminhos e pede para você especificar.

Na detecção (caminhos A e B), o CLI inspeciona manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `*.csproj`/`*.sln`, `Gemfile`, `composer.json`) **e também documentos `.md`** (o PID no caminho B; `README.md`, `PROJECT.md`, `ARCHITECTURE.md`, etc. no caminho A):
- **Alta confiança** → aplica o profile imediatamente
- **Confiança média** → pede confirmação antes de aplicar
- **Baixa confiança** → lista candidatos (com "quando usar") e abre o modo guiado
- **Sem confiança / stack mista** → use o profile `generic`

---

## Profiles disponíveis

> **Designer** e **Privacy/LGPD** são always-on em todos os profiles (não aparecem como "extras"). Só **Cost Engineer** é opt-in por profile.

| Profile | Linguagem / Framework | Agente opt-in |
|---|---|---|
| `node-typescript` | Node.js + TypeScript, Vitest, Zod | — |
| `node-javascript` | Node.js puro (JS, sem TypeScript) | — |
| `nextjs-react` | Next.js + React + Tailwind + shadcn/ui | — |
| `vue-nuxt` | Vue 3 + Nuxt + Tailwind | — |
| `react-native` | React Native / Expo (mobile) | — |
| `python-fastapi` | Python ≥ 3.12, FastAPI, Pydantic v2, pytest, uv, ruff | — |
| `python-ai-pipeline` | FastAPI + LLM (Anthropic/OpenAI/LangChain) | Cost Engineer |
| `python-cli` | Click / Typer, pytest | — |
| `go-api` | Go, chi ou stdlib, testify | — |
| `rust-cli` | Rust, clap, tokio, cargo test | — |
| `java-spring` | Java 17+, Spring Boot, JUnit 5 | — |
| `dotnet-api` | C#, ASP.NET Core, xUnit | — |
| `ruby-rails` | Ruby on Rails, RSpec | — |
| `php-laravel` | PHP 8.2+, Laravel, Pest/PHPStan | — |
| `generic` | Fallback agnóstico (stack mista / desconhecida) | — |

Todos herdam de `_base`, que define pipeline, segurança, privacidade, ADRs e convenções universais. A herança é resolvida por deep-merge: o filho sobrescreve escalares e **concatena arrays** (use `!override` como 1º item para substituir).

```
_base
├── node-typescript
│   ├── nextjs-react
│   ├── vue-nuxt
│   └── react-native
├── node-javascript
├── python-fastapi
│   ├── python-ai-pipeline
│   └── python-cli
├── go-api · rust-cli · java-spring · dotnet-api · ruby-rails · php-laravel
└── generic
```

---

## O que é instalado

```
seu-projeto/
├── .claude/
│   ├── commands/              ← agentes como slash commands (orquestração)
│   │   ├── pipeline.md            /pipeline
│   │   ├── maestro.md             /maestro
│   │   ├── audit.md               /audit
│   │   ├── architect.md           /architect
│   │   ├── coder.md               /coder
│   │   ├── review.md              /review
│   │   ├── qa.md                  /qa
│   │   ├── security.md            /security
│   │   ├── privacy.md             /privacy   ← LGPD/GDPR
│   │   ├── reporter.md            /reporter
│   │   ├── docs.md                /docs
│   │   ├── github-issue.md        /github-issue
│   │   ├── profiler.md            /profiler
│   │   ├── design.md              /design
│   │   └── cost-engineer.md       /cost
│   ├── agents/                ← subagents escopados (tools + modelo por agente)
│   │   ├── security.md            read-only · opus
│   │   ├── coder.md               read-write · inherit
│   │   ├── docs.md                read-write · haiku
│   │   └── … (um por agente ativo)
│   └── settings.json          ← permissões: allow / ask / deny (segurança)
├── .github/
│   ├── ISSUE_TEMPLATE/            Templates bug / feature / refactor
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── OCTECHPUS_AGENTS.md    ← Referência completa dos agentes
│   └── adr/                   ← Architecture Decision Records
├── .octechpus/
│   └── manifest.json          ← Hashes SHA-256 para rastrear customizações
└── CLAUDE.md                  ← Config do projeto lida pelo Claude Code
```

> **Design system:** desde a v2.4 o `init` **não** scaffolda mais um `design-system/`
> pronto. O agente **Designer** é stack-agnóstico — aplica melhores práticas de UX/UI
> e **pede o design system do Claude Design em runtime**. Se quiser um starter local,
> use `--with-design-system` ou `npx octechpus design-system add`.

---

## Permissões e subagents (v2.5)

Desde a v2.5 o `init` configura **segurança por padrão** — sem você precisar aprovar
cada ação dos agentes. Ver [ADR 002](docs/adr/002-evolucao-seguranca-e-eficiencia-agentes.md).

### `.claude/settings.json` — modelo de menor privilégio

Gerado a partir do profile, com três níveis:

| Nível | Comportamento | Exemplos |
|---|---|---|
| `allow` | roda **sem perguntar** | `npm test`, `git commit`, `pytest`, `cargo build`, `gh …` |
| `ask` | pausa e **pede aprovação** | `git push`, `npm publish` |
| `deny` | **bloqueado** (nem pergunta) | `rm -rf`, force-push, `sudo`, `curl`/`wget`, **ler `.env`/chaves** |

As pastas em `guardrails.read_only_paths` viram regras `Write(...)`/`Edit(...)` no `deny` —
o guardrail deixa de ser texto no `CLAUDE.md` e passa a ser **trava imposta**.

> O resultado é **mais autonomia** (o trabalho seguro flui sem prompts) **e mais segurança**
> (o destrutivo é barrado, não perguntado). Para overrides pessoais, use
> `.claude/settings.local.json` — ele precede o `settings.json`.

> ⚠️ **`deny` é defesa-em-profundidade, não sandbox.** As regras casam por prefixo de
> comando (`Bash(rm -rf:*)`), então reduzem o risco mas não eliminam toda evasão possível
> (ex.: `find -delete`, aliases). É uma camada de proteção — não substitui review humano.
> Cada subagent também carrega uma instrução **anti prompt-injection** (conteúdo lido do
> repo é *dado*, nunca comando).

### `.claude/agents/` — subagents escopados

Cada agente vira um subagent do Claude Code com **contexto isolado**, **ferramentas por
princípio do menor privilégio** e **modelo próprio**:

| Agente | Tools | Modelo |
|---|---|---|
| Architect · Reviewer · Security · Privacy · Reporter · Profiler · Designer | `Read, Grep, Glob` (**read-only**) | — |
| Coder · QA · Docs · GitHub · Maestro | `Read, Write, Edit, Bash, Grep, Glob` | — |
| Security · Architect | — | `opus` (rigor) |
| Docs · Reporter · Profiler | — | `haiku` (custo) |

Os agentes de **análise não conseguem editar código** (não têm a ferramenta) — a segurança
vem de *não ter a capacidade*, não de te perguntar. Configurável via `agents_runtime` no profile.

> **v2.6 — orquestração real:** o `/pipeline` **delega** cada fase ao subagent via ferramenta
> `Task` (em vez de trocar de papel numa conversa só). O fan-out pós-Coder — Reviewer ∥ QA ∥
> Security ∥ Privacy — roda **em paralelo**, e o handoff entre agentes passa por artefatos em
> `.octechpus/run/` (cada subagent recebe os outputs relevantes dos anteriores). O `/audit`
> também delega aos subagents read-only em paralelo (v2.7).

> **v2.7 — adoção sem atrito:** se você já tem um `.claude/settings.json`, o Octechpus faz
> **merge** das permissões nele (preserva suas regras e chaves `hooks`/`env`/etc.) em vez de
> pular o arquivo. Um `settings.json` inválido nunca é sobrescrito. O `init`/`update` também
> adicionam `.octechpus/run/` ao `.gitignore`.

---

## Os 13 agentes

```
Maestro → GitHub → Architect → [Designer] → Coder → Reviewer → QA → Security → Privacy → Docs → Reporter
                                     ↑ em demandas de UI            🔬 Profiler   💰 Cost Engineer (opt-in)
```

| # | Agente | Responsabilidade |
|---|---|---|
| 1 | 🎯 Maestro | Orquestra; rubrica de severidade, critérios testáveis, teto de 2 iterações → escala p/ humano |
| 2 | 🐙 GitHub | Issues, branches (conventional), commits semânticos, PRs; CODEOWNERS/branch protection/secret-scan |
| 3 | 📐 Architect | Impacto técnico, ADRs, NFRs e **classificação de dados** (público/pessoal/sensível) |
| 4 | 🎨 Designer | **Stack-agnóstico** — melhores práticas de UX/UI; pede o design system do Claude Design em runtime |
| 5 | 💻 Coder | Implementação pelo profile; Karpathy (Simplicity/Surgical); regras de segredos/PII e feature flags |
| 6 | 🔍 Reviewer | Code review com severidade (🔴/🟡/🔵); K1-K4; concorrência, i18n; checklist de UX em PRs de UI |
| 7 | 🧪 QA | Unit/integração/E2E + negativos de segurança; fixtures sem PII; smoke de performance |
| 8 | 🛡️ Security | OWASP **2021** + API Security Top 10 (BOLA/BFLA) + SSRF + supply chain |
| 8b | ⚖️ Privacy | Conformidade **LGPD/GDPR**: base legal, minimização, retenção, direitos do titular, RIPD/DPIA |
| 9 | 📚 Docs | Docstrings/JSDoc, README, CHANGELOG, ADRs, documentação de dados pessoais |
| 10 | 📊 Reporter | Relatório consolidado; scorecard com **piso** (Segurança/Privacidade < 4 capa o geral) |
| 11 | 🔬 Profiler | Auto-detecção de stack (incl. monorepo/drift); rode `/profiler` para re-verificar |
| 12 | 💰 Cost Engineer | Guarda contra gasto de API/infra (budget + kill-switch); opt-in em AI/ML |

### Princípios de Karpathy (embutidos em todos os agentes desde v2.3)

Todo agente gerado por `octechpus init` segue os 4 princípios:

1. **Think Before Coding** — Architect declara premissas e define critérios testáveis antes de qualquer plano
2. **Simplicity First** — Coder proíbe abstrações prematuras e código defensivo desnecessário
3. **Surgical Changes** — Coder altera o mínimo necessário; Reviewer rejeita escopo extra
4. **Goal-Driven Execution** — Maestro converte demandas vagas em resultados mensuráveis antes de rotear

---

## Slash commands (pós-init)

Abra o Claude Code no projeto e use:

| Comando | Para quê |
|---|---|
| `/pipeline [demanda]` | Pipeline completo — todos os agentes em sequência |
| `/maestro [demanda]` | Classificação, severidade e roteamento |
| `/audit [escopo]` | Raio-x do projeto com scorecard |
| `/architect [escopo]` | Análise de impacto arquitetural |
| `/coder [demanda]` | Implementação guiada pelo profile |
| `/review [escopo]` | Code review com severidade |
| `/qa [escopo]` | Gerar testes (unit, integration, E2E) |
| `/security [escopo]` | Audit OWASP 2021 + API Top 10 |
| `/privacy [escopo]` | Conformidade LGPD/GDPR |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Criar issue no GitHub |
| `/profiler` | Re-detectar e reportar stack atual |
| `/reporter [escopo]` | Relatório consolidado do pipeline |
| `/design [demanda]` | Briefing de UX/UI (Designer) |
| `/cost [escopo]` | Audit de gasto de API e dependências |
| `/readiness [escopo]` | Scorecard de prontidão técnica publicado numa Issue (integração Maestro) |

---

## Comandos CLI

```bash
octechpus init                        # Setup com auto-detecção de stack
octechpus init --stack=<profile>      # Setup com stack explícita
octechpus status                      # Verifica setup e profile ativo
octechpus doctor                      # Diagnostica problemas e drift de profile
octechpus update                      # Atualiza commands (preserva customizações)
octechpus profile list                # Lista profiles disponíveis
octechpus profile show <nome>         # Mostra profile resolvido (após herança)
octechpus profile current             # Mostra profile ativo do projeto atual
octechpus profile switch <nome>       # Troca o projeto para outro profile
octechpus design-system add           # Adiciona design system ao projeto
octechpus design-system update        # Sincroniza design-system/ com os templates mais recentes
octechpus help                        # Ajuda
```

### Flags

| Flag | Efeito |
|---|---|
| `--stack=<nome>` | Força um profile, ignorando auto-detecção |
| `--describe=<file.md>` | Infere a stack a partir de um doc `.md` do projeto |
| `--force` | Sobrescreve arquivos existentes sem perguntar |
| `--minimal` | Só o núcleo `.claude/`: commands + `settings.json` + agents (sem docs/GitHub) |
| `--dry-run` | Preview do que seria criado, sem escrever nada |
| `--with-design-system` | Scaffolda um starter local em `design-system/` (opcional) |
| `--keep-customizations` | `update` pula arquivos editados pelo usuário (padrão: `true`) |

---

## Rastreamento de customizações

`octechpus update` armazena um hash SHA-256 de cada arquivo gerado em `.octechpus/manifest.json`. Em updates subsequentes, compara o hash armazenado com o conteúdo atual:

- **Hash bate** → arquivo não foi editado → atualiza
- **Hash diverge** → arquivo foi customizado → pula (preserva suas edições)
- **`--force`** → sobrescreve tudo independente de customizações

---

## Criando um profile customizado

1. Crie `src/profiles/meu-stack.yaml` herdando da base mais próxima:

```yaml
extends: _base        # ou python-fastapi, node-typescript, etc.
name: meu-stack
description: "Minha stack customizada"

language: kotlin
runtime: "jvm>=21"
package_manager: gradle

testing:
  framework: junit5
  coverage_target: 80

design_system:
  tokens: none
```

2. Valide o profile:

```bash
node src/cli.mjs profile show meu-stack
```

3. Use:

```bash
octechpus init --stack=meu-stack
```

Consulte `docs/profiles.md` para a especificação completa do schema.

---

## Projetos existentes

O CLI detecta `CLAUDE.md` existentes e faz merge automaticamente — seu conteúdo é preservado abaixo da seção gerada pelo Octechpus.

```bash
cd projeto-existente
octechpus init
octechpus status
```

---

## Migração do 1.x

```bash
npm install -g octechpus
cd seu-projeto
octechpus init        # detecta stack, faz merge do CLAUDE.md, atualiza commands
octechpus status
octechpus doctor
```

**Breaking changes na 2.0:**
- `CLAUDE.md` ganhou seção `Stack Profile` no topo — o `init` faz merge automaticamente
- `docs/AGENTS.md` renomeado para `docs/OCTECHPUS_AGENTS.md`
- Commands passaram a usar placeholders `{{stack.xxx}}` em vez de nomes de linguagem hardcoded

---

## Testes

```bash
npm test              # 137 testes, ~2.5s
npm run test:watch    # modo watch
npm run test:coverage # com cobertura
```

Cobertura: profile-loader, stack-detector, template-renderer, cli-init, cli-permissions, cli-profile-commands, template-rendering-integration.

---

## Publicar no npm

**Automático (recomendado):** bumpe a versão (`package.json` + `src/cli.mjs`),
atualize o `CHANGELOG.md`, commite e dê push no `main`. O workflow
`.github/workflows/publish.yml` publica via **OIDC / Trusted Publishers** quando a
versão muda (e pula se já estiver no npm).

> Configuração única no npmjs.com: pacote **octechpus** → Settings → **Trusted
> Publisher** → GitHub Actions (`Phaiolli/octechpus-cli`, workflow `publish.yml`).

```bash
# bumpe version em package.json e src/cli.mjs (em sync) + CHANGELOG
npm test
git add package.json src/cli.mjs CHANGELOG.md
git commit -m "chore(release): bump version to X.Y.Z"
git push origin main          # → o workflow publica sozinho
```

**Manual (fallback)** — requer token npm válido em `~/.npmrc`:

```bash
npm whoami && npm publish --access public && npm view octechpus version
```

Detalhes e troubleshooting de auth: ver `CLAUDE.md` → "Como publicar no npm".

---

## Links

- **npm:** [npmjs.com/package/octechpus](https://www.npmjs.com/package/octechpus)
- **GitHub:** [github.com/Phaiolli/octechpus-cli](https://github.com/Phaiolli/octechpus-cli)
- **Issues:** [github.com/Phaiolli/octechpus-cli/issues](https://github.com/Phaiolli/octechpus-cli/issues)

---

## Versão atual

**2.7.0** — Merge de `settings.json` pré-existente (adoção sem atrito para quem já usa Claude Code), `/audit` delegando aos subagents em paralelo, e `.octechpus/run/` no `.gitignore`. Sobre a base da 2.6.0 (orquestração real via `Task`) e da 2.5.0 (permissões + subagents escopados). Ver [ADR 002](docs/adr/002-evolucao-seguranca-e-eficiencia-agentes.md).  
Veja o [CHANGELOG](CHANGELOG.md) para histórico completo.

---

## Licença

MIT
