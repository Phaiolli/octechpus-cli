# 04 — Componentes (Receitas)

Receitas dos componentes mais usados em dashboards. Use `shadcn/ui` como base — estes são guias de **composição e variantes** sobre os componentes shadcn.

## Botão (Button)

Variants padronizadas:

| Variant      | Uso                                       | Classes principais                                        |
|--------------|-------------------------------------------|-----------------------------------------------------------|
| `primary`    | Ação principal da página (1 por contexto) | `gradient-accent text-white shadow-glow`                  |
| `secondary`  | Ação alternativa                          | `bg-surface-glass border border-default text-primary`     |
| `ghost`      | Ações terciárias / em listas              | `text-secondary hover:bg-surface-glass-hover`             |
| `danger`     | Destrutivas (delete, remove)              | `bg-danger text-white`                                    |
| `outline`    | Em superfícies já elevadas                | `border border-default text-primary`                      |

Tamanhos: `sm` (h-8), `md` (h-9), `lg` (h-10), `icon` (size-9 quadrado).

Loading state: `<Loader2 className="animate-spin" />` substitui ícone, label muda para "Processando..." ou similar.

## Card

```tsx
<div className="rounded-lg border border-subtle bg-bg-elevated p-6">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h3 className="text-lg font-semibold">Título</h3>
      <p className="text-sm text-secondary mt-1">Descrição</p>
    </div>
    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
  </div>
  <div className="mt-4">{/* conteúdo */}</div>
</div>
```

Variants:
- **Default:** `bg-bg-elevated border-subtle`
- **Glass:** `glass` (em overlays e mobile drawers)
- **Highlighted:** `border-accent/40` + `shadow-glow` (cards de destaque/upgrade)
- **Interactive:** `hover:border-default hover:bg-bg-elevated/80 transition-colors cursor-pointer`

## KPI Card

```tsx
<div className="rounded-lg border border-subtle bg-bg-elevated p-5">
  <div className="flex items-center gap-2 text-secondary">
    <Users className="size-4" />
    <span className="text-sm">Usuários ativos</span>
  </div>
  <div className="mt-2 flex items-baseline gap-2">
    <span className="text-3xl font-semibold tracking-tight">12.847</span>
    <span className="text-sm text-success flex items-center gap-1">
      <TrendingUp className="size-3" /> +12.5%
    </span>
  </div>
  <p className="mt-1 text-xs text-tertiary">vs. último mês</p>
</div>
```

Regras:
- Número: maior elemento da card, `text-3xl` ou `text-4xl`, `font-semibold tracking-tight`
- Trend up: `text-success` com `<TrendingUp />`
- Trend down: `text-danger` com `<TrendingDown />`
- Comparação: sempre no rodapé, `text-xs text-tertiary`
- Skeleton: `<Skeleton className="h-9 w-32" />` no lugar do número

## Data Table

Usar `@tanstack/react-table` + estilização custom. Estrutura:

```
┌─────────────────────────────────────────────────────┐
│ [Search] [Filters] [Export]              [Add new] │  ← Toolbar
├─────────────────────────────────────────────────────┤
│ ☐  Nome ↕    │ Email ↕      │ Status │ Created  ⋮ │  ← Header
├─────────────────────────────────────────────────────┤
│ ☐  John Doe  │ john@...     │ [Active]│ 2d ago   ⋮│
│ ☐  Jane Doe  │ jane@...     │ [Pending]│ 5d ago  ⋮│
├─────────────────────────────────────────────────────┤
│   12 of 248 rows         [< 1 2 3 ... 21 >]        │  ← Pagination
└─────────────────────────────────────────────────────┘
```

Regras:
- Linha: `h-12`, hover `bg-surface-glass-hover`, padding lateral `px-4`
- Header: `text-xs uppercase tracking-wide text-tertiary font-medium`
- Borda entre linhas: `border-b border-subtle`
- Sortable: ícone `<ArrowUpDown />` aparece em hover do header, sólido quando ativo
- Empty state: dentro da tabela, com ilustração + mensagem + CTA
- Loading: skeleton rows (3-5) com mesma altura
- Mobile: tabela vira lista de cards (cada row é um card vertical)

