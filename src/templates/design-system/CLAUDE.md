# Stratum Design System — Contexto do projeto

> Este arquivo vive em `design-system/` e é a **fonte única da verdade visual**
> deste projeto. No fluxo Octechpus ele é consultado pelo agente `/design`
> (Designer) e pode ser referenciado a partir do `CLAUDE.md` da raiz via
> `@./design-system/CLAUDE.md`. Leia-o por inteiro antes de gerar qualquer interface.

## O que é o Stratum

**Stratum** é um design system híbrido pensado para ser a fundação universal de
sites institucionais, apps SaaS, dashboards, ferramentas internas e produtos
mobile/responsivos. Ele é:

- **Dark-first**: o modo escuro é o padrão. O claro é uma alternativa completa.
- **Brand-agnostic**: a identidade visual (logo, `--primary`, `--accent`) muda por
  projeto; estrutura, espaçamento, motion e anatomia dos componentes, não.
- **Token-driven**: toda cor, espaço, raio, sombra e valor de motion vive em
  `tokens/tokens.json` (formato Design Tokens Community Group) como fonte da verdade.
  As variáveis CSS e a config do Tailwind são geradas a partir dele.
- **WCAG AA**: contraste, foco visível, navegação por teclado e reduced motion não
  são negociáveis.

A especificação visual completa — cada componente, template de página, regra de
microcopy e padrão LGPD — está em `reference/stratum-design-system.html`. Abra esse
arquivo no navegador quando precisar ver o visual pretendido de algo.

## Como usar este handoff

O HTML em `reference/` é **uma especificação de design, não código de produção**.
Não copie a marcação dele literalmente. Reimplemente cada componente de forma
idiomática na stack deste repositório, usando os tokens em `tokens/` como fonte
única da verdade de estilização.

## Stack recomendada (se começando do zero)

Se o repositório ainda não tem stack definida, use por padrão:

- **Next.js 15** (App Router, React Server Components)
- **TypeScript** strict
- **Tailwind CSS v4** com o preset em `tokens/tailwind.preset.ts`
- **Radix UI primitives** (Dialog, Popover, DropdownMenu, Tooltip, Tabs, Toast, etc.)
  — envolva-os com a camada visual do Stratum
- **Lucide React** para ícones (`lucide-react`)
- **Geist + Geist Mono** para tipografia (`geist/font`)
- **next-themes** para o toggle dark/light
- **clsx + tailwind-merge** combinados num helper `cn()`

Se o repositório já tem stack, adapte — mantenha os tokens, troque a camada de render.

## Layout de arquivos a produzir

```
src/
├── styles/
│   ├── tokens.css            ← copiado de design-system/tokens/tokens.css
│   └── globals.css           ← importa tokens.css, resets do body, font-face
├── lib/
│   ├── tokens.ts             ← objeto TS de design-system/tokens/tokens.ts
│   └── cn.ts                 ← helper clsx+tailwind-merge
├── components/
│   ├── ui/                   ← primitivos (Button, Input, Card, …)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── …
│   ├── patterns/             ← padrões compostos (Sidebar, DataTable, …)
│   └── icons.ts              ← re-export dos ícones lucide padronizados
├── app/                      ← Next.js app router
│   ├── layout.tsx            ← ThemeProvider, body, setup de fontes
│   └── …
```

## Regras de implementação de componentes

1. **Sem números mágicos.** Todo espaçamento, cor, raio e sombra vem de uma utility
   do Tailwind que aponta para um token. Adicionar `padding: 17px` é um bug.
2. **Variantes com `cva`** (`class-variance-authority`). Documente cada prop de
   variante com um JSDoc de uma linha.
3. **Padrão `asChild`** (Radix Slot) para polimorfismo — wrappers como
   `<Button asChild><Link>…</Link></Button>`.
4. **Refs encaminhadas em tudo.** Use `React.forwardRef` em todo primitivo.
5. **Acessibilidade passa no build.** Cada PR roda `axe-core`. Focus rings, labels e
   roles ARIA fazem parte do componente, não são parafusados depois.
6. **Paridade dark/light é garantida por tokens.** Nunca escreva `dark:bg-...` para
   decisões de cor de componente — o token já troca. Use `dark:` só quando o design
   genuinamente diverge entre os modos (raro).
7. **`prefers-reduced-motion` respeitado.** Use a variante `motion-safe:` para
   transições não-essenciais.
