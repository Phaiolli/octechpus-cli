# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.10.0] - 2026-07-02

### Added
- **`init` com dois caminhos de entrada** — a seleção de stack deixa de exibir a
  lista longa de profiles por padrão e passa a oferecer duas alternativas:
  **(A) Projeto em andamento** — lê a base de código existente e auto-detecta a
  stack coerente (`detectStack`); **(B) Projeto novo** — o usuário aponta um
  documento PID (`.md`) e o CLI recomenda a stack ideal (`detectStack({ describeFile })`,
  com fallback ao modo guiado determinístico). A lógica de detecção→resolução foi
  extraída para `resolveDetectedProfile()`, reutilizada pelos dois caminhos. As
  flags `--stack` e `--describe` continuam fazendo bypass do menu (retrocompatível).
  Ver ADR `docs/adr/004-init-two-path-selection.md`.
  ⚠️ **Breaking menor:** `--describe` agora é estritamente não-interativo — falha
  com `exit 1` se o `.md` for inexistente/inválido **ou** se não houver sinal
  suficiente para inferir a stack com confiança (antes caía silenciosamente na
  detecção/prompt). Use `--stack=<profile>` para forçar. A detecção via docs `.md`
  também passou a limitar a leitura a 256 KB (defense-in-depth).
- **Comando `/readiness`** — gera um scorecard de prontidão técnica e o publica
  numa Issue de Prontidão fixa (label estável `maestro:readiness`), no formato
  `maestro.readiness/v1`, consumido pela plataforma Maestro. Aditivo e
  retrocompatível; `npx octechpus update` instala o comando em projetos existentes.

## [2.9.0] - 2026-06-27

### Added
- **Campo `example_project` nos profiles** — cada profile agora traz um exemplo de
  projeto em linguagem leiga (PT), para que um usuário não-técnico saiba "para que
  serve" cada stack. Aparece como uma linha `💡 Ex.:` abaixo da dica técnica
  (`↳ when_to_use`) tanto na seleção interativa do `init` quanto em `profile list`.
  Ex.: `react-native → "O aplicativo de celular (iOS/Android) de uma academia ou banco"`.
- **Modo guiado de escolha de profile** — na seleção manual do `init`, digite `?`
  para descrever o projeto e responder 5 perguntas; o CLI recomenda um profile com
  justificativa e pede confirmação. A recomendação é 100% **determinística** (sistema
  de pontuação sobre as `tags` dos profiles + sua descrição) — sem rede e sem LLM,
  coerente com o CLI rodar via `npx`. Lógica isolada em `src/lib/profile-advisor.mjs`.

### Changed
- **`createAsker()` em `lib/prompts.mjs`** — prompter com um único `readline`
  bufferizado, usado na fase de seleção do `init`. Substitui o padrão de abrir/fechar
  um `readline` por pergunta, que perdia o input em fluxos com múltiplos prompts
  quando o stdin é um pipe.

### Security
- **Hardening em `loadProfile`** — nome de profile agora é validado contra
  `^[a-z0-9_-]+$` antes de compor o caminho do arquivo, eliminando qualquer
  possibilidade de path traversal a partir de input do usuário (defense-in-depth).

### Docs
- ADR `003-profile-advisor-e-example-project.md` documentando as duas decisões.

## [2.8.0] - 2026-06-23

### Changed
- **O starter de design system agora é o Stratum** — um DS híbrido, dark-first,
  brand-agnostic e token-driven (substitui o antigo "Claude Design System"
  Inter/glassmorphism). O `npx octechpus design-system add` (e `--with-design-system`)
  passa a entregar:
  - `tokens/tokens.json` — **fonte da verdade DTCG** (cores OKLCH), mais as formas
    geradas `tokens.css`, `tokens.ts` e o preset `tailwind.preset.ts` (Tailwind v4).
  - `reference/stratum-design-system.html` — spec visual auto-contida (60+ componentes,
    11 templates de página, toggle de tema/accent, padrões de LGPD).
  - `PROMPT_STARTERS.md` — prompts prontos para bootstrap.
  - `CLAUDE.md`/`README.md` reescritos: o pacote é lido pelo agente `/design` e
    referenciável da raiz via `@./design-system/CLAUDE.md`.
