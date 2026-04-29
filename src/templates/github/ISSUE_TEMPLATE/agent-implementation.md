---
name: "🤖 Runtime Agent Implementation"
about: Implementar ou modificar um agente de runtime do projeto
title: "[agent] "
labels: runtime-agent
assignees: ""
---

## Agente

- **Nome:**
- **Tipo:** new | modify | refactor

## Responsabilidade

<!-- 1 frase descrevendo o que este agente faz -->

## Inputs e outputs

- **Input:** <!-- tipo e fonte dos dados de entrada -->
- **Output:** <!-- tipo e destino dos dados de saída -->

## Invariantes

<!-- regras que NÃO podem ser quebradas independente da implementação -->

- [ ]
- [ ]

## Estimativa de custo por execução

| Componente | Custo estimado |
|------------|----------------|
| LLM tokens | $ |
| Compute | $ |
| **Total** | $ |

## Tasks

- [ ] Implementação do agente
- [ ] Prompt em `profiles/<slug>/prompts/` (se LLM) ou inline (se determinístico)
- [ ] Mock/fake em `tests/fakes/`
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] ADR (se impacto medium/high)
- [ ] Documentação em `docs/OCTECHPUS_AGENTS.md`
