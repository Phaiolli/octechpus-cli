# 08 — Acessibilidade

Acessibilidade é **obrigatória**, não opcional. Toda interface deve atender **WCAG 2.1 AA** no mínimo.

## Contraste

Todos os textos e elementos interativos devem ter contraste suficiente:

| Tipo                            | Mínimo (AA) | Recomendado (AAA) |
|---------------------------------|-------------|-------------------|
| Texto normal (< 18px ou < 14px bold) | 4.5:1   | 7:1               |
| Texto grande (≥ 18px ou ≥ 14px bold) | 3:1     | 4.5:1             |
| Componentes UI / bordas              | 3:1     | —                 |

Os tokens deste design system já passam AA. Validar custom: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

**Atenção:** glassmorphism reduz contraste — texto sobre `surface-glass` precisa estar em background com contraste suficiente.

## Navegação por teclado

### Toda funcionalidade deve ser acessível por teclado.

| Tecla         | Comportamento esperado                       |
|---------------|----------------------------------------------|
| `Tab`         | Move foco para próximo interativo            |
| `Shift+Tab`   | Move foco para anterior                      |
| `Enter`       | Ativa botão/link, submit em form             |
| `Space`       | Ativa botão, toggle checkbox/switch          |
| `Esc`         | Fecha modal, popover, dropdown               |
| `↑ ↓`         | Navega items em lista/menu/select            |
| `← →`         | Navega tabs                                  |
| `Home / End`  | Primeiro / último item em lista              |

### Focus visible

**Todo** elemento focável deve ter ring visível em foco por teclado:

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
```

Use `focus-visible:` (não `focus:`) — só mostra ring em navegação por teclado, não em click.

### Skip link

Toda página com sidebar deve ter skip link:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-tooltip focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
>
  Pular para conteúdo principal
</a>
```

### Trap de foco

Em modals e drawers, foco deve ficar **preso dentro** do componente:

- Tab dentro do modal cicla entre elementos focáveis
- Esc fecha e devolve foco ao trigger
- Use `<Dialog>` do shadcn — já implementa isso via Radix UI

## Estrutura semântica

Use HTML semântico, não `<div>` para tudo:

```tsx
// ❌ Errado
<div onClick={handler} className="card-button">Salvar</div>

// ✅ Correto
<button onClick={handler} className="card-button">Salvar</button>
```

### Landmarks obrigatórios

- `<header>` para topbar
- `<nav>` para sidebar e breadcrumbs
- `<main id="main-content">` para área de conteúdo
- `<footer>` se houver footer

### Hierarquia de headings

- Apenas **um** `<h1>` por página (título da página)
- Não pular níveis: `<h1>` → `<h2>` → `<h3>`, nunca `<h1>` → `<h3>`
- Headings descrevem **estrutura**, não estilo

## Forms

### Labels

Todo input **deve** ter `<label>` associado:

```tsx
<label htmlFor="email" className="text-sm font-medium">
  Email
</label>
<input id="email" type="email" />
```

Ou implícito (envolvendo):
```tsx
<label>
  <span className="text-sm font-medium">Email</span>
  <input type="email" />
</label>
```

`placeholder` **não substitui** label.

### Estados de erro

```tsx
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" className="text-xs text-danger" role="alert">
    Email inválido
  </p>
)}
```

### Required fields

```tsx
<label>
  Nome <span className="text-danger" aria-label="obrigatório">*</span>
</label>
<input required aria-required="true" />
```

## Imagens

### Decorativas
```tsx
<img src="/decoration.svg" alt="" />  // alt vazio, ignorado por screen readers
```

### Funcionais/informativas
```tsx
<img src="/chart.png" alt="Gráfico de vendas mostrando crescimento de 12% em Q3" />
```

### Ícones
```tsx
<Plus aria-hidden="true" />        // decorativo, junto com texto
<button aria-label="Fechar"><X /></button>  // funcional, sem texto
```

## ARIA

### Use ARIA apenas quando necessário

> "No ARIA é melhor que ARIA errado."

Prefira HTML semântico. ARIA só quando não há equivalente nativo.

### Atributos comuns

| Atributo            | Uso                                              |
|---------------------|--------------------------------------------------|
| `aria-label`        | Label invisível para elementos sem texto        |
| `aria-labelledby`   | Aponta para ID de elemento que serve como label |
| `aria-describedby`  | Aponta para ID com descrição adicional          |
| `aria-expanded`     | Em triggers de dropdown/accordion (true/false)  |
| `aria-current`      | "page" no link da rota atual                    |
| `aria-live`         | "polite"/"assertive" para anúncios dinâmicos    |
| `aria-hidden`       | Esconde de screen readers (uso parcimônia)      |
| `role`              | Quando elemento não tem semântica nativa        |

### Anúncios dinâmicos

Toasts, validação em tempo real, status updates:

```tsx
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

`polite` interrompe quando screen reader termina; `assertive` interrompe imediatamente (usar só em erros).

## Movimento e animação

### Respeitar preferência do sistema

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Tailwind tem variant `motion-reduce:` para classes específicas.

### Auto-play e movimento

- **Sem auto-play** de vídeos com som
- **Sem flashes** mais que 3 vezes/segundo (trigger de epilepsia)
- Animações em loop devem ter botão de pause

## Cores

### Não comunicar só por cor

Status, erros, sucessos não podem depender **apenas** de cor:

```tsx
// ❌ Errado — só cor
<span className="text-danger">Falha</span>

// ✅ Correto — cor + ícone
<span className="text-danger flex items-center gap-1">
  <XCircle className="size-3" /> Falha
</span>
```

Considere daltônicos: vermelho/verde são os mais problemáticos. Sempre adicione ícone, padrão ou texto.

## Testes obrigatórios

Antes de considerar uma tela acessível:

- [ ] Navegação completa **só com teclado** (sem mouse)
- [ ] Todos os elementos focáveis têm ring visível
- [ ] Esc fecha overlays
- [ ] Screen reader (VoiceOver/NVDA) consegue ler em ordem lógica
- [ ] Zoom 200% — layout não quebra, conteúdo legível
- [ ] [axe DevTools](https://www.deque.com/axe/devtools/) sem erros críticos
- [ ] Lighthouse Accessibility score ≥ 95

## Recursos

- [WebAIM](https://webaim.org/) — guias práticos
- [Inclusive Components](https://inclusive-components.design/) — patterns acessíveis
- [Radix UI Primitives](https://www.radix-ui.com/) — primitives já acessíveis (base do shadcn)
- [axe DevTools](https://www.deque.com/axe/devtools/) — extensão Chrome para auditar
