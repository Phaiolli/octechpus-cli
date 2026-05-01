# 🐙 Octechpus 2.2

Multi-stack agent orchestrator for Claude Code projects.

---

## What's new in 2.2

- **All 12 agents always installed** — every `octechpus init` creates the full command set; no more profile-gated omissions
- **Design system always scaffolded** — `design-system/` is installed on every project; token files are filtered by stack
- **Stack-aware design tokens** — `design_system.tokens` profile key controls what gets copied: `tailwind` (preset + CSS), `css-only` (CSS variables), or `none` (tokens skipped for pure backend/CLI stacks)

---

## Installation

### Without installing (npx via GitHub)

```bash
npx github:Phaiolli/octechpus-cli init
```

### Install globally

```bash
npm install -g github:Phaiolli/octechpus-cli
octechpus init
```

### Update

```bash
npm install -g github:Phaiolli/octechpus-cli
```

---

## Quick start

### Auto-detect (recommended)

```bash
npx github:Phaiolli/octechpus-cli init
```

Octechpus inspects your project files (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`) and selects the best-matching profile automatically. High-confidence detections apply immediately; ambiguous cases ask for confirmation.

### Explicit stack

```bash
npx github:Phaiolli/octechpus-cli init --stack=python-fastapi
```

---

## Available profiles

| Profile | Description | Key stack |
|---------|-------------|-----------|
| `python-fastapi` | Python FastAPI backend with Pydantic v2 + pytest | Python ≥ 3.12, uv, ruff, mypy |
| `python-ai-pipeline` | AI/ML pipeline with LLM orchestration | Inherits python-fastapi + Cost Engineer agent |
| `python-cli` | Python CLI tool | Click/Typer, pytest |
| `nextjs-react` | Next.js + React + Tailwind + shadcn/ui | Inherits node-typescript + Designer agent |
| `node-typescript` | Node.js + TypeScript projects | Vitest, Zod, JSDoc |
| `go-api` | Go HTTP API | chi or stdlib, testify |
| `rust-cli` | Rust CLI tool | clap, tokio, cargo test |

> All profiles inherit from `_base`, which defines the universal pipeline rules, security checklist, and agent defaults.

---

## How profiles work

Each profile is a YAML file in `src/profiles/`. A concrete profile may extend another via `extends: <parent>`, and the loader deep-merges keys bottom-up: the child wins on conflicts.

```
_base.yaml
  ├── python-fastapi.yaml
  │     ├── python-ai-pipeline.yaml   (adds Cost Engineer)
  │     └── python-cli.yaml
  └── node-typescript.yaml
        └── nextjs-react.yaml         (adds Designer)
```

When you run `octechpus init`, the resolved profile (parent + child merged) is used to:

1. Render each template in `.claude/commands/` — placeholders like `{{language}}` and `{{testing.framework}}` are replaced with the profile's values
2. Control which design tokens are installed via `design_system.tokens` (`tailwind` / `css-only` / `none`)
3. Write the `Stack Profile` section in `CLAUDE.md` so Claude Code knows the stack

All 12 agent commands are installed on every project regardless of profile.

### Customizations are preserved on update

`octechpus update` stores a SHA-256 hash of each generated file in `.octechpus/manifest.json`. On subsequent updates it compares the stored hash with the current file content. Files you've edited diverge from the stored hash and are **skipped by default**. Use `--force` to override.

---

## The 12 agents

```
Maestro → GitHub → Architect → 🎨 Designer → Coder → Reviewer → QA → Security → Docs → Reporter
                                       ↑ runs before Coder on UI tasks
                                                                          🔬 Profiler  💰 Cost Engineer
```

| # | Agent | Function |
|---|-------|----------|
| 1 | 🎯 Maestro | Orchestrates the pipeline, classifies demand (UI / Backend / Mixed), routes to Designer when needed |
| 2 | 🐙 GitHub | Issues, branch naming, semantic commits, PRs |
| 3 | 📐 Architect | Technical impact analysis, ADR authoring |
| 4 | 🎨 Designer | Design system guardian — produces technical briefing for UI tasks |
| 5 | 💻 Coder | Implementation, following the stack profile rules |
| 6 | 🔍 Reviewer | Code review with severity levels + design system checklist on UI PRs |
| 7 | 🧪 QA | Unit, integration and E2E tests |
| 8 | 🛡️ Security | OWASP Top 10 + secrets scan |
| 9 | 📚 Docs | JSDoc, README, CHANGELOG, ADRs |
| 10 | 📊 Reporter | Final pipeline report with metrics |
| 11 | 🔬 Profiler | Auto-detects stack on `init`; run `/profiler` anytime to re-check |
| 12 | 💰 Cost Engineer | Guards against runaway API spend — especially useful in AI/ML projects |

---

## Commands

### Claude Code slash commands

After `init`, open Claude Code in the project and use:

| Command | Purpose |
|---------|---------|
| `/pipeline [demand]` | Full pipeline — all agents in sequence |
| `/audit [scope?]` | Project X-ray with scorecard |
| `/architect [scope]` | Architectural impact analysis |
| `/review [scope]` | Code review with severity |
| `/qa [scope]` | Generate tests (unit, integration, E2E) |
| `/security [scope]` | OWASP security audit |
| `/docs [scope]` | Documentation |
| `/github-issue [demand]` | Create GitHub issue |
| `/profiler` | Re-detect and report the current stack |
| `/design [demand]` | Design system briefing for UI tasks |
| `/cost [scope]` | Cost audit — API spend, infra, dependencies |

### CLI commands

```
octechpus init                          Setup in current project (auto-detect stack)
octechpus init --stack=<profile>        Setup with explicit stack
octechpus status                        Check setup and active profile
octechpus doctor                        Diagnose issues, check for drift
octechpus update                        Update commands (preserves customizations)
octechpus profile list                  List available stack profiles
octechpus profile show <name>           Show resolved profile (after inheritance)
octechpus profile current               Show active profile of current project
octechpus profile switch <name>         Switch project to a different profile
octechpus design-system add             Add/re-add design system to project
octechpus design-system update          Sync design-system/ with latest templates
octechpus help                          Show help
```

### CLI flags

```
--stack=<name>            Explicit profile (skips auto-detection)
--force                   Overwrite without asking
--minimal                 Only .claude/commands (no docs, no GitHub templates)
--dry-run                 Preview without writing
--with-design-system      Include Designer + design-system/
--keep-customizations     Update preserves edited files (default: true)
```

---

## What gets created

```
your-project/
├── .claude/commands/              ← All 12 agent slash commands (always installed)
│   ├── pipeline.md                   /pipeline
│   ├── audit.md                      /audit
│   ├── architect.md                  /architect
│   ├── coder.md                      /coder
│   ├── review.md                     /review
│   ├── qa.md                         /qa
│   ├── security.md                   /security
│   ├── docs.md                       /docs
│   ├── github-issue.md               /github-issue
│   ├── profiler.md                   /profiler
│   ├── cost-engineer.md              /cost
│   └── design.md                     /design
├── design-system/                 ← Design system (always installed)
│   ├── docs/                         8 design docs (principles → accessibility)
│   ├── templates/
│   ├── tokens/tokens.css             CSS variables  (frontend stacks)
│   ├── tokens/tailwind.preset.js     Tailwind preset (nextjs-react only)
│   ├── CLAUDE.md
│   └── README.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── OCTECHPUS_AGENTS.md        ← Full agent reference
│   └── adr/                       ← Architecture Decision Records
├── .octechpus/
│   └── manifest.json              ← File hashes for customization tracking
└── CLAUDE.md                      ← Project config (read by Claude Code)
```

---

## Creating a custom profile

1. Create `src/profiles/my-stack.yaml` extending the closest base:

```yaml
extends: _base          # or python-fastapi, node-typescript, etc.
name: my-stack
description: "My custom stack"

language: kotlin
runtime: "jvm>=21"
package_manager: gradle

testing:
  framework: junit5
  coverage_target: 80

# ... fill all required_placeholders from _base.yaml
```

2. Run validation:

```bash
node src/cli.mjs profile show my-stack
```

3. Use it:

```bash
octechpus init --stack=my-stack
```

See `docs/profiles.md` for the full specification of the profile schema and all available keys.

---

## Migration from 1.x

### Breaking changes in 2.0

- `CLAUDE.md` now has a `Stack Profile` section at the top — if you have a hand-crafted `CLAUDE.md`, run `octechpus init --stack=<your-stack>` and it will merge the new section while preserving your content below
- `docs/AGENTS.md` renamed to `docs/OCTECHPUS_AGENTS.md` — update any links or references
- Agent commands now use stack-specific placeholders instead of hardcoded language names — if you've customized any `.claude/commands/*.md`, your edits will be preserved on `octechpus update`

### Migration steps

```bash
# 1. Update the CLI
npm install -g github:Phaiolli/octechpus-cli

# 2. Re-run init in your project (detects stack automatically)
cd your-project
octechpus init

# 3. Verify
octechpus status
octechpus doctor
```

If you had a custom `CLAUDE.md`, init will merge automatically. If you had customized command files, they will be detected and skipped — review them manually and decide whether to adopt the new templates with `octechpus update --force`.

---

## Existing projects

Works with projects already in progress. Detects existing `CLAUDE.md` and merges automatically.

```bash
cd existing-project
octechpus init
octechpus status
```

---

## License

MIT