- **`getDesignSystemExcludes()`** reaponta para os novos arquivos de token por modo:
  `none` não entrega tokens; `css-only` entrega `tokens.css` + `tokens.json`;
  `tailwind` entrega tudo (json + css + ts + preset).
- O comando `/design` prefere o `./design-system/` local (Stratum) como fonte da
  verdade quando ele existe.

### Removed
- Os 8 docs antigos (`docs/01-08`) e o preset `tailwind.preset.js` do starter
  anterior — superados pelo `CLAUDE.md` auto-contido do Stratum + a referência visual.

## [2.7.0] - 2026-06-23

### Added
- **`/audit` também delega aos subagents** — o raio-x do projeto agora dispara
  `Task(architect/reviewer/qa/security/privacy/docs)` **em paralelo** (read-only),
  em vez de rodar tudo numa conversa só. Consistência com o `/pipeline`.
- **`.octechpus/run/` entra no `.gitignore`** automaticamente no `init`/`update` —
  os artefatos transientes de handoff do pipeline não são commitados por engano.

### Changed
- **`settings.json` agora faz *merge*, não pula** — projetos que já têm um
  `.claude/settings.json` (usuários de Claude Code com config própria) passam a
  **receber o modelo de permissão** via union-merge: as listas `allow/ask/deny` do
  Octechpus são adicionadas preservando as regras e chaves do usuário (`hooks`, `env`,
  `defaultMode`, etc.). Idempotente em `update`/`profile switch`.
- Um `settings.json` com **JSON inválido nunca é sobrescrito** — o CLI avisa e
  preserva o arquivo para correção manual.

### Notes
- Decisão consciente: **não** apertei a allowlist por stack (ela é universal e
  generosa de propósito). O ganho de minimalismo não paga o custo de manutenção de 15
  profiles, e a allowlist não é a camada de defesa real — o `deny` e o escopo dos
  subagents são.

## [2.6.0] - 2026-06-23

