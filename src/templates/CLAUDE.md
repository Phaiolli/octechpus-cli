# CLAUDE.md

> **Este projeto utiliza o sistema 🐙 Octechpus de orquestração de agentes.**
> Toda mudança no código — feature, bugfix, refactor, hotfix — DEVE passar pelo pipeline completo.

---

## Stack Profile

- **Profile:** {{stack.name}}
- **Linguagem:** {{stack.language}}
- **Runtime:** {{stack.runtime}}
- **Package Manager:** {{stack.package_manager}}
- **Test Framework:** {{stack.testing.framework}}
- **Validation:** {{stack.validation.library}}
- **Docs Format:** {{stack.docs.format}}
- **Linter/Formatter:** {{stack.linting.formatter}}
- **Type Checker:** {{stack.linting.type_checker}}

---

## 🐙 OCTECHPUS — Comandos

| Comando | Para quê |
|---------|----------|
| `/pipeline [demanda]` | Pipeline completo — todos os agentes em sequência |
| `/audit [escopo?]` | Raio-x completo do projeto ou módulo |
| `/architect [escopo]` | Análise arquitetural |
| `/review [escopo]` | Code review |
| `/qa [escopo]` | Criar testes |
| `/security [escopo]` | Audit de segurança |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Gestão GitHub |
{{#if stack.agents.designer}}| `/design [demanda]` | Briefing de design system (Designer agent) |
{{/if}}{{#if stack.agents.cost_engineer}}| `/cost [escopo]` | Análise de custo operacional |
{{/if}}
## Pipeline

```
Maestro → GitHub → Architect → {{#if stack.agents.designer}}Designer → {{/if}}Coder → Reviewer → QA → Security → {{#if stack.agents.cost_engineer}}Cost Engineer → {{/if}}Docs → GitHub (PR) → Reporter
```

## Regras universais

1. NENHUMA mudança vai para commit sem passar pelo pipeline
2. Se qualquer agente rejeitar, volta para o agente relevante
3. Pipeline só completo quando TODOS aprovarem
4. Relatório final incluído no PR
5. Decisões de impacto medium/high exigem ADR ANTES da implementação

## Princípios de comportamento dos agentes

Todo agente deste projeto segue os 4 princípios de Karpathy:

**1. Pensar antes de codificar** — Nunca assuma silenciosamente. Declare suas
suposições antes de agir. Quando há ambiguidade, apresente alternativas e
pergunte. Suposições não declaradas são bugs em potencial.

**2. Simplicidade primeiro** — Escreva o mínimo de código que resolve exatamente
o que foi pedido. Sem features especulativas, sem abstrações prematuras. Se a
solução tem >50% de código além do necessário, refatore antes de entregar.

**3. Mudanças cirúrgicas** — Modifique somente o que a demanda exige. Preserve
estilo, comentários e estrutura do código existente. Limpe apenas consequências
diretas das suas edições — nunca remova código morto não relacionado sem pedido
explícito.

**4. Execução orientada a objetivos** — Converta toda instrução vaga em critério
de sucesso testável antes de iniciar. "corrija o bug" → "escreva um teste que
reproduz o bug e faça-o passar". "melhore a performance" → "reduza o p99 de X
para Y medido por Z".

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
{{stack.branch_naming}}
```
Exemplo: `feature/42-new-endpoint`, `bugfix/55-validation`, `refactor/78-cleanup`

---

## Padrões da Stack

### Testes

{{stack.qa_strategy}}

Coverage target: **{{stack.testing.coverage_target}}%**

### Validação

Usar **{{stack.validation.library}}** em todas as entradas externas.

### Documentação

- Formato: **{{stack.docs.format}}**
- README.md e CHANGELOG.md atualizados a cada mudança
- ADRs em `docs/adr/` para decisões de impacto medium/high
{{#if stack.docs.api}}
- API docs ({{stack.docs.api}}) atualizadas para endpoints novos/modificados
{{/if}}
### Convenções

- Imports: {{stack.conventions.imports}}
- Naming: {{stack.conventions.naming}}

### Padrões PROIBIDOS

Os seguintes padrões NÃO devem aparecer no código deste projeto:

{{#each stack.forbidden_patterns}}
- `{{this}}`
{{/each}}

Reviewer rejeita PRs que contenham qualquer um deles automaticamente.

{{#if stack.guardrails.read_only_paths}}
### Pastas com Guardrail (read-only sem aprovação)

Os seguintes paths são protegidos — modificá-los exige label específico no PR:

{{#each stack.guardrails.read_only_paths}}
- `{{this}}`
{{/each}}
{{/if}}

## Segurança

- OWASP Top 10 checklist obrigatório
- Secrets nunca hardcoded
- Rate limiting em endpoints públicos
- Input validation com **{{stack.validation.library}}** em TODAS as entradas

## Referência dos Agentes

Consulte `docs/OCTECHPUS_AGENTS.md` para prompts detalhados de cada agente.

---

## 📋 PROJECT DOCUMENTATION

> Adicione aqui a documentação específica do seu projeto:
> stack tecnológico, estrutura de pastas, arquitetura, endpoints, schemas, etc.
