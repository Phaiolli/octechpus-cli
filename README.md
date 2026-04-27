# 🐙 Octechpus

**Agent Orchestrator System for Claude Code projects.**

Pipeline de 10 agentes de IA especializados que revisam, testam, protegem e documentam cada mudança no seu código — incluindo um guardião de design system.

---

## Instalação

### Sem instalar nada (npx via GitHub)

```bash
npx github:Phaiolli/octechpus-cli init
```

### Instalar globalmente

```bash
npm install -g github:Phaiolli/octechpus-cli
```

Depois usa em qualquer projeto:

```bash
octechpus init
```

### Atualizar

```bash
npm install -g github:Phaiolli/octechpus-cli
```

---

## Uso

```bash
octechpus init                        # Setup completo
octechpus init --with-design-system   # Setup + Designer agent + design-system/
octechpus init --minimal              # Só commands do Claude Code
octechpus init --dry-run              # Preview sem escrever
octechpus init --force                # Sobrescrever existentes
octechpus status                      # Verificar setup
octechpus doctor                      # Diagnosticar problemas
octechpus update                      # Atualizar commands para a versão mais recente
octechpus design-system add           # Adicionar design system a projeto existente
octechpus design-system update        # Sincronizar design-system/ com a versão mais recente
```

---

## O que é criado

```
seu-projeto/
├── .claude/commands/              ← Comandos dos agentes
│   ├── pipeline.md                   /pipeline
│   ├── audit.md                      /audit
│   ├── architect.md                  /architect
│   ├── review.md                     /review
│   ├── qa.md                         /qa
│   ├── security.md                   /security
│   ├── docs.md                       /docs
│   ├── github-issue.md               /github-issue
│   └── design.md                     /design  (com --with-design-system)
├── design-system/                 ← Tokens, docs e templates (com --with-design-system)
│   ├── CLAUDE.md
│   ├── README.md
│   ├── docs/                         8 princípios do design system
│   ├── tokens/                       tokens.css + tailwind.preset.js
│   └── templates/
├── .github/
│   ├── ISSUE_TEMPLATE/            ← Templates de issue
│   │   ├── feature.md
│   │   ├── bug.md
│   │   └── refactor.md
│   └── PULL_REQUEST_TEMPLATE.md   ← Template de PR
├── docs/
│   ├── AGENTS.md                  ← Referência completa dos agentes
│   └── adr/                       ← Architecture Decision Records
├── CLAUDE.md                      ← Config do projeto (Claude Code lê isso)
└── CHANGELOG.md
```

---

## Comandos no Claude Code

Após o `init`, abra o Claude Code no projeto e use:

| Comando | Para quê |
|---------|----------|
| `/pipeline [demanda]` | Pipeline completo — todos os agentes em sequência |
| `/audit [escopo?]` | Raio-x do projeto com scorecard |
| `/review [escopo]` | Code review com severidade |
| `/security [escopo]` | Audit de segurança OWASP |
| `/qa [escopo]` | Criar testes (unit, integration, E2E) |
| `/architect [escopo]` | Análise arquitetural |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Criar issue no GitHub |
| `/design [demanda]` | Briefing de design system para UI (requer `--with-design-system`) |

---

## Os 10 Agentes

```
Maestro → GitHub → Architect → 🎨 Designer (se UI) → Coder → Reviewer → QA → Security → Docs → Reporter
```

| # | Agente | Função |
|---|--------|--------|
| 1 | 🎯 Maestro | Orquestra, classifica e roteia pelo pipeline correto |
| 2 | 🐙 GitHub | Issues, branches, commits, PRs |
| 3 | 📐 Architect | Impacto e planejamento técnico |
| 4 | 🎨 Designer | Guardião do design system — briefing técnico para demandas de UI |
| 5 | 💻 Coder | Implementação |
| 6 | 🔍 Reviewer | Code review com severidade + checklist do design system em PRs de UI |
| 7 | 🧪 QA | Testes unitários, integração e E2E |
| 8 | 🛡️ Security | OWASP Top 10 + vulnerabilidades |
| 9 | 📚 Docs | JSDoc, README, CHANGELOG, ADRs |
| 10 | 📊 Reporter | Relatório final com métricas |

---

## Design System

O flag `--with-design-system` ativa o **Designer** — o 10º agente do pipeline, guardião do seu design system.

O que ele faz:
- Lê os princípios, tokens e padrões em `./design-system/` antes de qualquer implementação de UI
- Produz um **briefing técnico** (layout, componentes shadcn/ui, tokens CSS, estados, responsividade) que o Coder segue literalmente
- Rejeita implementações com cores hardcoded, espaçamentos arbitrários ou ausência de estados
- Consulta o Reviewer via checklist em todo PR que toque UI

**Adicionar a um projeto já inicializado:**

```bash
octechpus design-system add
```

**Sincronizar com a versão mais recente dos templates:**

```bash
octechpus design-system update
```

---

## Projetos existentes

Funciona com projetos em andamento. Detecta `CLAUDE.md` existente e faz merge automático.

```bash
cd projeto-existente
octechpus init
octechpus status
```

---

## License

MIT
