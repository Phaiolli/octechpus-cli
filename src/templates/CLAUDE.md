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
| `/security [escopo]` | Audit de segurança (OWASP 2021 + API Top 10) |
| `/privacy [escopo]` | Conformidade / proteção de dados ({{stack.compliance.framework}}) |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Gestão GitHub |
| `/design [demanda]` | Briefing de UX/UI (Designer agent) |
{{#if stack.agents.cost_engineer}}| `/cost [escopo]` | Análise de custo operacional |
{{/if}}
## Pipeline

```
Maestro → GitHub → Architect → Designer → Coder → Reviewer → QA → Security → Privacy → {{#if stack.agents.cost_engineer}}Cost Engineer → {{/if}}Docs → GitHub (PR) → Reporter
```

> O **Designer** é stack-agnóstico: não traz tokens prontos — ele aplica as
> melhores práticas de UX/UI e pede o **design system do Claude Design** durante o
> processo. Só atua em demandas de UI.

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

Reviewer rejeita PRs que contenham qualquer um deles automaticamente (🔴 BLOCKER).
{{#if stack.warn_patterns}}
### Padrões desencorajados (🟡 WARNING)

Não bloqueiam, mas o Reviewer sinaliza — use só com justificativa:

{{#each stack.warn_patterns}}
- `{{this}}`
{{/each}}
{{/if}}

{{#if stack.guardrails.read_only_paths}}
### Pastas com Guardrail (read-only sem aprovação)

Os seguintes paths são protegidos — modificá-los exige label específico no PR:

{{#each stack.guardrails.read_only_paths}}
- `{{this}}`
{{/each}}
{{/if}}

## Segurança

- OWASP Top 10 (2021) + API Security Top 10 (BOLA/BFLA) obrigatórios
- Secrets nunca hardcoded; dependências auditadas (supply chain)
- Rate limiting em endpoints públicos
- Input validation com **{{stack.validation.library}}** em TODAS as entradas

## Privacidade / Conformidade ({{stack.compliance.framework}})

- Todo tratamento de **dado pessoal** tem base legal e finalidade declaradas
- **Minimização:** coletar só o necessário
- **Zero PII** em logs, telemetria e fixtures (dado de teste é sintético)
- Direitos do titular (acesso, correção, eliminação, portabilidade) viáveis
- Retenção com prazo definido; transferência internacional com salvaguarda
- RIPD/DPIA para tratamento de alto risco

## Referência dos Agentes

Consulte `docs/OCTECHPUS_AGENTS.md` para prompts detalhados de cada agente.

---

## 📋 PROJECT DOCUMENTATION

> Adicione aqui a documentação específica do seu projeto:
> stack tecnológico, estrutura de pastas, arquitetura, endpoints, schemas, etc.
