# 07 — Ícones

Sistema de ícones unificado em todos os projetos.

## Biblioteca padrão

**[Lucide Icons](https://lucide.dev)** — sem exceção.

```bash
npm install lucide-react   # React/Next.js
npm install lucide-vue-next # Vue
npm install lucide-svelte   # Svelte
```

### Por que Lucide
- Conjunto coerente, ~1500 ícones bem desenhados
- Fork moderno do Feather Icons
- Tree-shakeable (só importa o que usa)
- API consistente em todos os frameworks
- Stroke-based, encaixa perfeito com glassmorphism

## Tamanhos padronizados

| Token        | Pixels | Uso                                          |
|--------------|--------|----------------------------------------------|
| `size-3`     | 12px   | Indicadores inline em texto pequeno (badge)  |
| `size-3.5`   | 14px   | Hints, ícones em texto                       |
| `size-4`     | 16px   | **Padrão geral** — botões, inputs, links     |
| `size-4.5`   | 18px   | Sidebar nav items                            |
| `size-5`     | 20px   | Topbar actions, headers de card              |
| `size-6`     | 24px   | Empty states pequenos, headers de página     |
| `size-8`     | 32px   | Empty states grandes, ilustrações            |
| `size-10`    | 40px   | Hero icons (raro)                            |

## Convenções de uso

### Em botões

```tsx
// Ícone à esquerda do label
<Button>
  <Plus className="size-4" />
  Adicionar
</Button>

// Botão só com ícone — SEMPRE com label acessível
<Button size="icon" aria-label="Adicionar item">
  <Plus className="size-4" />
</Button>
```

Gap entre ícone e label: `gap-2` (já no Button do shadcn).

### Em inputs

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-tertiary" />
  <Input className="pl-9" placeholder="Buscar..." />
</div>
```

- Ícones em inputs: `text-tertiary` quando inativo, `text-secondary` quando focado
- Padding do input para acomodar: `pl-9` (com ícone esquerdo `size-4`)

### Em sidebar

```tsx
<a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium">
  <LayoutDashboard className="size-4.5 shrink-0" />
  <span>Dashboard</span>
</a>
```

`shrink-0` é crucial para ícones em flex containers — evita squash.

### Em status/badges

Pontos coloridos (não ícones) em status pills:

```tsx
<Badge variant="success">
  <span className="size-1.5 rounded-full bg-success" />
  Ativo
</Badge>
```

Use ícones quando estado tem ação implícita: `<CheckCircle />`, `<AlertCircle />`, `<Clock />`.

## Ícones por contexto (referência rápida)

### Navegação
- Dashboard: `LayoutDashboard`
- Analytics: `BarChart3` ou `LineChart`
- Usuários: `Users`
- Produtos/Items: `Package`
- Pedidos: `ShoppingCart`
- Mensagens: `MessageSquare`
- Notificações: `Bell`
- Calendário: `Calendar`
- Documentos: `FileText`
- Configurações: `Settings`
- Logout: `LogOut`

### Ações
- Criar/Adicionar: `Plus`
- Editar: `Pencil` (não `Edit`)
- Excluir: `Trash2`
- Duplicar: `Copy`
- Compartilhar: `Share2`
- Download: `Download`
- Upload: `Upload`
- Refresh: `RefreshCw`
- Filtrar: `Filter` ou `SlidersHorizontal`
- Ordenar: `ArrowUpDown`
- Buscar: `Search`
- Mais opções: `MoreHorizontal` (em linha) ou `MoreVertical` (em cards)

### Direção
- Voltar: `ArrowLeft`
- Avançar: `ArrowRight`
- Expandir baixo: `ChevronDown`
- Expandir lateral: `ChevronRight`
- Fechar: `X`
- Confirmar: `Check`
- External link: `ExternalLink`

### Status
- Sucesso: `CheckCircle2`
- Erro: `XCircle`
- Aviso: `AlertTriangle`
- Info: `Info`
- Loading: `Loader2` (com `animate-spin`)
- Pending: `Clock`

### Visualização
- Ver: `Eye`
- Ocultar: `EyeOff`
- Expandir: `Maximize2`
- Recolher: `Minimize2`
- Tela cheia: `Expand`

### Theme
- Light: `Sun`
- Dark: `Moon`
- Sistema: `Monitor`

## Cor dos ícones

Por padrão herdam `currentColor` (assumem cor do texto pai).

Para forçar cor:

```tsx
<Plus className="size-4 text-accent" />
<Trash2 className="size-4 text-danger" />
<Check className="size-4 text-success" />
```

**Não use** ícones coloridos com `<svg fill="...">` — sempre stroke + currentColor.

## Acessibilidade

### Ícones decorativos (junto com texto)
```tsx
<Plus className="size-4" aria-hidden="true" />
Adicionar
```

### Ícones funcionais (sem texto)
```tsx
<button aria-label="Fechar diálogo">
  <X className="size-4" />
</button>
```

Toda interação por ícone **deve** ter `aria-label`. Nunca depender só do ícone para comunicar ação.

## Ícones customizados

Se precisar de ícone fora da Lucide (logos, brand-specific):

1. Salvar SVG em `src/components/icons/`
2. Otimizar com [SVGOMG](https://jakearchibald.github.io/svgomg/)
3. Converter para componente:

```tsx
// src/components/icons/MyIcon.tsx
export function MyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* paths */}
    </svg>
  );
}
```

Manter `strokeWidth="2"` para combinar com Lucide.

## O que NÃO usar

- ❌ Font Awesome — pesado, estilo destoa
- ❌ Material Icons — estilo filled destoa do nosso (stroke-based)
- ❌ Emoji como ícone de UI — inconsistente entre OS
- ❌ Bibliotecas misturadas — escolha uma e mantenha
