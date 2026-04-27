# 03 — Layout Patterns

Padrões de layout para dashboards. Todo dashboard tem **3 zonas principais**: Sidebar, Topbar e Content Area.

## Anatomia geral

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR  (h-14, sticky, glass com scroll)               │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │           CONTENT AREA                       │
│  w-64    │           max-w-content                      │
│ (fixed)  │           p-6 lg:p-8                         │
│          │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

## Sidebar

### Estados
- **Expanded:** `w-64` (256px) — padrão desktop
- **Collapsed:** `w-16` (64px) — só ícones, label como tooltip
- **Hidden + Drawer:** mobile (<lg) — abre por overlay com `glass` + `backdrop-blur-md`

### Estrutura interna

```
┌─────────────────────┐
│ Logo + Brand   [«]  │  → header (h-14, padding 16px)
├─────────────────────┤
│ [Workspace switcher]│  → opcional, se multi-tenant
├─────────────────────┤
│                     │
│ ▸ Dashboard         │  → main nav
│ ▸ Analytics         │
│ ▸ Usuários          │
│   • Lista           │  → children indentados
│   • Convites        │
│                     │
├─────────────────────┤
│ ▸ Configurações     │  → bottom nav
│ [User profile card] │  → footer
└─────────────────────┘
```

### Regras
- Item ativo: `bg-accent-soft` + `text-accent` + barra esquerda `w-0.5 bg-accent`
- Item hover: `bg-surface-glass-hover`
- Ícones: `lucide-react` 18px (`size-4.5` = 18, ou `size-5` = 20)
- Gap vertical entre items: `gap-1`
- Padding item: `px-3 py-2`
- Texto: `text-sm font-medium`
- Children indent: `pl-9` (alinhado com label do parent)

## Topbar

### Estrutura

```
┌─────────────────────────────────────────────────────────┐
│ [Breadcrumb]              [Search] [Notif] [Avatar ▾]  │
└─────────────────────────────────────────────────────────┘
```

### Variações
- **Padrão:** `bg-bg-base/80` + `backdrop-blur-md` + `border-b border-subtle` quando scroll > 0
- **Com banner:** topbar acima de banner promocional/aviso (`bg-accent-soft` + dismiss)

### Elementos obrigatórios (esquerda → direita)
1. **Breadcrumbs** ou título da página
2. **Search global** (Cmd+K) — `glass` com ícone `<Search />`
3. **Notificações** — bell icon com badge (`bg-danger` se não lidas)
4. **Theme toggle** — `<Sun />` / `<Moon />`
5. **Avatar do usuário** com dropdown (perfil, settings, logout)

### Regras
- Altura: **56px** fixa (`h-14`)
- Sticky: `sticky top-0 z-sticky`
- Em scroll: aplicar `glass` + `border-b`
- Mobile: substituir breadcrumb por hamburger `<Menu />` que abre sidebar drawer

## Content Area

### Estrutura padrão de página

```tsx
<main className="mx-auto w-full max-w-content px-4 py-6 md:px-6 lg:px-8">
  <PageHeader
    title="Usuários"
    description="Gerencie acesso e permissões"
    actions={<Button>Novo usuário</Button>}
  />

  <div className="mt-6 space-y-6">
    {/* KPI Row */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard ... />
    </div>

    {/* Main content */}
    <Card>
      <DataTable ... />
    </Card>
  </div>
</main>
```

### PageHeader

- Título: `text-2xl font-semibold tracking-tight`
- Descrição: `text-sm text-secondary` abaixo
- Actions: à direita, alinhado verticalmente ao título
- Margin bottom: `mb-6`
- Em mobile: actions vão para baixo da descrição

### Spacing padrão

| Contexto                              | Spacing       |
|---------------------------------------|---------------|
| Padding lateral content (mobile)      | `px-4`        |
| Padding lateral content (tablet)      | `px-6`        |
| Padding lateral content (desktop)     | `px-8`        |
| Padding vertical content              | `py-6`        |
| Gap entre seções relacionadas         | `space-y-6`   |
| Gap entre seções não relacionadas     | `space-y-10`  |
| Gap entre cards em grid               | `gap-4`       |
| Gap entre items de lista              | `space-y-2`   |

## Layouts especiais

### Empty Layout (login, onboarding)
- Centro absoluto: `min-h-screen flex items-center justify-center`
- Card com `glass` + max-width 400px
- Background com gradient sutil ou pattern

### Split Layout (formulários longos, configurações)
```
┌──────────────┬──────────────────────┐
│  Sub-nav     │   Form / Conteúdo    │
│  (w-56)      │                      │
│              │                      │
└──────────────┴──────────────────────┘
```
Sub-nav lateral à esquerda do content area, dentro do dashboard layout.

### Detail Layout (master-detail)
```
┌──────────────┬──────────────────────┐
│  Lista       │   Detalhe selecionado│
│  (w-80)      │                      │
│              │                      │
└──────────────┴──────────────────────┘
```
Em mobile: vira navegação stack (lista → push detail).

## Comportamento responsivo do layout

| Breakpoint | Sidebar              | Topbar              |
|------------|----------------------|---------------------|
| `< md`     | Hidden, drawer       | Hamburger esquerda  |
| `md → lg`  | Collapsed (ícones)   | Padrão              |
| `≥ lg`     | Expanded (padrão)    | Padrão              |

Toggle manual do usuário **persiste** em `localStorage` com key `ds:sidebar:collapsed`.
