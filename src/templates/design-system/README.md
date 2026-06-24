# Stratum Design System — Pacote de handoff

Este `design-system/` contém tudo que o Claude Code precisa para implementar o
Stratum DS num codebase React/Next.js real. No fluxo Octechpus ele é a fonte da
verdade visual lida pelo agente `/design` (Designer).

## O que tem aqui

```
design-system/
├── CLAUDE.md                    ← contexto completo (lido pelo /design e referenciável da raiz)
├── README.md                    ← você está aqui
├── PROMPT_STARTERS.md           ← prompts prontos para iniciar o trabalho
├── reference/
│   └── stratum-design-system.html   ← spec visual (abra no navegador)
└── tokens/
    ├── tokens.json              ← fonte da verdade (formato DTCG)
    ├── tokens.css               ← CSS custom properties (jogue em styles/)
    ├── tokens.ts                ← forma de objeto TS (importe no código JS)
    └── tailwind.preset.ts       ← preset do Tailwind v4 (estende o theme)
```

## Como usar no fluxo Octechpus

O `design-system/` foi instalado pelo `npx octechpus design-system add`. A partir
daqui:

1. Rode `/design [demanda]` no Claude Code para acionar o agente Designer. Ele lê
   este pacote como fonte da verdade visual e produz o briefing para o Coder.
2. Para sincronizar com a versão mais recente do template: `npx octechpus design-system update`.
3. Opcional: no `CLAUDE.md` da raiz do projeto, referencie `@./design-system/CLAUDE.md`
   para que o contexto seja carregado também fora do pipeline.

## Fidelidade

Esta é uma especificação de **alta fidelidade**: cores finais (OKLCH), tipografia
final (Geist/Geist Mono), escala de espaçamento final, tokens de motion finais,
anatomia de componente final. O desenvolvedor deve bater com a referência pixel a
pixel usando os tokens, não a sua interpretação.

## Referência visual

`reference/stratum-design-system.html` é um arquivo HTML standalone e auto-contido.
Abra-o direto em qualquer navegador moderno para ver:

- Todas as foundations (cor, tipografia, espaçamento, raio, sombra, motion, ícones)
- 60+ componentes com estados e variantes
- 11 templates de página (Home institucional, Dashboard SaaS, Login + 2FA, Listagem
  com filtros, Settings + LGPD, Mobile, Política de Privacidade, Cookie banner +
  modal, 404, Manutenção, Sucesso)
- Diretrizes de LGPD, acessibilidade e voz/microcopy

O header tem um **toggle de tema (dark ↔ light)** e um **seletor de accent
(blue/violet/emerald/amber/rose)** — alterne-os para ver como o sistema inteiro
responde a uma troca de marca.

## Customização de marca

Para transformar o Stratum no design system de uma marca específica:

1. Em `tokens/tokens.json`, substitua `color.brand.primary` e `color.brand.accent`
   pelos valores da marca
2. Coloque o logo da marca em `public/brand/` (horizontal, vertical, símbolo, favicon)
3. Opcionalmente troque o par de fontes em `tokens/tokens.json` → `typography.font-sans`
4. Re-exporte o CSS/Tailwind a partir de `tokens.json`

Todo o resto — espaçamento, componentes, motion, acessibilidade — é herdado sem mudança.

## Stack assumida

Se o `CLAUDE.md` não sobrescrever:

- Next.js 15 (App Router)
- TypeScript strict
- Tailwind CSS v4
- Radix UI primitives
- Lucide React icons
- Geist + Geist Mono via `geist/font`
- `next-themes` para troca de tema
- `class-variance-authority` para variantes

## Importante

O HTML em `reference/` é uma **referência de design**, não código de produção. Não
entregue a marcação dele como está. A tarefa é recriá-la em React + Tailwind
idiomático, com os tokens como contrato.

O texto da página de LGPD em `reference/` é **placeholder estrutural**. Seu time
jurídico deve revisar e substituir antes de publicar qualquer conteúdo de privacidade.
