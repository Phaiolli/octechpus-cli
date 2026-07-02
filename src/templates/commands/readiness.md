# 🧭 Readiness — Scorecard de Prontidão para o Maestro

Gere o scorecard de prontidão técnica do projeto e **publique-o na Issue de Prontidão**
(consumida pela plataforma Maestro). Escopo/parâmetros: $ARGUMENTS

---

## Fonte dos dados

1. Prefira ler os artefatos já produzidos pelo pipeline/audit em `.octechpus/run/`
   (ex.: `02-architect.md`, reviewer, `qa`, `security`, `privacy`, `docs`, github).
   Extraia o **score [1-10]** de cada eixo.
2. Se não houver artefatos recentes, rode `/audit` antes (ou delegue os subagents
   read-only via `Task(...)`) e então prossiga.

## Mapeamento eixo → camada (score 0-100 = eixo × 10)

| Camada (`key`)   | Origem no octechpus            | `min` padrão | `required` |
|------------------|--------------------------------|:---:|:---:|
| `architecture`   | Architect                      | 70  | sim |
| `code_quality`   | Reviewer                       | 70  | sim |
| `tests`          | QA                             | 75  | sim |
| `security`       | Security (OWASP)               | 80  | sim |
| `privacy`        | Privacy (LGPD/GDPR)            | 75  | sim |
| `docs`           | Docs                           | 60  | não |
| `git_practices`  | GitHub audit                   | 60  | não |

Se existir o eixo Cost Engineer, inclua `cost` (`min` 60, `required` não).
Se houver `.octechpus/readiness.config.json`, use os `min`/`required` de lá (override).

## Cálculo

- `score` de cada camada = eixo × 10; `pass = score >= min`.
- `overall_score` = média das camadas; **piso**: se `security` ou `privacy` < 40,
  capar `overall_score` em 40 e marcar `floor_applied: true`.
- `gate_status = "ready"` se toda camada `required` tem `pass: true`, senão `"blocked"`.
- `commit` = `git rev-parse --short HEAD`; `branch` = `git branch --show-current`.

## Issues pendentes (relacionar prontidão × pendências)

Rode `gh issue list --state open --json number,title,labels --limit 100`.
- Preencha `pending_issues` com `open` (total) e as contagens `critical`/`high`
  (por labels de prioridade/severidade).
- Para cada camada com `pass: false`, aponte em `blocking_issues` os números das
  issues abertas cuja label mapeia àquela camada (ex.: `security` → issues com label
  de segurança; `tests` → `qa`/`test`; etc.).

## Publicar na Issue de Prontidão (via `gh`)

Monte o **corpo** (`.octechpus/run/readiness-body.md`) com, nesta ordem:
1) uma tabela humana (camada · score/min · ✅/❌ · issues), e
2) **um único** bloco ` ```json ` no formato `maestro.readiness/v1` (seção do contrato).

Monte um **comentário** curto de histórico (`.octechpus/run/readiness-comment.md`)
com data, commit, `overall_score` e `gate_status`.

O corpo deve conter **exatamente um** bloco `json` com este formato (schema `maestro.readiness/v1`):

```json
{
  "schema": "maestro.readiness/v1",
  "scope": "technical",
  "source": "octechpus",
  "generated_at": "2026-07-02T12:00:00Z",
  "commit": "abc1234",
  "branch": "main",
  "overall_score": 78,
  "floor_applied": false,
  "gate_status": "blocked",
  "layers": [
    { "key": "architecture", "label": "Arquitetura",        "score": 85, "min": 70, "required": true,  "pass": true,  "blocking_issues": [] },
    { "key": "code_quality", "label": "Qualidade de código","score": 72, "min": 70, "required": true,  "pass": true,  "blocking_issues": [] },
    { "key": "tests",        "label": "Testes/QA",           "score": 60, "min": 75, "required": true,  "pass": false, "blocking_issues": [42, 57] },
    { "key": "security",     "label": "Segurança",           "score": 90, "min": 80, "required": true,  "pass": true,  "blocking_issues": [] },
    { "key": "privacy",      "label": "Privacidade/LGPD",    "score": 80, "min": 75, "required": true,  "pass": true,  "blocking_issues": [] },
    { "key": "docs",         "label": "Documentação",        "score": 55, "min": 60, "required": false, "pass": false, "blocking_issues": [63] },
    { "key": "git_practices","label": "Práticas GitHub",     "score": 70, "min": 60, "required": false, "pass": true,  "blocking_issues": [] }
  ],
  "pending_issues": { "open": 12, "critical": 2, "high": 3 }
}
```

Então execute (idempotente — 1 issue fixa por repo, encontrada pela label):

```bash
LABEL="maestro:readiness"
TITLE="🐙 Maestro — Readiness Report"
gh label create "$LABEL" --description "Scorecard de prontidão consumido pelo Maestro" --color 5A4AB7 >/dev/null 2>&1 || true
NUM=$(gh issue list --label "$LABEL" --state all --limit 1 --json number --jq '.[0].number')
if [ -z "$NUM" ] || [ "$NUM" = "null" ]; then
  gh issue create --title "$TITLE" --label "$LABEL" --body-file .octechpus/run/readiness-body.md
else
  gh issue edit "$NUM" --body-file .octechpus/run/readiness-body.md
  gh issue comment "$NUM" --body-file .octechpus/run/readiness-comment.md
fi
```

Ao final, imprima um resumo: por camada (score/min, ✅/❌), `overall_score`,
`gate_status` e o número da issue publicada.

## Regras

- ❌ Não invente scores — se um eixo não tem fonte, marque a camada como
  `score: 0`, `pass: false` e registre a lacuna no corpo humano.
- 🔒 `scope` é sempre `"technical"`. Nunca emita camadas não-técnicas
  (marketing/legal/negócio) — essas são do Maestro.
- 1️⃣ Emita **exatamente um** bloco `json` no corpo.
- 🧾 A label `maestro:readiness` é o identificador estável da issue — não a remova.
