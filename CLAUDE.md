# CLAUDE.md

> **Este projeto utiliza o sistema 🐙 Octechpus de orquestração de agentes.**
> Toda mudança no código — feature, bugfix, refactor, hotfix — DEVE passar pelo pipeline completo.

---

## Stack Profile

- **Profile:** node-typescript
- **Linguagem:** typescript
- **Runtime:** node>=18
- **Package Manager:** npm
- **Test Framework:** vitest
- **Validation:** zod
- **Docs Format:** tsdoc
- **Linter/Formatter:** prettier
- **Type Checker:** tsc_strict

---

## 🐙 OCTECHPUS — Comandos

| Comando | Para quê |
|---------|----------|
| `/pipeline [demanda]` | Pipeline completo — todos os agentes em sequência |
| `/audit [escopo?]` | Raio-x completo do projeto ou módulo |
| `/architect [escopo]` | Análise arquitetural |
| `/design [demanda]` | Briefing de design system — stacks com `agents.designer = true` |
| `/review [escopo]` | Code review |
| `/qa [escopo]` | Criar testes |
| `/security [escopo]` | Audit de segurança |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Gestão GitHub |
| `/profiler` | Re-detectar stack e verificar drift de profile |
| `/cost [escopo]` | Audit de custo operacional — stacks com `agents.cost_engineer = true` |

## Pipeline

```
Maestro → GitHub → Architect → [Designer*] → Coder → Reviewer → QA → Security → [Cost Engineer*] → Docs → GitHub (PR) → Reporter
* Designer: ativo em nextjs-react  |  * Cost Engineer: ativo em python-ai-pipeline
```

## Regras universais

1. NENHUMA mudança vai para commit sem passar pelo pipeline
2. Se qualquer agente rejeitar, volta para o agente relevante
3. Pipeline só completo quando TODOS aprovarem
4. Relatório final incluído no PR
5. Decisões de impacto medium/high exigem ADR ANTES da implementação

## Conventional Commits

```
feat(scope): nova funcionalidade
fix(scope): correção de bug
refactor(scope): refatoração
docs(scope): documentação
test(scope): testes
chore(scope): manutenção
perf(scope): performance
```

## Branches

```
[type]/[issue-number]-[description]
```
Exemplo: `feature/42-new-endpoint`, `bugfix/55-validation`, `refactor/78-cleanup`

---

## Padrões da Stack

### Testes

- Vitest unit tests for 100% of new public functions
- Testing Library for React component tests (user interactions, not implementation)
- MSW for mocking HTTP in integration tests
- Playwright for critical E2E flows
- Coverage threshold: 80% lines/branches


Coverage target: **80%**

### Validação

Usar **zod** em todas as entradas externas.

### Documentação

- Formato: **tsdoc**
- README.md e CHANGELOG.md atualizados a cada mudança
- ADRs em `docs/adr/` para decisões de impacto medium/high

- API docs (openapi) atualizadas para endpoints novos/modificados

### Convenções

- Imports: absolute_with_aliases
- Naming: camelCase_functions_PascalCase_classes

### Padrões PROIBIDOS

Os seguintes padrões NÃO devem aparecer no código deste projeto:


- `console\.log\(`

- `: any`

- `as any`

- `// @ts-ignore`

- `<div onClick`

- `JSON\.parse\([^)]+\)(?!.*catch)`


Reviewer rejeita PRs que contenham qualquer um deles automaticamente.


### Pastas com Guardrail (read-only sem aprovação)

Os seguintes paths são protegidos — modificá-los exige label específico no PR:




## Segurança

- OWASP Top 10 checklist obrigatório
- Secrets nunca hardcoded
- Rate limiting em endpoints públicos
- Input validation com **zod** em TODAS as entradas

## Referência dos Agentes

Consulte `docs/OCTECHPUS_AGENTS.md` para prompts detalhados de cada agente.

---

## 📋 PROJECT DOCUMENTATION

> Adicione aqui a documentação específica do seu projeto:
> stack tecnológico, estrutura de pastas, arquitetura, endpoints, schemas, etc.
