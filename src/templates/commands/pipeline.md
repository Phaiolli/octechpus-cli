# Pipeline Completo de Agentes

Execute o pipeline completo de agentes para a seguinte demanda:

**Demanda:** $ARGUMENTS

---

## Instruções

Você deve executar TODOS os agentes abaixo na ordem especificada. Para cada agente, assuma o papel descrito, execute a análise/ação e produza o output no formato definido. Só passe ao próximo agente após concluir o atual.

### Ordem de Execução:

**1. 🎯 MAESTRO** — Classifique a demanda (tipo, severidade) e monte o plano de execução.

**2. 🐙 GITHUB (Fase 1)** — Crie a issue com o template padrão, defina branch name e labels. Use `gh` CLI para criar a issue e branch no repositório.

**3. 📐 ARCHITECT** — Analise o impacto arquitetural, valide padrões, proponha a estrutura de implementação. Decida: approved/needs_changes/rejected.

**4. 💻 CODER** — Implemente seguindo estritamente o plano do ARCHITECT. Código tipado, limpo, com error handling.

**5. 🔍 REVIEWER** — Faça code review de tudo que foi implementado. Classifique issues como 🔴 BLOCKER / 🟡 WARNING / 🔵 SUGGESTION. Se houver blockers, corrija antes de prosseguir.

**6. 🧪 QA** — Crie testes unitários (Vitest), de integração e defina cenários E2E (Playwright). Garanta cobertura dos happy paths, error paths e edge cases.

**7. 🛡️ SECURITY** — Faça audit de segurança: XSS, injection, CSRF, IDOR, dados sensíveis, validação de inputs. Classifique vulnerabilidades por severidade.

**8. 📚 DOCS** — Documente: JSDoc/TSDoc em exports, atualize README/CHANGELOG, crie ADRs se necessário.

**9. 🐙 GITHUB (Fase 2)** — Prepare commits semânticos (Conventional Commits), crie PR com template completo incluindo relatório de todos os agentes. Use `gh` CLI.

**10. 📊 REPORTER** — Gere relatório final consolidado com métricas, status de cada agente, débitos técnicos e próximos passos.

---

## Regras

- ❌ Nenhum agente pode ser pulado
- 🔄 Se qualquer agente rejeitar, volte ao agente relevante e corrija
- 📝 Mostre o output formatado de CADA agente
- ✅ Só considere completo quando TODOS aprovarem