8. **Seguro no server.** Componentes são RSC por padrão quando possível; marque
   `"use client"` só quando necessário (state, eventos, refs).
9. **Composição sobre configuração.** Três primitivos pequenos que compõem &gt; um
   componente gordo com 18 props.

## Cor & tema

- Os tokens estão em **OKLCH** para uniformidade perceptual. Não converta para hex a
  menos que uma ferramenta realmente exija.
- A troca de tema é por data-attribute: `[data-stratum-theme="light"]` no `<html>`. O
  preset do Tailwind configura `darkMode: ["selector", '[data-stratum-theme="dark"]']`.
- O accent da marca também é data-attribute:
  `[data-accent="violet"|"emerald"|"amber"|"rose"|"blue"]`. O padrão é `blue`.
- O toggle do usuário deve persistir em `localStorage` (`stratum-theme`,
  `stratum-accent`) e respeitar `prefers-color-scheme` na primeira visita.

## Tipografia

- Primária: **Geist** (`weight: 300 400 500 600 700`) — `font-sans`
- Mono: **Geist Mono** (`400 500 600`) — `font-mono` — use para números em tabelas
  (`tabular-nums`), código, kbd, timestamps, labels de metadado
- Accent editorial (opcional, com parcimônia): **Instrument Serif** — só para heros
- Tokens de escala: `display | h1 | h2 | h3 | h4 | body-lg | body | small | label` —
  expostos como utilities `text-display`, `text-h1`, etc.

## Iconografia

- **Lucide React** apenas. Padrão `size={16}`, `strokeWidth={2}`.
- Padronize o conjunto de ação em `src/components/icons.ts`: `Search`, `Plus`,
  `Pencil`, `Trash2`, `Save`, `Download`, `Send`, `Filter`, `ArrowUpDown`, `Settings`,
  `User`, `Bell`, `LayoutGrid`, `FileText`, `Calendar`, `HelpCircle`, `Shield`,
  `Lock`, `LogOut`. Importe deste arquivo em todo lugar — sem imports diretos de
  `lucide-react` nos componentes.

## LGPD & privacidade

Este DS entrega padrões **estruturais** de conformidade LGPD — UI para banner de
cookies, modal de preferências granular, "Meus dados" (download/correção/exclusão),
contato do DPO, log de auditoria. O **conteúdo** de toda página legal deve ser
revisado pelo seu time jurídico antes da publicação. Nunca publique o texto
placeholder de `reference/`.

## O que NÃO fazer

- Não introduza uma segunda biblioteca de ícones, um segundo stack de fontes, nem um
  segundo armazém de tokens.
- Não adicione um runtime CSS-in-JS (emotion, styled-components). Tailwind + CSS vars
  é o contrato.
- Não reinvente primitivos de overlay — envolva o Radix.
- Não adicione um plugin do Tailwind que sobrescreva cores do tema com hexes fixos.
- Não entregue um componente sem uma story de Storybook e um teste Vitest/RTL básico.

## Comandos de bootstrap

```bash
# Next.js
pnpm create next-app stratum-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd stratum-app

# Deps principais
pnpm add @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-dropdown-menu \
        @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-toast \
        @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-slot \
        class-variance-authority clsx tailwind-merge lucide-react next-themes geist

# Deps de dev
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
```

## Critérios de aceite para "Stratum está implementado neste repo"

- [ ] `tokens/tokens.css` importado em `globals.css`; toggles de atributo de tema funcionam
- [ ] Pelo menos estes primitivos existem com variantes batendo com a referência:
  `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Card`,
  `Badge`, `Avatar`, `Tooltip`, `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tabs`,
  `Toast`, `Alert`, `Skeleton`, `Progress`, `Table`, `Pagination`
- [ ] Sidebar + Header (app shell) compostos e documentados
- [ ] Dark mode é padrão; o toggle de light funciona sem flash (SSR-safe)
- [ ] Todos os primitivos acessíveis por teclado; focus rings visíveis; axe-core passa
- [ ] Banner de cookies + modal de preferências + página "Meus dados" implementados
  conforme a seção de LGPD em `reference/`
- [ ] Um template de página da `reference/` reconstruído ponta a ponta
  (recomendado: Dashboard) como smoke test

---

Na dúvida, abra `reference/stratum-design-system.html` e confira o visual pretendido.
Os tokens são o contrato; o HTML é a figura.
