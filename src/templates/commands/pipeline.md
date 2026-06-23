# Pipeline Completo de Agentes

Execute o pipeline completo de agentes para a seguinte demanda:

**Demanda:** $ARGUMENTS

---

## Classificação de demanda e roteamento

Identifique o tipo da demanda e selecione o pipeline correto:
{{#if stack.agents.designer}}
### UI / Frontend
**Sinais:** "tela", "página", "componente", "layout", "form", "tabela", "card", "modal", "sidebar", "topbar", "responsivo", "design", "interface", "estilo"; arquivos em `src/components/`, `src/app/**/page.*`, `src/features/**/components/`

**Pipeline:** GitHub → Architect → **Designer** → Coder → Reviewer → QA → Security → Privacy → {{#if stack.agents.cost_engineer}}Cost Engineer → {{/if}}Docs → Reporter
{{/if}}

### Backend / Server
**Sinais:** "API", "endpoint", "service", "repository", "schema", "migration", "job", "queue"

**Pipeline:** GitHub → Architect → Coder → Reviewer → QA → Security → Privacy → {{#if stack.agents.cost_engineer}}Cost Engineer → {{/if}}Docs → Reporter

### Refactor (sem mudança comportamental)

**Pipeline:** GitHub → Architect → Coder → Reviewer → QA → Docs → Reporter
{{#if stack.agents.cost_engineer}}
### Provider Integration
**Sinais:** integração com API externa paga, configuração de provider, retry policies

**Pipeline:** GitHub → Architect → Coder → Reviewer → Cost Engineer → Security → Privacy → QA → Docs → Reporter
{{/if}}

### Prompt Update (projetos AI/ML)
**Sinais:** modificação em `profiles/**/prompts/**`, label `prompt-update`

**Pipeline:** Bypass — apenas review humano + commit. Sem agentes automatizados.

### Misto
**Pipeline:** composição das categorias acima conforme impacto

---

## Como orquestrar (delegação a subagents)

Você é o **orquestrador**. Cada agente já existe como **subagent escopado** em
`.claude/agents/` — com ferramentas e modelo próprios (agentes de análise são
**read-only**). **Delegue** cada fase ao subagent correspondente com a ferramenta
**Task** (`subagent_type` = nome do agente), em vez de assumir o papel você mesmo.
Benefício: contexto isolado por agente, menor privilégio e execução paralela.

**Handoff via artefatos.** Os agentes read-only não escrevem em disco — eles
**retornam** o resultado a você. Você (orquestrador, com escrita) persiste cada
saída em `.octechpus/run/<NN>-<agente>.md` e **passa os artefatos relevantes** como
contexto para os subagents seguintes. Esses arquivos são a memória do pipeline
(transientes — pode adicioná-los ao `.gitignore`).

**1. 🎯 MAESTRO (você, inline)** — antes de delegar:

a) **Classifique** a demanda (tipo, severidade) conforme as regras acima.

b) **Converta em critérios de sucesso testáveis** — Reescreva a demanda como
   resultados verificáveis. Exemplos:
   - "corrija o bug de login" → "credenciais válidas recebem JWT; inválidas
     retornam 401; teste X passa"
   - "melhore a performance da listagem" → "GET /items <100ms para 10k registros
     medido com k6"

c) **Liste suposições** — havendo ambiguidade de alto risco, pergunte antes de rotear.

d) **Selecione o pipeline** e grave os critérios em `.octechpus/run/00-maestro.md` —
   eles vão como contexto para TODOS os subagents seguintes.

### Fase sequencial (cada uma depende da anterior)

**2. 🐙 GITHUB (Fase 1)** — `Task(github)`: crie a issue, defina branch e labels (`gh` CLI).

**3. 📐 ARCHITECT** — `Task(architect)`: impacto, padrões, estrutura de implementação;
decide approved / needs_changes / rejected. Salve o plano em `02-architect.md`.
{{#if stack.agents.designer}}
**4. 🎨 DESIGNER** *(somente UI)* — `Task(designer)`: melhores práticas de UX/UI e
briefing técnico para o Coder (layout, componentes, tokens, estados, responsividade,
checklist p/ Reviewer). Salve em `03-designer.md`.
{{/if}}
**5. 💻 CODER** — `Task(coder)`, passando `02-architect.md`{{#if stack.agents.designer}} e `03-designer.md`{{/if}}:
implemente estritamente o plano. Mudanças cirúrgicas, error handling explícito.

### Fan-out paralelo (após o Coder — sem dependência entre si)

Dispare **em paralelo** (uma única mensagem, várias chamadas Task), passando o diff
do Coder a cada um:

- **6. 🔍 REVIEWER** — `Task(reviewer)`: review com severidade 🔴 BLOCKER / 🟡 WARNING / 🔵 SUGGESTION.{{#if stack.agents.designer}} Em UI, aplique a checklist do design system.{{/if}}
- **7. 🧪 QA** — `Task(qa)`: testes em {{stack.testing.framework}} (happy/error/edge), target {{stack.testing.coverage_target}}%.
- **8. 🛡️ SECURITY** — `Task(security)`: OWASP 2021 (SSRF, supply chain), API Top 10 (BOLA/BFLA), injection, IDOR, validação. Severidade.
- **8b. ⚖️ PRIVACY** — `Task(privacy)`: conformidade {{stack.compliance.framework}} (base legal, minimização, PII em logs/fixtures, retenção, transferência). Severidade.
{{#if stack.agents.cost_engineer}}- **9. 💰 COST ENGINEER** — `Task(cost-engineer)`: chamadas a APIs pagas, retries, loops, estimativa de custo.
{{/if}}

**Gate.** Agregue os achados em `.octechpus/run/`. Havendo 🔴 BLOCKER, volte ao
`coder` com os blockers e repita o fan-out — **teto de 2 iterações**; persistindo,
escale para um humano (regra do Maestro).

### Fase final

**10. 📚 DOCS** — `Task(docs)`: {{stack.docs.format}}, README/CHANGELOG, ADRs se necessário.

**11. 🐙 GITHUB (Fase 2)** — `Task(github)`: commits semânticos (Conventional Commits)
e PR com o relatório consolidado de todos os agentes (`gh` CLI).

**12. 📊 REPORTER** — `Task(reporter)`, passando todo o `.octechpus/run/`: relatório
final com métricas, status por agente, débitos técnicos e próximos passos.

---

## Tabela de Agentes

| # | Agente | Função |
|---|--------|--------|
| 1 | 🎯 Maestro | Orquestra, classifica e roteia |
| 2 | 🐙 GitHub | Issues, branches, commits, PRs |
| 3 | 📐 Architect | Impacto e planejamento técnico |
{{#if stack.agents.designer}}| 4 | 🎨 Designer | Guardião do design system — briefing técnico para UI |
{{/if}}| 5 | 💻 Coder | Implementação |
| 6 | 🔍 Reviewer | Code review + checklist de stack |
| 7 | 🧪 QA | Testes ({{stack.testing.framework}}) |
| 8 | 🛡️ Security | OWASP 2021 + API Top 10 + supply chain |
| 8b | ⚖️ Privacy | Conformidade {{stack.compliance.framework}} (proteção de dados) |
{{#if stack.agents.cost_engineer}}| 9 | 💰 Cost Engineer | Audit de custo operacional |
{{/if}}| 10 | 📚 Docs | {{stack.docs.format}}, README, CHANGELOG, ADRs |
| 11 | 🐙 GitHub | Commits semânticos e PR final |
| 12 | 📊 Reporter | Relatório final com métricas |

---

## Regras

- ❌ Nenhum agente aplicável pode ser pulado
- 🔄 Se qualquer agente rejeitar, volte ao agente relevante e corrija
- 📝 Mostre o output formatado de CADA agente antes de prosseguir
- ✅ Só considere completo quando TODOS aprovarem
- 📋 Relatório final incluído no PR description
