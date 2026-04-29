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

## Design System — Tokens de Referência

O design system padrão usa **tema dark** como base, com suporte a light via `[data-theme="light"]`. Todos os valores são CSS custom properties consumidos pelo preset Tailwind.

### Paleta de Cores

#### Brand / Accent
| Token | Valor | Cor | Uso |
|-------|-------|-----|-----|
| `--accent` | `#6366f1` | ![indigo](https://via.placeholder.com/14/6366f1/6366f1.png) Indigo | Botão primário, links, foco |
| `--accent-2` | `#06b6d4` | ![cyan](https://via.placeholder.com/14/06b6d4/06b6d4.png) Cyan | Destaque secundário, gráficos |
| `gradient-accent` | `indigo → purple` | `▓▓▓▓` → `▒▒▒▒` | Botão hero, badges Pro/Beta |

```css
/* Gradiente principal */
background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
```

#### Backgrounds (Dark Theme)
| Token | Valor | Nível |
|-------|-------|-------|
| `--bg-base` | `#0a0a0f` | Fundo principal da página |
| `--bg-subtle` | `#111114` | Áreas afastadas, sidebars |
| `--bg-elevated` | `#18181c` | Cards, painéis, modais |

#### Semântica
| Token | Cor | Uso |
|-------|-----|-----|
| `--success` | `#10b981` | Confirmações, status OK |
| `--warning` | `#f59e0b` | Alertas, atenção |
| `--danger` | `#ef4444` | Erros, destrutivo |
| `--info` | `#3b82f6` | Informativo, dicas |

### Escala de Espaçamento

Base **4px** — toda composição usa múltiplos desta unidade:

```
space-1  ▏ 4px   — gap interno (ícone + texto)
space-2  ▎ 8px   — padding de badge/chip
space-3  ▍ 12px  — padding de botão (vertical)
space-4  ▌ 16px  — padding de card (padrão)
space-6  ▋ 24px  — gap entre campos de form
space-8  █ 32px  — gap entre seções relacionadas
space-12 ██ 48px — gap entre seções distintas
space-16 ███ 64px — padding de section hero
```

### Escala Tipográfica

Fonte padrão: **Inter** (sans) · **JetBrains Mono** (mono)

```
text-xs   11px  — labels, captions, tags
text-sm   12px  — meta, hints, tooltips
text-base 14px  — body de dashboard (padrão)
text-md   15px  — body confortável
text-lg   16px  — destaques inline
text-xl   18px  — subtítulos de seção
text-2xl  22px  — títulos de seção
text-3xl  28px  — títulos de página
text-4xl  36px  — títulos grandes / hero
```

### Border Radius

```
radius-xs   4px  — chips pequenos, badges
radius-sm   6px  — inputs, selects
radius-md   8px  — botões, cards compactos
radius-lg  12px  — cards padrão
radius-xl  16px  — modais, drawers
radius-2xl 24px  — painéis grandes
radius-full ∞   — pills, avatares
```

### Glassmorphism

Classe utilitária `.glass` — usada em sidebars, modals e popovers:

```css
.glass {
  background: hsl(var(--surface-glass));     /* white @ 3% */
  backdrop-filter: blur(16px);
  border: 1px solid hsl(var(--border-default)); /* white @ 10% */
}
```

> **Regra:** glassmorphism apenas quando sobrepõe conteúdo. Nunca em backgrounds grandes ou cards comuns.

### Z-Index Scale

```
z-dropdown  1000  — menus, selects
z-sticky    1100  — topbar fixa
z-overlay   1200  — fundo de modal
z-modal     1300  — modal
z-popover   1400  — popovers, datepicker
z-tooltip   1500  — tooltips
z-toast     1600  — notificações
```

### Integração com Tailwind

```js
// tailwind.config.js
module.exports = {
  presets: [require('./design-system/tokens/tailwind.preset.js')],
}
```

```css
/* globals.css ou app/layout.tsx */
@import './design-system/tokens/tokens.css';
```

Exemplos de uso:

```tsx
// Botão primário com gradiente
<button className="gradient-accent text-white px-4 py-2 rounded-lg focus-ring">
  Salvar
</button>

// Card glass
<div className="glass rounded-xl p-6">
  <h2 className="text-text-primary font-semibold text-xl">Título</h2>
  <p className="text-text-secondary text-base">Descrição</p>
</div>

// Badge semântico
<span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded-full">
  Ativo
</span>
```

### Princípios Chave

| # | Princípio | Regra rápida |
|---|-----------|-------------|
| 1 | Clareza acima de estética | Interface legível em 3 segundos |
| 2 | Hierarquia em 3 níveis | Primário · Secundário · Terciário |
| 3 | Densidade adequada | Tabelas: 8–12px · Forms: 16–24px |
| 5 | Feedback imediato | Toda ação responde em < 100ms |
| 6 | Estados sempre completos | `default hover focus active disabled loading error empty` |
| 8 | Acessibilidade | Contraste AA · focus-visible · labels |
| 9 | Glassmorphism com critério | Só quando sobrepõe conteúdo |
| 10 | Gradientes como destaque | Nunca em fundos de página |

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
