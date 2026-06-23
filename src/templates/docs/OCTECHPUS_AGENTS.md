# 🐙 Octechpus — Agent Orchestrator Reference (v2.4)

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
- `node-javascript` — Node.js puro (JavaScript, sem TypeScript)
- `nextjs-react` — Next.js + React + Tailwind + shadcn/ui
- `vue-nuxt` — Vue 3 + Nuxt + Tailwind
- `react-native` — React Native / Expo (mobile)
- `python-fastapi` — Python + FastAPI + Pydantic v2 + pytest
- `python-cli` — Python + Click/Typer + pytest
- `python-ai-pipeline` — Python + FastAPI + LLMs + workers (com Cost Engineer)
- `go-api` — Go + chi/stdlib + testify
- `rust-cli` — Rust + clap + tokio + cargo_test
- `java-spring` — Java + Spring Boot + JUnit 5
- `dotnet-api` — C# + ASP.NET Core + xUnit
- `ruby-rails` — Ruby on Rails + RSpec
- `php-laravel` — PHP + Laravel + Pest/PHPStan
- `generic` — fallback agnóstico de stack (use quando nenhum profile específico encaixa)

Herança: `nextjs-react` → `node-typescript` → `_base`. Profiles filhos sobrescrevem e acrescentam aos pais.

> **A partir da v2.4:** o **Designer** é always-on e stack-agnóstico (não traz
> design system pronto — pede o do Claude Design em runtime) e há um novo agente
> **Privacy/LGPD** sempre ativo. Apenas o **Cost Engineer** segue opcional (flag
> `agents.cost_engineer`).

---

## Arquitetura do Pipeline

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR (Maestro)                        │
│                                                                        │
│  Input → GitHub (issue) → Architect → Designer → Coder →             │
│  Reviewer → QA → Security → Privacy → [Cost Engineer?] → Docs →      │
│  GitHub (PR) → Reporter → Output                                      │
│                                                                        │
│  [Designer] always-on, mas só atua em demandas de UI                  │
│  [Privacy] always-on (framework via compliance.framework)             │
│  [Cost Engineer] ativo apenas em stacks com agents.cost_engineer = true│
│  [Feedback loops: qualquer agente pode rejeitar e devolver]           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Os 13 Agentes

### 1. 🎯 MAESTRO — Orquestrador

Recebe a demanda, classifica o tipo e severidade (rubrica explícita), converte em critérios testáveis, seleciona o pipeline e controla os feedback loops (teto de 2 rejeições → escala para humano).

**Prompt detalhado:** `.claude/commands/maestro.md`

---

### 2. 🐙 GITHUB — Especialista GitHub

Cria issues, gerencia branches, prepara commits semânticos (Conventional Commits) e abre PRs.

**Prompt:** implícito no `/pipeline` e `/github-issue`

---

### 3. 📐 ARCHITECT — Arquiteto de Software

Analisa o impacto arquitetural, valida padrões da stack ativa e produz o plano detalhado para o Coder. Para mudanças medium/high, produz ADR primeiro.

**Prompt detalhado:** `.claude/commands/architect.md`

---

### 4. 🎨 DESIGNER — Guardião de UX/UI

*Always-on e stack-agnóstico (a partir da v2.4). Só atua em demandas de UI.*

NÃO traz tokens nem design system prontos. Carrega as **regras e melhores práticas
de UX/UI** (responsividade, acessibilidade WCAG AA, estados completos, consistência)
e, no processo, **pede o design system do Claude Design** para segui-lo. Produz um
briefing técnico para o Coder e a checklist para o Reviewer.

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

Analisa vulnerabilidades (OWASP Top 10 **2021** + API Security Top 10 / BOLA/BFLA, SSRF, supply chain), validação de inputs, autenticação/autorização e exposição de dados sensíveis.

**Prompt detalhado:** `.claude/commands/security.md`

---

### 8b. ⚖️ PRIVACY — Conformidade / Proteção de Dados

*Always-on (a partir da v2.4). Framework via `compliance.framework` (`lgpd` por padrão).*

Cuida do uso **legal e legítimo** do dado pessoal: base legal e finalidade,
minimização, PII em logs/fixtures, direitos do titular, retenção/descarte,
transferência internacional e necessidade de RIPD/DPIA. Roda após o Security.

**Prompt detalhado:** `.claude/commands/privacy.md`

---

### 9. 📚 DOCS — Documentador

Documenta código no formato da stack ativa, atualiza README/CHANGELOG e cria ADRs quando necessário.

**Prompt detalhado:** `.claude/commands/docs.md`

---

### 10. 📊 REPORTER — Consolidador Final

Gera o relatório final com métricas do pipeline, decisões técnicas, débitos e próximos passos. Scorecard com **piso** (Segurança/Privacidade < 4 capa o geral). Inclui o relatório no PR description.

**Prompt detalhado:** `.claude/commands/reporter.md`

---

### 11. 🔬 PROFILER — Detector de Stack

Auto-detecta a stack do projeto na instalação (`octechpus init`) e pode ser invocado a qualquer momento para verificar drift entre o profile declarado e a stack real.

**Prompt detalhado:** `.claude/commands/profiler.md`

---

### 12. 💰 COST ENGINEER — Engenheiro de Custo

*Ativo apenas em stacks com `agents.cost_engineer = true` (ex: `python-ai-pipeline`).*

Protege o projeto contra bugs caros em APIs pagas: loops de chamadas, retries sem limite, ausência de cache/dedup. Roda após Security, antes de Docs.

**Prompt detalhado:** `.claude/commands/cost-engineer.md`

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
│  OWASP 2021 + API Top 10 + validação de inputs  │
│  ❌ Crítico? → volta ao CODER                  │
└──────────────┬─────────────────────────────────┘
               ▼
┌─ PRIVACY ──────────────────────────────────────┐
│  Conformidade (LGPD/GDPR) + proteção de dados   │
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
| `/maestro [demanda]` | Maestro | Classificação + severidade + roteamento |
| `/audit [escopo?]` | Todos (modo audit) | Raio-x do projeto |
| `/architect [escopo]` | Architect | Análise arquitetural |
| `/design [demanda]` | Designer | Briefing UX/UI (always-on; pede o design system do Claude Design) |
| `/review [escopo]` | Reviewer | Code review |
| `/qa [escopo]` | QA | Criar testes |
| `/security [escopo]` | Security | Audit de segurança (OWASP 2021 + API Top 10) |
| `/privacy [escopo]` | Privacy | Conformidade / proteção de dados (LGPD/GDPR) |
| `/docs [escopo]` | Docs | Documentação |
| `/github-issue [demanda]` | GitHub | Issue + branch |
| `/profiler` | Profiler | Re-detectar stack e verificar drift |
| `/reporter [escopo]` | Reporter | Relatório consolidado do pipeline |
| `/cost [escopo]` | Cost Engineer | Audit de custo (stacks com `agents.cost_engineer = true`) |
