# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
