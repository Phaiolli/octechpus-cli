# 004. `init` com dois caminhos de entrada (projeto em andamento × projeto novo)

**Data:** 2026-07-02
**Status:** Accepted (v2.10.0)

## Contexto

Até a v2.9.0, `octechpus init` (sem `--stack`) sempre tentava auto-detectar a
stack e, quando a confiança não era alta, exibia a **lista completa de profiles**
para o usuário escolher. Isso funciona, mas mistura dois cenários muito diferentes
num mesmo fluxo:

1. **Projeto em andamento** — já existe código; a stack deveria ser inferida da
   base existente e a instalação precisa ser *coerente* com o que já está lá.
2. **Projeto novo** — não há código para detectar; o usuário sabe o que quer
   construir (tipicamente descrito num documento de iniciação / PID).

No primeiro caso, mostrar uma lista de profiles é ruído — a detecção já resolve.
No segundo, a detecção pela base de código não tem sinal nenhum (repo vazio), e o
usuário acaba escolhendo às cegas de uma lista longa.

## Decisão

Substituir a entrada da seleção de stack por um **menu de duas alternativas**
(apresentado apenas no modo interativo, quando nenhuma flag foi passada):

- **A) Projeto em andamento** → `selectForExistingProject()` → `detectStack(projectDir)`.
- **B) Projeto novo** → `selectForNewProject()` → pede um documento PID (`.md`),
  valida, e chama `detectStack(projectDir, { describeFile })`; se o PID for
  inválido/ausente no modo interativo, cai no **modo guiado** determinístico
  (`runGuidedSelection`).

A lógica comum "resultado de `detectStack` → profile" (alta = auto, média =
confirma, baixa/none = lista + guiado) foi **extraída para `resolveDetectedProfile()`**,
reutilizada pelos dois caminhos — sem duplicação.

### Retrocompatibilidade

- `--stack=<name>` continua fazendo bypass total (resolve direto).
- `--describe=<file.md>` continua funcionando e agora entra **diretamente** no
  caminho B, de forma não-interativa. PID inválido via flag → erro explícito
  (`process.exit(1)`), previsível para uso em scripts/CI.

## Alternativas consideradas

- **Manter a lista longa como padrão** — rejeitado: é o ruído que motivou a mudança.
- **Inferir o cenário automaticamente** (repo vazio ⇒ novo) — rejeitado como
  *default* silencioso: a presença de `package.json`/`.git` já é usada para outras
  decisões e um palpite errado degradaria a experiência; o menu explícito é mais
  claro e custa um toque. As flags continuam permitindo pular o menu.

## Consequências

- **+** Fluxo mais claro; cada cenário usa o sinal certo (código vs. PID).
- **+** Determinístico e offline (sem rede/LLM), coerente com rodar via `npx`.
- **−** Um passo interativo a mais para quem não usa flags (mitigado: Enter = A).
- Mudança de comportamento visível do `init` — daí este ADR (impacto medium).