## Form

### Estrutura de seção

```tsx
<form className="space-y-8">
  <FormSection
    title="Informações pessoais"
    description="Estas informações serão exibidas publicamente"
  >
    <FormField label="Nome" required>
      <Input />
    </FormField>
    <FormField label="Email" hint="Não compartilhamos seu email">
      <Input type="email" />
    </FormField>
  </FormSection>

  <FormSection title="Notificações">
    {/* ... */}
  </FormSection>

  <div className="flex justify-end gap-3 border-t border-subtle pt-6">
    <Button variant="ghost">Cancelar</Button>
    <Button variant="primary">Salvar alterações</Button>
  </div>
</form>
```

Regras:
- Gap entre fields: `space-y-4` ou `gap-4`
- Gap entre seções: `space-y-8`
- Label: `text-sm font-medium` acima do input
- Hint: `text-xs text-tertiary` abaixo do input
- Erro: `text-xs text-danger` abaixo, com `<AlertCircle className="size-3" />`
- Required: asterisco `*` em `text-danger` após o label
- Input height: `h-9` padrão, `h-10` em forms importantes
- Inputs: `bg-surface-glass border border-default focus:border-accent focus:ring-2 ring-accent/20`

## Modal / Dialog

Sempre usar `Dialog` do shadcn com customizações:

- Backdrop: `bg-black/60 backdrop-blur-sm`
- Content: `glass-strong` + `shadow-lg` + `rounded-xl` + `max-w-md`
- Header: título `text-lg font-semibold` + descrição `text-sm text-secondary`
- Footer: actions à direita, `justify-end gap-3`
- Animation: enter `fade-in + zoom-in-95`, exit reverso

## Empty State

Componente reutilizável obrigatório:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-accent-soft p-4 mb-4">
    <Inbox className="size-8 text-accent" />
  </div>
  <h3 className="text-lg font-semibold">Nenhum item ainda</h3>
  <p className="mt-1 text-sm text-secondary max-w-sm">
    Quando você criar seu primeiro item, ele aparecerá aqui.
  </p>
  <Button variant="primary" className="mt-6">
    <Plus className="size-4" /> Criar primeiro item
  </Button>
</div>
```

## Toast / Notification

Usar `sonner` (shadcn integration). Variants:

- `success` — `text-success` + `<CheckCircle />`
- `error` — `text-danger` + `<XCircle />`
- `info` — `text-info` + `<Info />`
- `warning` — `text-warning` + `<AlertTriangle />`

Posicionamento: `top-right` em desktop, `top-center` em mobile. Auto-dismiss: 4s padrão, 8s em erros.

## Badge / Status pill

```tsx
<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-success-soft text-success">
  <span className="size-1.5 rounded-full bg-success" />
  Ativo
</span>
```

Variants padronizadas por status semântico (`success`, `warning`, `danger`, `info`, `neutral`).

## Loading states

| Contexto                  | Padrão                                |
|---------------------------|---------------------------------------|
| Carregamento inicial      | Skeleton com layout idêntico ao final |
| Ação em botão             | `<Loader2 />` spinner + label muda    |
| Carregamento de dados     | Skeleton rows                         |
| Página inteira (raro)     | Spinner centralizado + label          |
| Inline (autocomplete)     | `<Loader2 />` pequeno à direita       |

**Nunca** usar spinner full-page para operações <2s. Skeleton sempre quando possível.

## Tooltip

- Trigger: hover ou focus (importante para teclado)
- Delay: 300ms
- Style: `glass` + `text-xs` + `px-2 py-1` + `rounded-md`
- Posição padrão: `top`, ajusta via collision detection

Use para: explicar ícones sem label, mostrar info adicional, atalhos de teclado.
