# CLAUDE.md

> **Este projeto utiliza o sistema 🐙 Octechpus de orquestração de agentes.**
> Toda mudança no código — feature, bugfix, refactor, hotfix — DEVE passar pelo pipeline completo.

---

## Stack Profile

- **Profile:** node-typescript *(base de herança — ver nota abaixo)*
- **Linguagem:** JavaScript (ESM — arquivos `.mjs`)
- **Runtime:** node>=18
- **Package Manager:** npm
- **Test Framework:** vitest
- **Validation:** nativa (sem biblioteca externa — CLI valida seus próprios args)
- **Docs Format:** JSDoc (sem TypeScript, portanto sem TSDoc)
- **Linter/Formatter:** nenhum configurado
- **Type Checker:** nenhum (sem tsconfig.json)

> ⚠️ **NOTA IMPORTANTE — leia antes de qualquer mudança:**
> Este projeto usa o profile `node-typescript` como base de herança, mas a
> implementação real é **JavaScript ESM puro** (`.mjs`), não TypeScript.
> Não existe `tsconfig.json`, `prettier`, `zod` nem `tsc` neste repositório.
> O profile `node-typescript` define regras para projetos *gerados* por este
> CLI — não para o próprio CLI. Agentes devem avaliar o código como JavaScript,
> não como TypeScript.

---

## 🐙 OCTECHPUS — Comandos

| Comando | Para quê |
|---------|----------|
| `/pipeline [demanda]` | Pipeline completo — todos os agentes em sequência |
| `/audit [escopo?]` | Raio-x completo do projeto ou módulo |
| `/architect [escopo]` | Análise arquitetural |
| `/design [demanda]` | Briefing de design system — stacks com `agents.designer = true` |
| `/review [escopo]` | Code review |
| `/qa [escopo]` | Criar testes |
| `/security [escopo]` | Audit de segurança |
| `/docs [escopo]` | Documentação |
| `/github-issue [demanda]` | Gestão GitHub |
| `/profiler` | Re-detectar stack e verificar drift de profile |
| `/cost [escopo]` | Audit de custo operacional — stacks com `agents.cost_engineer = true` |

## Pipeline

```
Maestro → GitHub → Architect → [Designer*] → Coder → Reviewer → QA → Security → [Cost Engineer*] → Docs → GitHub (PR) → Reporter
* Designer: ativo em nextjs-react  |  * Cost Engineer: ativo em python-ai-pipeline
```

## Regras universais

1. NENHUMA mudança vai para commit sem passar pelo pipeline
2. Se qualquer agente rejeitar, volta para o agente relevante
3. Pipeline só completo quando TODOS aprovarem
4. Relatório final incluído no PR
5. Decisões de impacto medium/high exigem ADR ANTES da implementação

## Conventional Commits

```
feat(scope): nova funcionalidade
fix(scope): correção de bug
refactor(scope): refatoração
docs(scope): documentação
test(scope): testes
chore(scope): manutenção
perf(scope): performance
```

## Branches

```
[type]/[issue-number]-[description]
```
Exemplo: `feature/42-new-endpoint`, `bugfix/55-validation`, `refactor/78-cleanup`

---

## Padrões da Stack

### Testes

- Vitest para testes unitários e de integração
- Fixtures em `tests/fixtures/` para simular projetos reais
- Coverage target: **80%**

> ⚠️ **NÃO usar:** Testing Library, MSW, Playwright — não estão instalados.
> Este é um CLI Node.js, não uma aplicação web.

### Validação

Validação nativa via `if`/`throw` e js-yaml (única dependência externa). Sem Zod.

### Documentação

- Formato: **JSDoc** (não TSDoc — o projeto é JavaScript, não TypeScript)
- README.md e CHANGELOG.md atualizados a cada mudança
- ADRs em `docs/adr/` para decisões de impacto medium/high

### Convenções

- Imports: relativos com extensão `.mjs` explícita
- Naming: camelCase para funções, UPPER_CASE para constantes de módulo

### Padrões PROIBIDOS