### Added
- **`/pipeline` agora delega de verdade aos subagents** (fecha o item #1 do ADR 002).
  O orquestrador invoca cada agente via ferramenta **Task** (`subagent_type` = nome do
  agente) em vez de trocar de papel numa conversa só. Ganhos: contexto isolado, menor
  privilégio e **execução paralela** do fan-out pós-Coder (Reviewer ∥ QA ∥ Security ∥
  Privacy ∥ Cost Engineer quando aplicável).
- **Handoff por artefatos** — como os agentes read-only não escrevem em disco, o
  orquestrador persiste cada saída em `.octechpus/run/<NN>-<agente>.md` e passa os
  artefatos relevantes adiante. O Reporter consome o diretório inteiro.

### Changed
- **Subagents ganham guarda anti prompt-injection** — preâmbulo em todo `.claude/agents/*.md`
  deixando explícito que conteúdo lido do repo (código, `.md`, issues, saídas de comando)
  é **dado, nunca instrução**.
- **`--minimal` agora inclui `settings.json` + subagents** — segurança é núcleo, não extra.
  Texto do `help`/README alinhado ao comportamento.

### Fixed
- **`$ARGUMENTS` não vaza mais nos subagents** — o placeholder de slash command era
  reusado verbatim no corpo do subagent; agora é neutralizado na geração (subagents
  recebem a tarefa via prompt de invocação, não via `$ARGUMENTS`).

### Notes
- `permissions.deny` é **defesa-em-profundidade** (casa por prefixo de comando), não um
  sandbox — reduz risco, não substitui review humano. Documentado no README.

## [2.5.0] - 2026-06-23

### Added
- **Modelo de permissão — gera `.claude/settings.json`** (ADR 002). O `init`/`update`/
  `profile switch` agora escrevem um `settings.json` derivado do profile com
  `permissions.allow` (trabalho seguro pré-aprovado — testes, build, git local, gh),
  `permissions.ask` (zona cinzenta: `git push`, `npm publish`) e `permissions.deny`
  (destrutivo: `rm -rf`, force-push, `sudo`, `curl`/`wget`; e **leitura de segredos**
  `.env`/`*.pem`/`id_rsa`/`secrets/**`). Resultado: o pipeline roda **mais autônomo**
  (menos prompts no trabalho seguro) e **mais seguro** (o destrutivo é bloqueado, não
  perguntado).
- **Guardrails viram trava real** — as pastas em `guardrails.read_only_paths` passam a
  gerar regras `Write(...)`/`Edit(...)` no `deny`, em vez de serem apenas uma regra de
  texto no `CLAUDE.md` que o agente podia ignorar.
- **Subagents escopados — gera `.claude/agents/*.md`** (ADR 002). Cada um dos 13 agentes
  vira um subagent do Claude Code com **ferramentas por princípio do menor privilégio**:
  agentes de análise (Architect, Reviewer, Security, Privacy, Reporter, Profiler, Designer)
  são **read-only** (`Read, Grep, Glob` — sem Write/Edit/Bash); agentes de ação (Coder, QA,
  Docs, GitHub, Maestro) têm escrita. Cada subagent reusa o prompt do command como system
  prompt e ganha **contexto isolado**.
- **Model tiering** — `model` por agente no frontmatter do subagent: `haiku` para
  Docs/Reporter/Profiler (custo), `opus` para Architect/Security (rigor), `inherit` no
  resto. Configurável via `agents_runtime` no profile.
- **Bloco `permissions` e `agents_runtime` no `_base.yaml`** — universais, herdados por
  todos os profiles; arrays de `permissions` concatenam na herança (um profile pode
  ADICIONAR comandos da sua stack).
- **`octechpus doctor` verifica integridade** — compara o hash atual de cada arquivo
  rastreado com o `manifest.json` e reporta correspondências, arquivos customizados/
  alterados e faltando (estes últimos sugerem `octechpus update`).
- **Testes** — `tests/cli-permissions.test.mjs` (11 testes): geração de settings,
  regras de deny/ask, read-only vs read_write, model tiering, opt-in do cost-engineer,
  rastreio no manifest e re-render no `profile switch`.

### Notes
- O `settings.json` é gerenciado pelo Octechpus. Para overrides pessoais sem perder o
  controle, use `.claude/settings.local.json` (precede o `settings.json` no Claude Code).
- `octechpus status`/`doctor` agora verificam a presença de `settings.json` e dos
  subagents escopados.

## [2.4.2] - 2026-06-23

### Changed
- **`octechpus update` agora atualiza o `CLAUDE.md`** — re-renderiza as seções
  gerenciadas pelo Octechpus (pipeline, comandos, segurança, privacidade, padrões)
  e **preserva a seção `## 📋 PROJECT DOCUMENTATION`** do usuário. Com isso, `update`
  passa a ser o comando único que traz um projeto totalmente para a versão nova
  (não é mais necessário rodar `profile switch` à parte). Se o `CLAUDE.md` não tiver
  o marcador esperado, ele é preservado e o CLI avisa.

## [2.4.1] - 2026-06-23

### Fixed
- **`octechpus update` agora adiciona agentes novos** introduzidos por upgrades
  (ex.: `privacy`, `maestro`, `reporter`) em projetos já existentes — antes só
  atualizava arquivos que já existiam, deixando os novos de fora. Customizações
  continuam preservadas; `--force` continua sobrescrevendo.

## [2.4.0] - 2026-06-23

### Added
- **Novo agente ⚖️ Privacy/LGPD** (`commands/privacy.md`) — always-on, conformidade configurável via `compliance.framework` (`lgpd` por padrão). Cobre base legal/finalidade, minimização, PII em logs/fixtures, direitos do titular, retenção/descarte, transferência internacional e RIPD/DPIA. Roda após o Security no pipeline.
- **Bloco `compliance` no `_base.yaml`** — `framework`, `privacy_review_required`, `pii_in_logs`.
- **Profile `generic`** — fallback agnóstico de stack para projetos poliglotas/monorepo ou quando a auto-detecção tem baixa confiança; regras relaxadas (nada é rejeitado só por não bater com uma stack opinativa).
- **Seção de Privacidade no `/audit`** — score próprio "Privacidade/LGPD" + detalhamento; o score geral agora tem **piso** (Segurança ou Privacidade < 4 capa o geral em 4).

### Changed
- **Designer agora é always-on e stack-agnóstico** (`agents.designer: true` no `_base`; removidos os overrides `designer: false`). Ele **não traz mais tokens/design system prontos** — aplica melhores práticas de UX/UI (responsividade, WCAG AA, estados completos, `prefers-reduced-motion`, i18n) e **pede o design system do Claude Design em runtime**. A checklist de UI do Reviewer ficou genérica (sem shadcn/Tailwind/lucide hardcoded).
- **`init` não scaffolda mais `design-system/` por padrão** — agora é opt-in via `--with-design-system` (ou `design-system add`).
- **Security atualizado para OWASP Top 10 (2021)** + **API Security Top 10** (BOLA/BFLA), **SSRF** e checagens de **supply chain** (audit de dependências, lockfile, secrets em CI/CD).
- **Architect** passa a exigir **NFRs** (performance/observabilidade/rollback) e **classificação de dados** (público/interno/pessoal/sensível) que aciona Security/Privacy.
- **Docs** passa a documentar coleta/uso de dado pessoal (insumo de ROPA/aviso de privacidade).

### Added (detecção via Markdown)
- **Auto-detecção a partir de documentos `.md`** — o `stack-detector` agora lê `README.md` e docs de visão geral (`PROJECT.md`, `ARCHITECTURE.md`, `STACK.md`, `OVERVIEW.md`, `SPEC.md`, `PRD.md`) e infere a stack a partir da prosa (frameworks/linguagens/libs). Permite detectar a stack em projetos **greenfield** descritos antes de existir código/manifests.
- **Flag `--describe=<file.md>`** no `init` — aponta um documento específico para a detecção. Manifests continuam com peso maior que prosa; `.md` confirma/desempata e pode atingir `high` quando a descrição é clara.

### Added (segunda onda)
- **Tier de severidade `warn_patterns`** — 🟡 WARNING (não bloqueia) ao lado de `forbidden_patterns` (🔴 BLOCKER). Renderizado em coder/review/CLAUDE; adicionado aos perfis. Resolve falsos-BLOCKER (ex.: `console.log` em CLI).
- **Agentes Maestro e Reporter explícitos** (`commands/maestro.md`, `commands/reporter.md`) — Maestro com **rubrica de severidade** e **teto de 2 iterações → escala para humano**; Reporter com **piso** no scorecard. Instalados como `/maestro` e `/reporter`.
- **7 novos profiles**: `node-javascript`, `java-spring`, `dotnet-api`, `ruby-rails`, `php-laravel`, `vue-nuxt`, `react-native` — com **auto-detecção** (pom.xml/build.gradle, .csproj/.sln, Gemfile, composer.json, nuxt, react-native/expo, e JS-puro vs TS).
- **Metadados `tags` e `when_to_use`** em todos os profiles + listagem melhorada no `init` e `profile list` (mostra "quando usar" e sugere `generic` em caso de dúvida).

### Changed (segunda onda)
- **Coder**: regras de segredos/PII e feature flags. **Reviewer**: concorrência/race e i18n. **QA**: fixtures sem PII, testes negativos/segurança e smoke de performance. **GitHub**: CODEOWNERS, tamanho de PR, secret-scanning, branch protection. **Profiler**: monorepo/multi-stack/drift de versão. **Cost Engineer**: budget/kill-switch e custo de infra.
- **Renderer**: `{{#if}}` passa a tratar **array vazio como falsy** (não renderiza bloco vazio — corrige guardrail/warn vazios).

### Fixed
- `docs/profiles.md` corrigido: arrays são **concatenados** na herança (com sentinela `!override` para substituir), não "replaced".

### Notes
- Projetos já existentes recebem tudo no próximo `octechpus update`.
- Suíte de testes: **113 testes passando**.

## [2.3.0] - 2026-05-03

### Added
- **Karpathy principles in all agent templates** — The 4 principles (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution) are now embedded in every template generated by `octechpus init`:
  - `CLAUDE.md` gains a "Princípios de comportamento dos agentes" section visible to all contributors
  - `architect.md` gains a "Antes de qualquer análise — Pensar primeiro" block (Principles 1 & 4)
  - `coder.md` gains "Regras de Karpathy" with Simplicity + Surgical rules and a pre-delivery self-checklist (Principles 2 & 3)
  - `review.md` gains K1-K4 BLOCKER validations enforcing all 4 principles
  - `pipeline.md` Maestro step now converts vague demands into testable success criteria before routing (Principle 4)
- **ADR 001** — `docs/adr/001-karpathy-principles-in-templates.md` documents the decision and alternatives considered

### Notes
- Existing scaffolded projects receive these changes on next `octechpus update`
- No profile YAML, lib, or existing tests were modified

## [2.2.0] - 2026-05-01

### Added
- **`design_system.tokens` profile key** — controls which design tokens are installed per stack: `tailwind` (preset + CSS), `css-only` (CSS variables only), `none` (skipped). Configured in `_base.yaml` (default: `none`) and overridden per profile.
- **`copyDir` `exclude` option** — `file-ops.mjs` now accepts a `Set<string>` of relative paths to skip during directory copy; used to filter token files based on profile.

### Changed
- **All 12 agent commands always installed** — `design.md` and `cost-engineer.md` are no longer gated by `profile.agents.designer` / `profile.agents.cost_engineer`; every `octechpus init` installs the full command set regardless of profile.
- **Design system always installed** — `design-system/` folder is now part of every `init` run; token files are filtered by `profile.design_system.tokens` instead of being skipped entirely.
- **Stack-aware tokens per profile:**
  - `nextjs-react` → `tailwind` (Tailwind preset + CSS tokens)
  - `node-typescript` → `css-only` (CSS tokens only)
  - `python-fastapi` → `css-only` (CSS tokens only)
  - `go-api`, `rust-cli`, `python-cli`, `python-ai-pipeline` → `none` (no token files)
- `getActiveCommands()` simplified — no longer accepts arguments; always returns all 12 commands.

## [2.1.0] - 2026-05-01

### Added
- **Designer agent** (`/design`) now installed in `.claude/commands/design.md` — previously only rendered for `nextjs-react` projects; now available in all Octechpus repos for development reference
- **Cost Engineer agent** (`/cost`) now installed in `.claude/commands/cost-engineer.md` — previously only rendered for `python-ai-pipeline`; now available in all repos
- **CI test job** — `test.yml` workflow runs `npm test` on every push and PR
- `docs/OCTECHPUS_AGENTS.md` and `src/templates/docs/OCTECHPUS_AGENTS.md` updated to v2.1: agents reordered to canonical numbering (1-Maestro, 2-GitHub, 3-Architect, 4-Designer, 5-Coder, 6-Reviewer, 7-QA, 8-Security, 9-Docs, 10-Reporter, 11-Profiler, 12-Cost Engineer); Profiler now documented as a named agent (#11)
- `CLAUDE.md` commands table now lists all 11 slash commands including `/design`, `/profiler`, and `/cost`
- `pipeline.md` restored to full 12-agent layout with UI/Frontend routing section and conditional Designer + Cost Engineer steps

### Changed
- Pipeline diagram in `CLAUDE.md` updated to show all 12 agents with conditional markers

## [2.0.1] - 2026-04-29

### Fixed
- Removed `assert` regex from `python-fastapi` forbidden_patterns (was incorrectly rejecting legitimate pytest usage)
- `python-cli` profile structure cleaned up: framework moved to `cli.framework`, `testing.e2e` set to null
- `python-ai-pipeline` review_checklist now includes inherited Python rules from parent (was overriding silently)
- `security.md` template now uses stack-aware placeholders (`{{stack.validation.library}}` instead of hardcoded "Zod")
- `audit.md` template parameterized — no longer mentions TypeScript/JSDoc in non-TS projects
- `coder.md` numbering no longer skips when Designer is disabled
- `docs.md` no longer renders broken section headers like `### .` when API field is null
- `validateProfile` gives a clear error message when `_base.yaml` is missing

### Added
- Regression test for `python-ai-pipeline` review_checklist inheritance
- Tests for security.md rendering across profiles
- Tests for `update` command preserving user customizations
- Tests for `update --force` overriding customizations

---

## [2.0.0] - 2026-04-29

### Added
- **Profile system** — declarative YAML stack profiles; each profile defines agents, conventions, testing strategy, forbidden patterns, and doc format for a specific language/framework
- 7 built-in profiles: `python-fastapi`, `python-ai-pipeline`, `python-cli`, `nextjs-react`, `node-typescript`, `go-api`, `rust-cli`
- Profile inheritance via `extends` key — child profiles deep-merge over parent
- `src/lib/profile-loader.mjs` — loads and resolves profile inheritance
- `src/lib/stack-detector.mjs` — auto-detects stack from project files with confidence levels (high/medium/low/none)
- `src/lib/template-renderer.mjs` — renders `{{placeholder}}` tokens in templates using resolved profile values
- `src/lib/file-ops.mjs` — shared file write/hash utilities
- 🔬 **Profiler agent** (`/profiler`) — reports detected stack and suggests the matching profile
- 💰 **Cost Engineer agent** (`/cost-engineer`) — guards against runaway API spend; activated by `python-ai-pipeline`
- CLI flag `--stack=<profile>` on `init` — skips auto-detection
- Sub-commands `profile list`, `profile show <name>`, `profile current`, `profile switch <name>`
- `commandUpdate` now compares SHA-256 hashes stored in `.octechpus/manifest.json` and skips user-customized files by default
- Flag `--keep-customizations` (default: `true`); `--force` overrides and updates everything
- `commandStatus` shows active profile and detects drift (declared profile vs detected stack)
- `commandDoctor` checks profile drift and suggests `profile switch` to fix
- 74 automated tests (Vitest) covering profile-loader, stack-detector, template-renderer, cli-init, and cli-profile-commands
- `docs/profiles.md` — contributor guide for creating custom profiles

### Changed
- All agent command templates (`commands/*.md`) now use `{{placeholder}}` tokens instead of hardcoded stack references — prompts are stack-agnostic
- `init` auto-detects stack and only installs agents active in the resolved profile (e.g. `cost-engineer.md` is not created unless profile enables it)
- `commandUpdate` re-renders templates with current profile on update
- `printHelp()` updated to list all new commands and flags
- `docs/AGENTS.md` renamed to `docs/OCTECHPUS_AGENTS.md` — update any bookmarks
- `package.json` version bumped to `2.0.0`; added `js-yaml` dependency and `vitest` devDependency

### Breaking changes

- **`CLAUDE.md` structure** — now has a `Stack Profile` block at the top generated from the profile. Existing `CLAUDE.md` files are merged on `init` (your content is preserved below the generated section), but the file format changed.
- **`docs/AGENTS.md` → `docs/OCTECHPUS_AGENTS.md`** — update any links or references in your projects.
- **Agent commands are now profile-filtered** — if you `update` from 1.x, commands not active in your profile will not be refreshed. Run `octechpus update --force` to force a full refresh.

### Migration from 1.x

```bash
npm install -g github:Phaiolli/octechpus-cli
cd your-project
octechpus init        # detects stack, merges CLAUDE.md, refreshes commands
octechpus status      # verify
octechpus doctor      # fix any drift
```

See the [Migration from 1.x](README.md#migration-from-1x) section in the README for details.

---

## [1.1.0] - 2026-04-27

### Added
- 🎨 Designer agent (10th agent) — guardião do design system
- Flag `--with-design-system` no comando `init`: copia `design-system/` e instala `/design`
- Comando `octechpus design-system add` — adiciona o design system a projetos existentes
- Comando `octechpus design-system update` — sincroniza `design-system/` com a versão mais recente dos templates
- Template `src/templates/commands/design.md` com o prompt completo do Designer
- Template `src/templates/design-system/` com tokens CSS, preset Tailwind e 8 docs de princípios

### Changed
- Maestro (`pipeline.md`) agora classifica demandas (UI/Backend/Misto) e roteia para o Designer em demandas de UI
- Reviewer (`review.md`) executa checklist do design system em PRs de UI: cores hardcoded, espaçamentos arbitrários, tokens, shadcn, Lucide, focus-visible, estados, responsividade, acessibilidade
- `AGENTS.md` atualizado com o 10º agente e diagrama de fluxo incluindo o Designer
- `README.md` atualizado: tabela de 10 agentes, pipeline com Designer, docs do design system
- `commandUpdate` agora inclui `design.md` automaticamente se já estiver instalado
- `commandStatus` e `commandDoctor` reconhecem `design.md` e `design-system/` como itens opcionais

## [1.0.0] - 2026-04-01

### Added
- Pipeline de 9 agentes: Maestro, GitHub, Architect, Coder, Reviewer, QA, Security, Docs, Reporter
- Comandos: `init`, `status`, `doctor`, `update`
- Flags: `--force`, `--minimal`, `--dry-run`
- Templates: pipeline, audit, architect, review, qa, security, docs, github-issue
- CLAUDE.md, AGENTS.md, GitHub issue/PR templates
