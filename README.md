# 🐙 Octechpus

**Agent Orchestrator System for Claude Code projects.**

Pipeline de 9 agentes de IA especializados que revisam, testam, protegem e documentam cada mudança no seu código.

## Instalação

### Opção 1 — Direto do GitHub (sem instalar nada)

```bash
npx github:SEU_USUARIO/octechpus init
```

### Opção 2 — Do npm (após publicar)

```bash
npx octechpus init
```

### Opção 3 — Instalar globalmente

```bash
# Do GitHub
npm install -g github:SEU_USUARIO/octechpus

# Ou do npm
npm install -g octechpus

# Depois usa em qualquer projeto:
octechpus init
```

## Uso

```bash
cd meu-projeto

octechpus init              # Setup completo
octechpus init --minimal    # Só commands do Claude Code
octechpus init --dry-run    # Preview sem escrever
octechpus init --force      # Sobrescrever existentes
octechpus status            # Verificar setup
octechpus doctor            # Diagnosticar problemas
octechpus update            # Atualizar commands
```

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
│   └── github-issue.md              /github-issue
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

## Comandos no Claude Code

Após o `init`, abra o Claude Code no projeto e use:

| Comando | Para quê |
|---------|----------|
| `/pipeline [demanda]` | Pipeline completo — todos os 9 agentes |
| `/audit [escopo?]` | Raio-x do projeto com scorecard |
| `/review [escopo]` | Code review |
| `/security [escopo]` | Audit de segurança OWASP |
| `/qa [escopo]` | Criar testes (unit, integration, E2E) |
| `/architect [escopo]` | Análise arquitetural |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Criar issue no GitHub |

## Os 9 Agentes

```
Maestro → GitHub → Architect → Coder → Reviewer → QA → Security → Docs → Reporter
```

| # | Agente | Função |
|---|--------|--------|
| 1 | 🎯 Maestro | Orquestra, classifica e roteia |
| 2 | 🐙 GitHub | Issues, branches, commits, PRs |
| 3 | 📐 Architect | Impacto e planejamento técnico |
| 4 | 💻 Coder | Implementação |
| 5 | 🔍 Reviewer | Code review com severidade |
| 6 | 🧪 QA | Testes unitários, integração e E2E |
| 7 | 🛡️ Security | OWASP Top 10 + vulnerabilidades |
| 8 | 📚 Docs | JSDoc, README, CHANGELOG, ADRs |
| 9 | 📊 Reporter | Relatório final com métricas |

## Projetos existentes

Funciona com projetos em andamento. Detecta `CLAUDE.md` existente e faz merge automático.

```bash
cd projeto-existente
octechpus init
octechpus status
```

## License

MIT
