# CLAUDE.md — [Nome do Projeto]

## Sobre este projeto

[Descrição curta do que é este projeto, qual o domínio, principais features]

**Stack:**
- Framework: [React / Next.js / Vue / Svelte]
- Estilização: Tailwind CSS + shadcn/ui (preset do design system)
- Ícones: Lucide
- TypeScript: [sim/não]

## Design System

Este projeto **segue o design system pessoal**. Todas as decisões de UI, padrões de componentes e tokens estão documentados em:

```
@../claude-design-system/CLAUDE.md
```

> Substituir o caminho acima pelo caminho real do design system na sua máquina ou no monorepo. Exemplos:
> - Symlink local: `@./design-system/CLAUDE.md`
> - Monorepo: `@../../packages/design-system/CLAUDE.md`
> - Path absoluto: `@~/dev/claude-design-system/CLAUDE.md`

**Sempre consulte essa documentação antes de gerar componentes ou layouts.**

Documentos específicos para referência rápida:

- `@../claude-design-system/docs/01-principles.md` — Princípios de UX/UI
- `@../claude-design-system/docs/02-architecture.md` — Estrutura de pastas
- `@../claude-design-system/docs/03-layout.md` — Layouts de página
- `@../claude-design-system/docs/04-components.md` — Receitas de componentes
- `@../claude-design-system/docs/05-navigation.md` — Padrões de navegação
- `@../claude-design-system/docs/06-responsive.md` — Estratégia responsiva
- `@../claude-design-system/docs/07-icons.md` — Sistema de ícones
- `@../claude-design-system/docs/08-accessibility.md` — Acessibilidade

## Particularidades deste projeto

### Sobreposições ao design system
[Documentar aqui qualquer desvio justificado do design system base. Exemplos:]
- [O que foi mudado e por quê]

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
npm run dev       # iniciar dev server
npm run build     # build de produção
npm run test      # rodar testes
npm run lint      # lint
```

## Estrutura

Ver `@../claude-design-system/docs/02-architecture.md` para estrutura padrão.

Particularidades deste projeto:
- [Pastas adicionais ou diferentes]

## Quando estiver em dúvida

1. Consulte primeiro o design system
2. Se não cobrir, pergunte antes de inventar um padrão novo
3. Padrões novos definidos aqui devem **eventualmente** ser promovidos ao design system se forem genéricos
