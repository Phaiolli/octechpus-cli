# CLAUDE.md — [Nome do Projeto]

## Sobre este projeto

[Descrição curta do que é este projeto, qual o domínio, principais features]

**Stack:**
- Framework: [Next.js 15 (App Router) / React / Vue / Svelte]
- Estilização: Tailwind CSS v4 (preset do Stratum) + Radix UI primitives
- Ícones: Lucide
- Tema: next-themes via `data-stratum-theme`
- TypeScript: [sim/não]

## Design System

Este projeto **segue o Stratum Design System**. Todas as decisões de UI, padrões de
componentes e tokens estão documentados em:

```
@./design-system/CLAUDE.md
```

> Ajuste o caminho acima se o design system não estiver na raiz. Exemplos:
> - Local (padrão Octechpus): `@./design-system/CLAUDE.md`
> - Monorepo: `@../../packages/design-system/CLAUDE.md`

**Sempre consulte essa documentação antes de gerar componentes ou layouts.** No
fluxo Octechpus, rode `/design [demanda]` para acionar o Designer, que lê o Stratum
como fonte da verdade visual.

Referências rápidas do Stratum:

- `@./design-system/tokens/tokens.json` — fonte da verdade dos tokens (DTCG, OKLCH)
- `@./design-system/tokens/tokens.css` — variáveis CSS a importar em `globals.css`
- `@./design-system/tokens/tailwind.preset.ts` — preset do Tailwind v4
- `@./design-system/reference/stratum-design-system.html` — spec visual (abrir no navegador)

## Particularidades deste projeto

### Sobreposições ao design system
[Documentar aqui qualquer desvio justificado do Stratum. Exemplos:]
- [O que foi mudado e por quê]

### Brand
[Valores de marca aplicados sobre o Stratum brand-agnostic:]
- `color.brand.primary` / `color.brand.accent` deste projeto
- Logo em `public/brand/`

### Domain-specific
[Conceitos do domínio que o Claude precisa entender para gerar código apropriado]
- Exemplo: "Neste projeto, 'Cliente' é uma empresa, não pessoa física"
- Exemplo: "Pedidos têm 5 status: rascunho, pendente, aprovado, faturado, cancelado"

### Convenções de código
- [Convenções específicas: nomenclatura, padrões, etc.]

### APIs e integrações
- [Endpoints principais, autenticação, etc.]

## Comandos comuns

```bash
pnpm dev          # iniciar dev server
pnpm build        # build de produção
pnpm test         # rodar testes
pnpm lint         # lint
```

## Estrutura

Ver `@./design-system/CLAUDE.md` (seção "Layout de arquivos a produzir") para a
estrutura padrão.

Particularidades deste projeto:
- [Pastas adicionais ou diferentes]

## Quando estiver em dúvida

1. Consulte primeiro o Stratum (`design-system/`)
2. Se não cobrir, pergunte antes de inventar um padrão novo
3. Padrões novos genéricos devem **eventualmente** ser promovidos ao Stratum
