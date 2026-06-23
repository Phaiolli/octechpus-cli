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
# Auto-detect (recomendado)
npx octechpus init

# Stack explícita
npx octechpus init --stack=python-fastapi
```

Na detecção automática, o CLI inspeciona manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `*.csproj`/`*.sln`, `Gemfile`, `composer.json`) **e também documentos `.md` que descrevem o projeto** (`README.md`, `PROJECT.md`, `ARCHITECTURE.md`, etc.):
- **Alta confiança** → aplica o profile imediatamente
- **Confiança média** → pede confirmação antes de aplicar
- **Baixa confiança** → lista candidatos (com "quando usar") e abre menu de seleção
- **Sem confiança / stack mista** → use o profile `generic`

Útil para projetos **greenfield** descritos num documento antes de existir código:

```bash
# Detecta a stack a partir de um doc específico
npx octechpus init --describe=docs/spec.md
```

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
│   └── commands/              ← agentes como slash commands
│       ├── pipeline.md            /pipeline
│       ├── maestro.md             /maestro
│       ├── audit.md               /audit
│       ├── architect.md           /architect
│       ├── coder.md               /coder
│       ├── review.md              /review
│       ├── qa.md                  /qa
│       ├── security.md            /security
│       ├── privacy.md             /privacy   ← LGPD/GDPR
│       ├── reporter.md            /reporter
│       ├── docs.md                /docs
│       ├── github-issue.md        /github-issue
│       ├── profiler.md            /profiler
│       ├── design.md              /design
│       └── cost-engineer.md       /cost
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
| `--minimal` | Instala só `.claude/commands/` (sem docs, sem GitHub templates) |
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
npm test              # 113 testes, ~1.5s
npm run test:watch    # modo watch
npm run test:coverage # com cobertura
```

Cobertura: profile-loader, stack-detector, template-renderer, cli-init, cli-profile-commands, template-rendering-integration.

---

## Publicar no npm

```bash
npm whoami                          # confirme login
# bumpe version em package.json e src/cli.mjs (manter em sync)
npm test
git add package.json src/cli.mjs CHANGELOG.md
git commit -m "chore(release): bump version to X.Y.Z"
git push origin main
npm publish --access public
```

---

## Links

- **npm:** [npmjs.com/package/octechpus](https://www.npmjs.com/package/octechpus)
- **GitHub:** [github.com/Phaiolli/octechpus-cli](https://github.com/Phaiolli/octechpus-cli)
- **Issues:** [github.com/Phaiolli/octechpus-cli/issues](https://github.com/Phaiolli/octechpus-cli/issues)

---

## Versão atual

**2.4.0** — Agente Privacy/LGPD, Designer stack-agnóstico (always-on), Security OWASP 2021 + API Top 10, 8 novos profiles (incl. `generic`), tier `warn_patterns` e Maestro/Reporter explícitos.  
Veja o [CHANGELOG](CHANGELOG.md) para histórico completo.

---

## Licença

MIT
