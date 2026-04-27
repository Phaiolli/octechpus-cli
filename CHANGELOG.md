# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
