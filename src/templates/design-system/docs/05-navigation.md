# 05 — Navegação

Padrões de navegação e estrutura informacional para dashboards.

## Hierarquia de navegação

Todo dashboard tem **3 níveis** máximos:

1. **Nível 1 — Sidebar:** seções principais do produto (≤ 8 items)
2. **Nível 2 — Sub-nav ou Tabs:** seções dentro de uma área
3. **Nível 3 — In-page tabs ou filtros:** views dentro de uma página

Mais de 3 níveis indica problema de IA — refatore.

## Sidebar (Nível 1)

### Quantos itens?
- **Ideal:** 5–7 items principais
- **Máximo:** 8 items + 2 no rodapé (settings, help)
- Acima disso: agrupar em sub-itens ou repensar arquitetura

### Agrupamento

Quando há >5 items, agrupar em seções com label:

```
WORKSPACE
  ▸ Dashboard
  ▸ Projects
  ▸ Tasks

ADMIN
  ▸ Users
  ▸ Billing

SETTINGS
  ▸ Preferences
```

Label de grupo: `text-xs uppercase tracking-wide text-tertiary` + `mb-2`.

### Items com children

```
▾ Usuários       ← parent expandido
  • Lista
  • Convites
  • Cargos       ← children (pl-9)
▸ Billing        ← parent colapsado
```

Regras:
- Click no parent: expande/colapsa, **não** navega (parent não é página)
- Estado expandido persiste em `localStorage`
- Auto-expande se rota ativa estiver em children
- Indicador: `<ChevronDown />` que rotaciona em expansão

## Breadcrumbs (Nível 2 visual)

Sempre presente em páginas profundas:

```
Dashboard › Usuários › João Silva › Editar
```

Regras:
- Aparecem na **topbar**, alinhado à esquerda
- Separador: `<ChevronRight className="size-3 text-tertiary" />`
- Items intermediários: `text-secondary hover:text-primary`
- Item atual: `text-primary font-medium`, **não** clicável
- Em mobile: mostrar apenas `‹ Página anterior` (link para parent direto)
- Truncate com ellipsis se muito longo: `Dashboard › ... › Editar`

## Tabs (Nível 2 ou 3)

Usado para alternar **views da mesma entidade** ou **seções de uma página**.

### Variants

**Underline (padrão para Nível 2):**
```tsx
<div className="border-b border-subtle">
  <nav className="flex gap-6">
    <a className="border-b-2 border-accent text-primary py-3 text-sm font-medium">
      Geral
    </a>
    <a className="border-b-2 border-transparent text-secondary hover:text-primary py-3 text-sm font-medium">
      Permissões
    </a>
  </nav>
</div>
```

**Pills (Nível 3 ou filtros):**
```tsx
<div className="inline-flex gap-1 rounded-lg bg-bg-subtle p-1">
  <button className="rounded-md bg-bg-elevated px-3 py-1.5 text-sm font-medium shadow-sm">
    Tudo
  </button>
  <button className="rounded-md px-3 py-1.5 text-sm text-secondary hover:text-primary">
    Ativos
  </button>
</div>
```

### Quando usar tabs vs navegação

- **Tabs:** mesmo recurso, views diferentes. Estado da página (filtros, scroll) pode ser mantido entre tabs.
- **Navegação (rota):** recursos diferentes, URL deve mudar (back/forward funciona).

Regra: se você precisa de URL única (compartilhar link), use **rotas**, não tabs internas.

## Search global (Cmd+K)

Toda aplicação deve ter **command palette**:

- Atalho: `Cmd+K` (Mac) / `Ctrl+K` (Win/Linux)
- Posição: modal centralizado, `max-w-xl`
- Conteúdo:
  - Busca de páginas/recursos
  - Ações rápidas (criar novo, abrir settings)
  - Histórico recente
  - Items agrupados por categoria

Use `cmdk` (biblioteca shadcn já integra).

## Atalhos de teclado

Padrões obrigatórios:

| Atalho            | Ação                              |
|-------------------|-----------------------------------|
| `Cmd/Ctrl+K`      | Command palette                   |
| `Cmd/Ctrl+/`      | Lista de atalhos (modal)          |
| `Esc`             | Fechar modal/popover/drawer       |
| `g + h`           | Ir para Home/Dashboard            |
| `g + s`           | Ir para Settings                  |
| `?`               | Ajuda contextual                  |
| `Cmd/Ctrl+Enter`  | Submit de form                    |
| `J / K`           | Navegar lista (down/up)           |
| `Enter`           | Abrir item selecionado            |

Documentar todos em modal de Help (`?` ou `Cmd+/`).

## Notificações

### Inbox de notificações
- Trigger: ícone `<Bell />` na topbar
- Badge: `bg-danger` rounded-full com count (max "9+")
- Drop: popover `glass-strong` + `w-96` + `max-h-[70vh] overflow-y-auto`
- Item: avatar/ícone + texto + timestamp + actions (mark read, dismiss)
- Empty: ícone + "Tudo em dia ✨"
- Footer: link "Ver todas"

### Toasts (efêmeros)
- Posição: `top-right` desktop, `top-center` mobile
- Stack: máximo 3 visíveis, demais entram em fila
- Dismiss: auto após 4s (success/info), 8s (warning/error), nunca em "loading"

## Mobile drawer

Em telas `<lg`:

- Sidebar vira drawer lateral
- Trigger: hamburger `<Menu />` na topbar (esquerda)
- Animação: slide-in da esquerda + fade backdrop (300ms)
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Drawer: `glass-strong` + full height + `w-72`
- Fecha em: tap no backdrop, swipe left, tap em link, Esc

## Estados de "você está aqui"

Em **toda** estrutura navegacional:

- Sidebar: item ativo destacado (cor + barra lateral)
- Tabs: tab ativa com underline ou pill
- Breadcrumbs: último item destacado
- Página: title da página em `<title>` HTML e topbar

Princípio: **o usuário nunca deve se perguntar onde está**.
