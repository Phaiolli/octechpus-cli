# 06 — Responsividade

Estratégia mobile-first para dashboards. Mesmo quando o público alvo é desktop, mobile **deve funcionar** — não pode estar quebrado.

## Breakpoints

Padrão Tailwind, sem customização:

| Token  | Min-width | Dispositivo típico               |
|--------|-----------|----------------------------------|
| `sm`   | 640px     | Phones em paisagem               |
| `md`   | 768px     | Tablets em retrato               |
| `lg`   | 1024px    | Tablets em paisagem / Laptops    |
| `xl`   | 1280px    | Desktops                         |
| `2xl`  | 1536px    | Telas grandes                    |

**Regra de ouro:** sempre escrever mobile primeiro, adicionar prefixos para telas maiores. Nunca o contrário.

```tsx
// ✅ Correto
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

// ❌ Errado
<div className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1">
```

## Estratégia por componente

### Sidebar

| Breakpoint  | Comportamento                              |
|-------------|--------------------------------------------|
| `< md`      | Hidden, abre como drawer (hamburger)       |
| `md → lg`   | Collapsed (só ícones), tooltip no hover    |
| `≥ lg`      | Expanded por padrão                        |

### Topbar

- **Desktop:** breadcrumbs + search + ações + avatar (todos visíveis)
- **Mobile:** hamburger + título da página + avatar (search via Cmd+K ou ícone)

### Content

- Padding lateral: `px-4 md:px-6 lg:px-8`
- Max-width: `max-w-content` (1440px)
- Centralizado: `mx-auto`

### KPI grid

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

- Mobile: 1 coluna full-width
- Tablet: 2 colunas
- Desktop: 4 colunas

### Data Table

Estratégia em mobile (`< md`):

- Tabela vira **lista de cards verticais**
- Cada row do desktop é um card empilhado
- Colunas viram `key: value` dentro do card
- Actions (`⋮`) viram bottom sheet

Implementação:

```tsx
// Desktop
<div className="hidden md:block">
  <table>...</table>
</div>

// Mobile
<div className="space-y-3 md:hidden">
  {rows.map(row => <RowCard {...row} />)}
</div>
```

### Forms

| Breakpoint | Estratégia                                    |
|------------|-----------------------------------------------|
| `< md`     | Single column, full-width inputs              |
| `≥ md`     | Multi-column quando faz sentido (`grid-cols-2`) |

Inputs lado-a-lado só em `md+`:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <FormField label="Nome">...</FormField>
  <FormField label="Sobrenome">...</FormField>
</div>
```

### Modal / Dialog

- **Desktop:** centralizado, `max-w-md` ou `max-w-lg`
- **Mobile:** vira **bottom sheet** que sobe da parte inferior — ergonomia melhor para polegar

```tsx
<DialogContent className="max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-2xl max-md:rounded-b-none">
```

### Page Header

- **Desktop:** título à esquerda, actions à direita (`flex justify-between`)
- **Mobile:** título acima, actions full-width abaixo (`flex flex-col`)

## Touch targets

Em mobile, alvos de toque mínimos:

- **Botões/links:** `min-h-10` (40px) ou `min-h-11` (44px) ideal
- **Spacing entre botões:** mínimo `gap-2` (8px)
- **Inputs:** `h-11` em mobile, `h-9` em desktop OK

Componente shadcn `<Button size="md">` já atende em mobile.

## Imagens e mídias

```tsx
<img className="w-full h-auto" loading="lazy" />
```

- Sempre `loading="lazy"` exceto above-the-fold
- Usar `<picture>` com `srcset` para densidades diferentes
- Aspect ratio fixo com `aspect-video` ou `aspect-square` para evitar layout shift

## Tipografia responsiva

Para títulos grandes apenas:

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
```

**Body, labels e UI text** mantêm o mesmo tamanho em todos os breakpoints — densidade não muda.

## Hover vs Touch

- Toda interação `:hover` deve ter equivalente em touch
- Tooltips em hover não funcionam em mobile — informação crítica nunca pode estar **só** em tooltip
- `@media (hover: hover)` para esconder estados hover em devices touch:

```css
@media (hover: hover) {
  .item:hover { background: var(--surface-glass-hover); }
}
```

## Testes obrigatórios

Antes de considerar uma tela "pronta", testar (mentalmente ou no DevTools):

- [ ] **375px** (iPhone SE) — menor breakpoint moderno
- [ ] **768px** (iPad retrato) — transição mobile/desktop
- [ ] **1280px** (laptop padrão) — tamanho mais comum
- [ ] **1920px** (desktop grande) — não pode esticar feio

Se algum desses quebra, a tela não está pronta.

## Orientação

Em tablets, prever:

- **Retrato:** layout mobile estendido
- **Paisagem:** considerar layout desktop (especialmente `lg` quase atingido)

Não bloquear orientação. Deixar usuário escolher.

## Print styles

Para dashboards com relatórios:

```css
@media print {
  .no-print { display: none; }
  body { background: white; color: black; }
  /* sidebar, topbar, actions: display none */
}
```

Adicionar classe `no-print` em sidebar, topbar, botões e elementos não-relevantes para impressão.
