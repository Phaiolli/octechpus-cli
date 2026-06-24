# Claude Code — prompts iniciais

Cole estes no terminal um de cada vez. Cada um produz um passo concreto e revisável.

---

## 1. Bootstrap do projeto

```
Read CLAUDE.md and tokens/tokens.json. Then bootstrap a new Next.js 15
project at the root of this folder (use --src-dir, --app, --typescript,
--tailwind, --import-alias "@/*"). After scaffolding, install the deps
listed in CLAUDE.md "Bootstrap commands". Don't write any components yet
— just confirm the project runs with `pnpm dev`.
```

## 2. Wire the tokens

```
Take tokens/tokens.css and tokens/tailwind.preset.ts from this handoff and
wire them into the new project: import tokens.css from src/styles/globals.css,
extend the Tailwind config with the preset. Set up next-themes with the
[data-stratum-theme] attribute (not class) per CLAUDE.md. Verify dark mode is
the default and the toggle works without flash. Show me the diff.
```

## 3. Build the first primitives

```
Implement these primitives, in this order: Button, Input, Textarea, Label,
Card, Badge, Avatar, Switch, Checkbox, Radio. For each:
- Use Radix UI when an unstyled primitive exists
- Use class-variance-authority for variants
- Match the variants and states in reference/stratum-design-system.dc.html §10-§11
- Add a Storybook story (or a /sandbox route) showing all states
- Forward refs, expose asChild where useful
Open reference/ in your head as you build — match it pixel-by-pixel via tokens.
Don't move on until I approve each one.
```

## 4. App shell

```
Build the dashboard app shell from reference/stratum-design-system.dc.html
§tpl-dashboard: 220px sidebar with grouped nav + badges, 52px header with
breadcrumbs and command-menu trigger, content area with KPI cards and recent
activity. Use Radix for the dropdown menus inside it. Add a /dashboard route
that renders it with placeholder data.
```

## 5. Theme switcher + accent picker

```
Implement the theme toggle and accent picker that appear in the reference's
top bar. Theme uses next-themes with attribute="data-stratum-theme".
Accent writes [data-accent="..."] on <html> and persists to localStorage
under "stratum-accent". Both should respect prefers-color-scheme on first
visit and avoid layout shift / FOUC.
```

## 6. LGPD pieces

```
Build the cookie banner, the preferences modal, and the "Meus dados" page
following reference/ §17 (LGPD) and the Settings template. Use Radix Dialog
for the modal. Persist consent to a `stratum-consent` cookie with version,
timestamp, and category-level booleans. Add a `useConsent()` hook.
Critical: the "Reject optional" and "Accept all" buttons must have equal
visual weight — do not nudge toward Accept.
```

## 7. Replicate one template end-to-end

```
Pick the Dashboard template from reference/ §tpl-dashboard. Reimplement it
in the new codebase using only the primitives we've built. If a primitive
is missing, build it first (and add a story). Goal: the rendered page in
http://localhost:3000/dashboard should be visually identical to the
reference for both dark and light modes.
```

## 8. Documentation site

```
Set up a /docs section that mirrors the reference's navigation:
Foundations, Components, Patterns, Templates, Guidelines. Each component
page shows: anatomy, variants, props table, accessibility notes, do/don't.
Use MDX for the prose. The component playgrounds embed the real components,
not screenshots.
```

---

## Tips para iterar com o Claude Code

- **Branchs por sessão**: comece cada sessão com `git checkout -b feat/<name>` para revisar antes de merge.
- **Pequenos passos**: peça uma coisa por vez. "Implemente Button, Input e Card" é melhor que "implemente tudo".
- **Pergunte plano antes de código**: "Antes de escrever código, descreva como você vai implementar X" — economiza retrabalho.
- **Use o reference como prova**: "Compare seu Button com o §10 do reference HTML e me liste qualquer diferença visual antes de marcar como pronto".
- **Snapshot tests visuais**: depois das primeiras 5 primitives, peça `@playwright/test` com `toHaveScreenshot` rodando contra `/sandbox` para garantir que mudanças futuras não regridam.
