# Claude Design System

Design system pessoal para sistemas web e dashboards, otimizado para uso com **Claude Code** no VS Code.

> Fonte única da verdade. Importado em todos os projetos. Sempre.

## O que tem aqui

```
claude-design-system/
├── CLAUDE.md                    ← Lido pelo Claude Code (entry point)
├── README.md                    ← Você está aqui
├── tokens/
│   ├── tokens.css               ← Variáveis CSS (cores, spacing, typography)
│   └── tailwind.preset.js       ← Preset Tailwind a importar
├── docs/
│   ├── 01-principles.md         ← Princípios UX/UI
│   ├── 02-architecture.md       ← Estrutura de pastas
│   ├── 03-layout.md             ← Layouts (sidebar, topbar, content)
│   ├── 04-components.md         ← Receitas de componentes
│   ├── 05-navigation.md         ← Navegação e hierarquia
│   ├── 06-responsive.md         ← Breakpoints e responsividade
│   ├── 07-icons.md              ← Sistema de ícones (Lucide)
│   └── 08-accessibility.md      ← A11y obrigatória
└── templates/
    └── new-project-CLAUDE.md    ← Template para CLAUDE.md de novos projetos
```

## Identidade

- **Tema padrão:** dark com toggle para light
- **Estilo:** moderno, glassmorphism + gradientes sutis
- **Stack base:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Agnóstico de framework:** React, Next.js, Vue, Svelte

## Como usar

### 1) Coloque este folder em local fixo

Recomendado:

```bash
# Opção A — pasta dedicada na home
git clone [seu-repo] ~/dev/claude-design-system

# Opção B — em monorepo
packages/claude-design-system/
```

Versionar em Git é recomendado — assim você evolui o sistema ao longo do tempo.

### 2) Em cada projeto novo

**Passo 1:** Copiar `templates/new-project-CLAUDE.md` para a raiz do projeto como `CLAUDE.md` e ajustar o caminho de referência ao design system.

**Passo 2:** Importar tokens CSS:

```bash
# Opção A — copiar o arquivo
cp ~/dev/claude-design-system/tokens/tokens.css src/styles/tokens.css

# Opção B — symlink (mantém sincronizado)
ln -s ~/dev/claude-design-system/tokens/tokens.css src/styles/tokens.css
```

No `globals.css` do projeto:

```css
@import './tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Passo 3:** Configurar Tailwind preset em `tailwind.config.js`:

```js
module.exports = {
  presets: [require('../path/to/claude-design-system/tokens/tailwind.preset.js')],
  content: ['./src/**/*.{ts,tsx,js,jsx,vue,svelte}'],
  // ... resto da config específica do projeto
};
```

**Passo 4:** Inicializar shadcn/ui:

```bash
npx shadcn-ui@latest init
```

Quando perguntar:
- Style: **New York**
- Base color: **Slate** (será sobrescrito pelos nossos tokens)
- CSS variables: **Yes**
- Default theme: **Dark**

**Passo 5:** Instalar dependências base:

```bash
npm install lucide-react clsx tailwind-merge class-variance-authority tailwindcss-animate
```

**Passo 6:** Adicionar fonte Inter ao HTML:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3) Trabalhar com Claude Code no VS Code

Quando você abrir o projeto no VS Code com Claude Code:

1. Claude Code lê automaticamente o `CLAUDE.md` do projeto
2. Esse `CLAUDE.md` aponta para o design system via `@` references
3. Claude consulta os documentos relevantes ao gerar código
4. Toda interface gerada segue os padrões definidos

Para garantir que Claude está usando o design system, você pode confirmar perguntando:
> "Quais regras do design system você está seguindo neste componente?"

## Atualizando o design system

Quando você quiser evoluir o sistema:

1. Edite os arquivos diretamente (`tokens.css`, docs, etc.)
2. Commit as mudanças no Git
3. Nos projetos que usam **symlink** ou **monorepo**, mudanças são imediatas
4. Em projetos com **cópia**, atualize: `cp -r tokens/* path/to/project/src/styles/`

### Versionamento (opcional, mas recomendado)

Tagueie versões major em Git:

```bash
git tag v1.0.0
git push --tags
```

Em projetos que precisam de versão fixa, faça checkout da tag em vez do branch.

## Princípios fundadores

1. **Uma fonte da verdade.** Sempre. Sem duplicação.
2. **Tokens são imutáveis localmente.** Se um projeto precisa de cor diferente, ela vira novo token no design system, não exceção.
3. **Stack-agnóstico.** Tokens em CSS variables funcionam em qualquer framework.
4. **Documentação executável.** Os arquivos não são só docs — Claude lê e aplica.
5. **Glassmorphism com critério.** Modal e overlay sim, fundo grande não.
6. **Acessibilidade não é opcional.** WCAG AA é o piso.

## Próximos passos sugeridos

Coisas que você pode adicionar conforme amadurece o sistema:

- [ ] Pasta `examples/` com screenshots de boas implementações
- [ ] Pasta `snippets/` com código pronto de componentes-chave (KPICard, DataTable, etc.)
- [ ] Storybook ou Ladle para visualizar componentes
- [ ] Versionamento com changelog
- [ ] Hooks padrão (`use-theme`, `use-sidebar-state`)
- [ ] Validação visual via screenshot test (Playwright)
- [ ] Light theme refinement (atualmente é uma adaptação do dark)