Os seguintes padrões NÃO devem aparecer no código deste projeto:

- `: any` / `as any` / `// @ts-ignore` — sem TypeScript, mas evitar cast implícito em JSDoc
- `JSON\.parse\([^)]+\)(?!.*catch)` — parse sem try/catch
- `eval(` — sem eval

> ⚠️ **`console.log` NÃO é proibido neste projeto.** Este é um CLI que usa
> `console.log` como mecanismo de output para o usuário (~200 usos legítimos).
> A regra de proibir `console.log` vem do profile `node-typescript` e se aplica
> aos projetos *gerados* por este CLI, não ao CLI em si.

### Pastas com Guardrail (read-only sem aprovação)

- `src/profiles/` — mudanças exigem label `profiles` no PR
- `src/templates/` — mudanças exigem label `templates` no PR

## Segurança

- OWASP Top 10 checklist obrigatório
- Secrets nunca hardcoded
- `.env` no `.gitignore` — nunca commitado
- Sem dependências desnecessárias (manter minimal: apenas `js-yaml`)

## Referência dos Agentes

Consulte `docs/OCTECHPUS_AGENTS.md` para prompts detalhados de cada agente.

---

## 📋 PROJECT DOCUMENTATION

### O que é este projeto

CLI instalável (`npx octechpus` / `npm i -g octechpus`) que scaffolda o
sistema Octechpus de agentes em projetos terceiros. Não é uma aplicação web,
não tem API, não tem frontend.

### Stack real

| Item | Realidade |
|------|-----------|
| Linguagem | JavaScript ESM (`.mjs`) — sem TypeScript |
| Única dep de produção | `js-yaml` (parse de profiles YAML) |
| Única dep de dev | `vitest` (testes) |
| Configurações ausentes | tsconfig, prettier, eslint, zod |
| Output do CLI | `console.log` / `console.error` — legítimo e intencional |

### Estrutura de pastas

```
src/
  cli.mjs              — entrada principal (~940 linhas, todos os comandos)
  lib/
    file-ops.mjs       — I/O de arquivos
    profile-loader.mjs — carrega e resolve herança de profiles YAML
    prompts.mjs        — cores e formatação CLI
    stack-detector.mjs — auto-detecção de stack
    template-renderer.mjs — engine de templates {{var}}, {{#if}}, {{#each}}
  profiles/            — profiles YAML (node-typescript, nextjs-react, etc.)
  templates/           — templates de comandos, design-system, github, docs
tests/
  *.test.mjs           — 85 testes Vitest
  fixtures/            — projetos mínimos para testar auto-detecção
```

### Versão

`VERSION` em `src/cli.mjs` deve sempre bater com `version` em `package.json`.
Ao bumpar versão, atualizar ambos + `CHANGELOG.md`.

### Como publicar no npm

A publicação é feita **manualmente pelo terminal** — não existe CI de publish.
O `test.yml` roda os testes em todo push/PR, mas o publish é sempre local.

Passo a passo para uma nova release:

```bash
# 1. Garantir que está logado no npm
npm whoami   # deve retornar o usuário correto

# 2. Bumpar a versão nos dois lugares obrigatórios
#    - package.json  → campo "version"
#    - src/cli.mjs   → constante VERSION

# 3. Atualizar CHANGELOG.md com a nova versão e data

# 4. Rodar os testes
npm test

# 5. Commit, push e publicar
git add package.json src/cli.mjs CHANGELOG.md
git commit -m "chore(release): bump version to X.Y.Z"
git push origin main
npm publish --access public
```

### Erros recorrentes a evitar

1. **Proibir console.log neste projeto** — não faz sentido, é um CLI
2. **Pedir TypeScript/tsconfig** — o projeto é JavaScript ESM deliberadamente
3. **Pedir zod/prettier/tsc** — não estão instalados e não devem ser exigidos
4. **Citar Testing Library/MSW/Playwright** — não instalados, só Vitest
5. **VERSION no cli.mjs desatualizado** — sempre manter em sync com package.json
