# Design System — Instruções para Claude Code

Este é o **design system pessoal** que deve ser seguido em **todos os projetos de interface** (sistemas web e dashboards). Este arquivo é a fonte única da verdade — sempre consulte-o antes de gerar qualquer interface.

## Stack base obrigatória

Independentemente do framework do projeto (React, Next.js, Vue, Svelte, etc.), **sempre** use:

- **Tailwind CSS** para estilização (configurado com o preset deste design system)
- **shadcn/ui** (ou seu port equivalente: `shadcn-vue`, `shadcn-svelte`) para componentes base
- **Lucide Icons** como biblioteca de ícones padrão
- **Inter** como fonte UI primária, **JetBrains Mono** para código/dados monoespaçados
- **Radix UI** primitives quando precisar de componentes acessíveis sem estilo

## Identidade visual

- **Tema padrão:** escuro (com toggle para claro)
- **Estilo:** moderno com glassmorphism e gradientes sutis
- **Densidade:** equilibrada — não tão densa quanto Linear, não tão arejada quanto Stripe
- **Personalidade:** profissional, sofisticado, mas com toques vibrantes nos accents

## Documentação detalhada

Sempre consulte estes documentos antes de gerar componentes ou layouts:

- `@./docs/01-principles.md` — Princípios de UX/UI inegociáveis
- `@./docs/02-architecture.md` — Estrutura de pastas dos projetos
- `@./docs/03-layout.md` — Padrões de layout (sidebar, topbar, área de conteúdo)
- `@./docs/04-components.md` — Receitas de componentes (cards, tabelas, forms, modals)
- `@./docs/05-navigation.md` — Padrões de navegação e hierarquia
- `@./docs/06-responsive.md` — Breakpoints e estratégia responsiva
- `@./docs/07-icons.md` — Sistema de ícones
- `@./docs/08-accessibility.md` — Requisitos de acessibilidade
- `@./tokens/tokens.css` — Variáveis CSS (cores, espaçamento, tipografia)
- `@./tokens/tailwind.preset.js` — Preset Tailwind a importar no projeto

## Regras inegociáveis

Estas regras devem ser seguidas em **100% dos componentes** gerados:

1. **Nunca use cores hardcoded.** Use tokens (`bg-surface`, `text-primary`, `border-subtle`). Nunca `bg-[#1a1a1a]` ou `text-gray-500`.
2. **Nunca use espaçamento arbitrário.** Use a escala de 4px (`p-2`, `p-4`, `p-6`...). Evite `p-[13px]`.
3. **Toda interface deve ser responsiva.** Mobile-first. Teste mental em 375px, 768px, 1280px.
4. **Toda ação interativa deve ter estado focus visível.** `focus-visible:ring-2 ring-accent`.
5. **Contraste mínimo AA (4.5:1) para texto.** Sempre.
6. **Glassmorphism com moderação.** Use em superfícies elevadas (modals, popovers, sidebar overlay), não em todo lugar.
7. **Gradientes só em accents** — botões primários, badges de destaque, gráficos. Nunca em backgrounds grandes.
8. **Animações sempre com `transition-colors`, `transition-transform` ou `transition-opacity`** com duração `150ms` ou `200ms`. Nunca `transition-all`.
9. **Sempre componha com shadcn/ui** quando disponível, em vez de criar do zero.
10. **Sempre tipe props em TypeScript** quando o projeto for TS.

## Ao iniciar um novo projeto

1. Copiar `./tokens/tokens.css` para `src/styles/tokens.css` e importar no entrypoint
2. Copiar `./tokens/tailwind.preset.js` e referenciar em `tailwind.config.js` via `presets: [...]`
3. Inicializar shadcn/ui: `npx shadcn-ui@latest init` (escolher New York style + dark)
4. Instalar dependências base: `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
5. Seguir a estrutura de pastas em `@./docs/02-architecture.md`
6. Copiar `./templates/new-project-CLAUDE.md` como `CLAUDE.md` na raiz do novo projeto

## Quando há conflito

Se o usuário pedir algo que conflita com este design system (ex: "use cinza #888 aqui"):
1. **Avise** que há um token equivalente
2. **Sugira** o uso do token (`text-secondary` em vez de `#888`)
3. **Cumpra a decisão final do usuário**, mas registre em comentário no código que é uma exceção
