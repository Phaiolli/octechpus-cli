# CLAUDE.md

> **Este projeto utiliza o sistema 🐙 Octechpus de orquestração de agentes.**
> Toda mudança no código — feature, bugfix, refactor, hotfix — DEVE passar pelo pipeline completo.

---

## 🐙 OCTECHPUS — Agent Orchestrator

### Comandos

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

### Pipeline

```
Maestro → GitHub (issue) → Architect → Coder → Reviewer → QA → Security → Docs → GitHub (PR) → Reporter
```

### Regras

1. NENHUMA mudança vai para commit sem passar por TODOS os agentes
2. Se qualquer agente rejeitar, o pipeline volta e corrige
3. O pipeline só é completo quando TODOS aprovarem
4. O relatório final deve ser incluído na PR

### Commits — Conventional Commits

```
feat(scope): descrição       # Nova funcionalidade
fix(scope): descrição        # Correção de bug
refactor(scope): descrição   # Refatoração
docs(scope): descrição       # Documentação
test(scope): descrição       # Testes
chore(scope): descrição      # Manutenção
perf(scope): descrição       # Performance
```

### Branches

```
feature/[issue-number]-[short-description]
bugfix/[issue-number]-[short-description]
refactor/[issue-number]-[short-description]
hotfix/[issue-number]-[short-description]
```

### Testes

- **Unitários (Vitest):** 100% de cobertura em funções novas
- **Integração (Vitest + Testing Library):** Componentes com lógica de negócio
- **E2E (Playwright):** Fluxos críticos de usuário

### Segurança

- Input validation com Zod em TODAS as entradas
- Tokens validados em rotas protegidas
- Dados sensíveis NUNCA em logs, frontend ou URLs
- Secrets NUNCA hardcoded
- Rate limiting em endpoints públicos

### Documentação

- JSDoc/TSDoc em funções e componentes exportados
- README.md e CHANGELOG.md atualizados
- ADRs em `docs/adr/` para decisões significativas

### Referência dos Agentes

Consulte `docs/AGENTS.md` para prompts detalhados de cada agente.

---

## 📋 PROJECT DOCUMENTATION

> Adicione aqui a documentação específica do seu projeto:
> stack tecnológico, estrutura de pastas, arquitetura, endpoints, schemas, etc.
