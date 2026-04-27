# 02 — Arquitetura de Pastas

Estrutura padrão para projetos de dashboards. Adapta-se a React, Next.js, Vue e Svelte com mudanças mínimas.

## Estrutura base (React/Next.js)

```
src/
├── app/                          # Next.js App Router (ou pages/ no Pages Router)
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   ├── (dashboard)/              # Grupo de rotas autenticadas
│   │   ├── layout.tsx            # Layout do dashboard (sidebar + topbar)
│   │   └── [feature]/page.tsx
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # shadcn/ui components (não editar manualmente)
│   ├── layout/                   # Sidebar, Topbar, PageHeader, Footer
│   ├── data/                     # DataTable, DataCard, KPICard, Chart wrappers
│   ├── forms/                    # FormField, FormSection, validações comuns
│   ├── feedback/                 # EmptyState, ErrorState, LoadingState, Toast
│   └── domain/                   # Componentes específicos do domínio do app
│
├── features/                     # Organização por feature (preferido em apps maiores)
│   └── [feature-name]/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       ├── types.ts
│       └── index.ts
│
├── hooks/                        # Hooks compartilhados
│   ├── use-media-query.ts
│   ├── use-debounce.ts
│   └── use-theme.ts
│
├── lib/                          # Utilitários puros
│   ├── utils.ts                  # cn(), formatters
│   ├── api-client.ts
│   └── validators.ts
│
├── stores/                       # Estado global (Zustand, Jotai, etc.)
│
├── styles/
│   ├── tokens.css                # Importado do design system
│   └── globals.css               # @tailwind base/components/utilities + overrides
│
├── types/                        # Tipos globais
│
└── config/
    ├── navigation.ts             # Estrutura do menu (single source of truth)
    └── site.ts                   # Metadata do site
```

## Regras de organização

### Quando usar `components/` vs `features/`

- **`components/`** — componentes reutilizáveis em qualquer feature (DataTable, FormField, EmptyState)
- **`features/`** — componentes específicos de uma feature (UserOnboardingFlow, InvoiceListPage)

Se o componente é usado em **2+ features**, promova para `components/`.

### Convenção de nomes

- Componentes: `PascalCase.tsx` (`DataTable.tsx`)
- Hooks: `use-kebab-case.ts` (`use-media-query.ts`)
- Utilitários: `kebab-case.ts` (`format-currency.ts`)
- Tipos: dentro do arquivo do componente, ou em `types.ts` se compartilhados
- Constantes: `UPPER_SNAKE_CASE` em arquivos `kebab-case.ts`

### Estrutura interna de feature

```
features/billing/
├── components/
│   ├── InvoiceTable.tsx
│   ├── InvoiceTable.skeleton.tsx
│   └── PaymentMethodCard.tsx
├── hooks/
│   └── use-invoices.ts
├── api/
│   ├── get-invoices.ts
│   └── update-payment-method.ts
├── types.ts
└── index.ts                      # Barrel export público da feature
```

`index.ts` exporta apenas o que outras features podem usar. Internals ficam encapsulados.

## Configuração de navegação (single source of truth)

`src/config/navigation.ts` é a única fonte de definição do menu. Sidebar, breadcrumbs e mobile drawer leem daqui:

```ts
import { LayoutDashboard, Users, Settings, BarChart3 } from 'lucide-react';

export const navigation = {
  main: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    {
      label: 'Usuários',
      href: '/users',
      icon: Users,
      children: [
        { label: 'Lista', href: '/users' },
        { label: 'Convites', href: '/users/invites' },
      ],
    },
  ],
  bottom: [
    { label: 'Configurações', href: '/settings', icon: Settings },
  ],
} as const;
```

## Aliases obrigatórios

Configure no `tsconfig.json` / `vite.config.ts`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/features/*": ["./src/features/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/hooks/*": ["./src/hooks/*"]
  }
}
```

Imports relativos (`../../`) são proibidos para qualquer caminho com 2+ níveis.

## Onde inserir o design system

```
projeto/
├── design-system/                # Cópia ou symlink deste design system
│   ├── tokens/
│   ├── docs/
│   └── CLAUDE.md
└── src/
    └── styles/
        └── tokens.css            # Import: @import '../../design-system/tokens/tokens.css'
```

Alternativamente, copie `tokens.css` direto para `src/styles/` no setup inicial.
