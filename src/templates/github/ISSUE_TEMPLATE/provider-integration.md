---
name: "🔌 Provider Integration"
about: Adicionar ou modificar integração com serviço externo
title: "[provider] "
labels: provider-integration
assignees: ""
---

## Provider

- **Nome:**
- **Tipo:** LLM | TTS | GPU | Storage | Auth | Other
- **Documentação:**

## Estimativa de custo

- **Custo por unidade:** $
- **Volume mensal esperado:**
- **Custo total mensal estimado:**
- **Plano de fallback se quota estourar:**

## Implementação

- **Wrapper interno:** <!-- path do wrapper a criar/modificar -->
- **Mock/fake para testes:** <!-- path em tests/fakes/ -->
- **Variáveis de ambiente:** <!-- lista de env vars -->

## Tasks

- [ ] Wrapper com cache/dedup quando aplicável
- [ ] Retry com `max_attempts` e backoff exponencial
- [ ] Timeout total da operação documentado
- [ ] Mock em `tests/fakes/`
- [ ] Cost Engineer review
- [ ] Security review (credenciais, HMAC se webhook)
- [ ] `.env.example` atualizado
