# 002. Evolução de Segurança e Eficiência do Sistema de Agentes

**Data:** 2026-06-23
**Status:** Accepted (Fases 1–3 implementadas na v2.5.0)

## Contexto

Hoje o Octechpus scaffolda os 13 agentes como **slash commands** (`.claude/commands/*.md`) — templates de prompt que o Claude Code injeta numa **única conversa** quando o usuário roda `/pipeline`. Essa arquitetura tem três limitações estruturais:

1. **Nenhum modelo de permissão.** O CLI **não gera** `settings.json` nem hooks.
   Todos os agentes herdam as permissões totais (Write/Edit/Bash) da sessão.
   Agentes que deveriam apenas analisar — Reviewer, Security, Privacy, Architect —
   podem reescrever arquivos e rodar shell. Um "agente de segurança" com permissão
   de escrita é superfície de risco, não controle.
2. **Contexto único e crescente.** Todo o pipeline roda numa só conversa. Na etapa
   do Docs, o modelo carrega o raciocínio inteiro de Architect+Coder+Reviewer+QA.
   Isso aumenta custo (tokens) e degrada qualidade (atenção diluída).
3. **Execução estritamente sequencial.** Reviewer, Security, Privacy e Docs não
   dependem entre si, mas rodam um após o outro porque compartilham a thread.

As regras de guardrail já documentadas no CLAUDE.md (`src/profiles/` e
`src/templates/` como read-only) existem apenas como **texto** — não há mecanismo
que as imponha; o modelo pode ignorá-las.

> **Escopo:** este ADR trata do **sistema gerado** pelo `octechpus init` (o produto),
> não do código do CLI em si. O CLI continua sendo um scaffolder de única dependência
> (`js-yaml`); a evolução está no que ele **escreve** no projeto-alvo.

## Decisão

Evoluir o sistema gerado em **fases independentes e incrementais**, priorizando
ganhos de segurança que **não exigem** reescrever a orquestração antes da refatoração
estrutural. Cada fase entrega valor sozinha e pode ser lançada como minor version.

### Fase 1 — Modelo de permissão (segurança, baixo esforço)

Gerar `.claude/settings.json` no `init`, derivado do profile:

- **Allowlist de Bash** por stack (ex.: `npm test`, `git status`) em vez de shell aberto.
- **Restrição de escrita**: bloquear writes fora das pastas de código do projeto.
- **Guardrails como trava real**: bloquear escrita nas pastas read-only que o CLAUDE.md
  já declara — transformando regra textual em controle imposto.
- **Defesa contra prompt injection**: instrução transversal de que conteúdo lido do
  repositório (código, `.md`, issues) é **dado**, nunca comando.

Não depende de subagents. Aplicável a projetos existentes via `octechpus update`.

### Fase 2 — Migração para subagents (isolamento + tool scoping)

Converter os agentes de `.claude/commands/` para `.claude/agents/` (subagents reais),
cada um com:

- **Ferramentas escopadas**: Reviewer/Security/Privacy/Architect ⇒ read-only
  (sem Write/Edit/Bash); Coder ⇒ Write/Edit/Bash; etc.
- **Contexto isolado** por agente, com **handoff explícito via artefatos**
  (plano do Architect, diff do Coder, relatório do Reviewer) em vez de thread
  compartilhada. O Maestro passa a ser um **orquestrador que delega**.

`/pipeline` continua como command de orquestração, mas invoca subagents em vez de
trocar de persona na mesma conversa.

### Fase 3 — Eficiência (custo + velocidade)

Habilitado pela Fase 2:

- **Model tiering**: modelo barato (Haiku) para Docs/Reporter/Profiler; modelo forte
  (Opus) para Architect/Security. Definido por campo no profile YAML.
- **Paralelismo**: Reviewer + Security + Privacy + Docs rodam concorrentes após o Coder,
  pois não têm dependência mútua.

### Transversal — Integridade

Reusar o `.octechpus/manifest.json` (hashes SHA-256 já existentes para rastrear
customização) também como **verificação de integridade**: `octechpus doctor` alerta
se um arquivo de agente foi alterado fora do fluxo esperado.

