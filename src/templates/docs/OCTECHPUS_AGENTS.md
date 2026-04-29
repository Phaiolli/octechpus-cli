# 🐙 Octechpus — Agent Orchestrator Reference (v2.0)

## Visão Geral

Sistema de orquestração de agentes especializados que funciona como pipeline obrigatório para toda implementação. Cada mudança passa por todos os agentes aplicáveis em sequência, garantindo qualidade, segurança, documentação e rastreabilidade.

A partir da v2.0, o Octechpus é **agnóstico de linguagem**. As regras específicas de cada stack (TypeScript, Python, Go, Rust, etc.) vivem em **profiles YAML** — não nos prompts dos agentes. Os agentes são parametrizados; os profiles injetam os valores.

---

## Stack Profiles

Profiles ficam em `.octechpus/profiles/` (gerado pelo `init`) e definem:

| Campo | Exemplo |
|-------|---------|
| `language` | `typescript`, `python`, `go`, `rust` |
| `testing.framework` | `vitest`, `pytest`, `go_test`, `cargo_test` |
| `validation.library` | `zod`, `pydantic_v2`, `go_validator`, `serde` |
| `forbidden_patterns` | padrões proibidos no código |
| `review_checklist` | o que o Reviewer verifica |
| `qa_strategy` | como QA aborda os testes |
| `agents.designer` | `true` / `false` |
| `agents.cost_engineer` | `true` / `false` |

Profiles disponíveis na instalação:
- `node-typescript` — Node.js + TypeScript + Vitest + Zod
- `nextjs-react` — Next.js + React + Tailwind + shadcn/ui (com Designer)
- `python-fastapi` — Python + FastAPI + Pydantic v2 + pytest
- `python-cli` — Python + Click/Typer + pytest
- `python-ai-pipeline` — Python + FastAPI + LLMs + workers (com Cost Engineer)
- `go-api` — Go + chi/stdlib + testify
- `rust-cli` — Rust + clap + tokio + cargo_test

Herança: `nextjs-react` → `node-typescript` → `_base`. Profiles filhos sobrescrevem e acrescentam aos pais.

---

## Arquitetura do Pipeline

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR (Maestro)                        │
│                                                                        │
│  Input → GitHub (issue) → Architect → [Designer?] → Coder →          │
│  Reviewer → QA → Security → [Cost Engineer?] → Docs →                │
│  GitHub (PR) → Reporter → Output                                      │
│                                                                        │
│  [Designer] ativo apenas em stacks com agents.designer = true         │
│  [Cost Engineer] ativo apenas em stacks com agents.cost_engineer = true│
│  [Feedback loops: qualquer agente pode rejeitar e devolver]           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Os 12 Agentes

### 1. 🎯 MAESTRO — Orquestrador

Recebe a demanda, classifica o tipo e severidade, seleciona o pipeline correto e garante que todos os agentes executem na ordem correta.

**Prompt:** implícito no `/pipeline`

---

### 2. 🐙 GITHUB — Especialista GitHub

Cria issues, gerencia branches, prepara commits semânticos (Conventional Commits) e abre PRs.

**Prompt:** implícito no `/pipeline` e `/github-issue`

---

### 3. 📐 ARCHITECT — Arquiteto de Software

Analisa o impacto arquitetural, valida padrões da stack ativa e produz o plano detalhado para o Coder. Para mudanças medium/high, produz ADR primeiro.

**Prompt detalhado:** `.claude/commands/architect.md`

---

### 4. 🎨 DESIGNER — Guardião do Design System

*Ativo apenas em stacks com `agents.designer = true` (ex: `nextjs-react`).*

Lê o design system em `./design-system/` e produz briefing técnico para o Coder. Define componentes shadcn/ui, tokens CSS, estados e checklist para o Reviewer.

**Prompt detalhado:** `.claude/commands/design.md`

---

### 5. 💻 CODER — Implementador

Executa a implementação seguindo estritamente o plano do ARCHITECT e (em UI) o briefing do DESIGNER. Usa os padrões da stack ativa.

**Prompt detalhado:** `.claude/commands/coder.md`

---

### 6. 🔍 REVIEWER — Revisor de Código