## Alternativas consideradas

**A. Ir direto para subagents, pulando a Fase 1**
Descartada: o maior risco atual (agentes de análise com permissão de escrita) se
resolve com permissões, não com isolamento. Permissões dão ganho de segurança
imediato e barato; subagents são refatoração maior. Fazer permissões primeiro
desacopla o ganho de segurança do risco da refatoração.

**B. Manter slash commands e só adicionar settings.json**
Descartada como solução final: `settings.json` aplica permissões à **sessão inteira**,
não por agente. Não dá para o Reviewer ser read-only e o Coder ter escrita na mesma
thread. O tool scoping por agente **exige** subagents (Fase 2). Por isso a Fase 1 é
um piso de segurança, não o teto.

**C. Reescrever o orquestrador fora do Claude Code (Agent SDK / serviço próprio)**
Descartada para este ciclo: muda o produto de "scaffolder para Claude Code" para
"runtime de agentes", com billing, deploy e manutenção próprios. Fora do escopo;
pode ser um ADR futuro se houver demanda por execução headless (CI/cron).

**D. Não fazer nada — confiar nas regras textuais do CLAUDE.md**
Descartada: regra em prosa não é controle de segurança. Um agente pode ignorá-la;
um hook `PreToolUse` não.

## Consequências

- **Positivas**
  - Agentes de análise viram read-only de fato (princípio do menor privilégio).
  - Guardrails de pasta passam a ser impostos por hook, não sugeridos por texto.
  - Custo e qualidade melhoram com contexto isolado e model tiering.
  - Pipeline mais rápido com paralelismo do pós-Coder.
- **Negativas**
  - Fase 2 perde a thread compartilhada entre agentes ⇒ exige projetar artefatos de
    handoff (plano, diff, relatório). É o maior item de esforço do roadmap.
  - Subagents e settings.json adicionam superfície de manutenção aos templates.
  - Projetos já scaffoldados precisam de `octechpus update` para receber cada fase.
- **Neutras**
  - O CLI permanece com única dependência de produção (`js-yaml`).
  - `/pipeline` continua sendo o ponto de entrada para o usuário.

## Questões em aberto

1. Allowlist de Bash por profile: lista fixa por stack ou campo configurável no YAML?
2. Formato do artefato de handoff entre subagents (arquivo em `.octechpus/run/`? saída
   estruturada?) — definir antes de iniciar a Fase 2.
3. Model tiering: padrão por agente embutido no template ou override por profile?
4. Compatibilidade: manter os `.claude/commands/` como fallback durante a transição
   para subagents, ou migrar de uma vez com bump major?

## Notas de implementação (v2.5.0)

Decisões tomadas na implementação, refinando o plano original:

- **Guardrails via `permissions.deny`, não via hook shell.** O plano citava um hook
  `PreToolUse`. Na prática, regras declarativas `Write(<path>/**)` / `Edit(<path>/**)`
  derivadas de `guardrails.read_only_paths` entregam a mesma garantia sem shippar um
  script externo (menos superfície, nada para escapar/manter). Hooks ficam reservados
  para casos dinâmicos futuros.
- **Geração programática, não via template renderer.** O renderer só faz substituição
  escalar (`{{stack.x}}`) e loops simples — não emite JSON estruturado. Logo
  `settings.json` e os `.claude/agents/*.md` são montados em código (`buildSettings` /
  `buildSubagent` em `cli.mjs`) a partir do profile resolvido.
- **Subagents são aditivos.** Os `.claude/commands/` (incl. `pipeline`/`audit`) seguem
  como pontos de entrada de orquestração; os subagents em `.claude/agents/` adicionam o
  escopo de ferramentas + modelo. Resolve a questão em aberto #4 a favor de **coexistência**
  (sem bump major). O corpo de cada subagent reusa o prompt do command correspondente.
- **Compatibilidade preservada.** `update`/`profile switch` re-renderizam os novos
  arquivos respeitando a mesma lógica de customização (hash SHA-256 no manifest) dos
  commands. Nenhum profile precisou de campo obrigatório novo (`required_placeholders`
  inalterado), então todos os profiles continuam válidos.