Faz code review contra as validações universais E as validações específicas da stack ativa (checklist do profile). Classifica issues como 🔴 BLOCKER / 🟡 WARNING / 🔵 SUGGESTION.

**Prompt detalhado:** `.claude/commands/review.md`

---

### 7. 🧪 QA — Quality Assurance

Define e implementa a estratégia de testes usando o framework da stack ativa. Segue a `qa_strategy` do profile e o coverage target.

**Prompt detalhado:** `.claude/commands/qa.md`

---

### 8. 🛡️ SECURITY — Especialista em Segurança

Analisa vulnerabilidades (OWASP Top 10), validação de inputs, autenticação/autorização e exposição de dados sensíveis.

**Prompt detalhado:** `.claude/commands/security.md`

---

### 9. 💰 COST ENGINEER — Engenheiro de Custo

*Ativo apenas em stacks com `agents.cost_engineer = true` (ex: `python-ai-pipeline`).*

Protege o projeto contra bugs caros em APIs pagas: loops de chamadas, retries sem limite, ausência de cache/dedup.

**Prompt detalhado:** `.claude/commands/cost-engineer.md`

---

### 10. 📚 DOCS — Documentador

Documenta código no formato da stack ativa, atualiza README/CHANGELOG e cria ADRs quando necessário.

**Prompt detalhado:** `.claude/commands/docs.md`

---

### 11. 🐙 GITHUB (Fase 2) — PR e Commits

Prepara commits semânticos e abre o PR final com relatório consolidado de todos os agentes.

---

### 12. 📊 REPORTER — Consolidador Final

Gera o relatório final com métricas do pipeline, decisões técnicas, débitos identificados e próximos passos.

---

## Fluxo de Execução

```
DESENVOLVEDOR
     │
     ▼
┌─ MAESTRO ──────────────────────────────────────┐
│  Classifica demanda + seleciona pipeline        │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ GITHUB (Fase 1) ──────────────────────────────┐
│  Issue + branch + labels                        │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ ARCHITECT ────────────────────────────────────┐
│  Impacto + padrões da stack + ADR se necessário │
│  ❌ Rejeitou? → volta ao MAESTRO               │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ DESIGNER [se stack.agents.designer] ──────────┐
│  Briefing de UI + checklist para Reviewer       │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ CODER ────────────────────────────────────────┐
│  Implementação segundo plano do Architect       │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ REVIEWER ─────────────────────────────────────┐
│  Checklist universal + checklist da stack       │
│  ❌ Blockers? → volta ao CODER                 │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ QA ───────────────────────────────────────────┐
│  Testes com framework da stack                  │
│  ❌ Cobertura insuficiente? → cria mais testes  │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ SECURITY ─────────────────────────────────────┐
│  OWASP Top 10 + validação de inputs             │
│  ❌ Crítico? → volta ao CODER                  │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ COST ENGINEER [se stack.agents.cost_engineer] ┐
│  Audit de custo em APIs pagas                   │
│  ❌ Critical? → volta ao CODER                 │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ DOCS ─────────────────────────────────────────┐
│  Docs no formato da stack + README + CHANGELOG  │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ GITHUB (Fase 2) ──────────────────────────────┐
│  Commits semânticos + PR com relatório          │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ REPORTER ─────────────────────────────────────┐
│  Relatório final + métricas + débitos           │
└──────────────┬─────────────────────────────────┘
               ▼
     DESENVOLVEDOR (output final)
```

---

## Referência de Comandos

| Comando | Agente(s) | Descrição |
|---------|-----------|-----------|
| `/pipeline [demanda]` | Todos | Pipeline completo |
| `/audit [escopo?]` | Todos (modo audit) | Raio-x do projeto |
| `/architect [escopo]` | Architect | Análise arquitetural |
| `/review [escopo]` | Reviewer | Code review |
| `/qa [escopo]` | QA | Criar testes |
| `/security [escopo]` | Security | Audit de segurança |
| `/docs [escopo]` | Docs | Documentação |
| `/github-issue [demanda]` | GitHub | Issue + branch |
| `/design [demanda]` | Designer | Briefing UI (stacks com designer) |
| `/cost [escopo]` | Cost Engineer | Audit de custo (stacks com cost_engineer) |
