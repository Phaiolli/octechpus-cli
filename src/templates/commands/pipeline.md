# Pipeline Completo de Agentes

Execute o pipeline completo de agentes para a seguinte demanda:

**Demanda:** $ARGUMENTS

---

## Classificação de demanda e roteamento

Antes de executar, identifique o tipo da demanda e selecione o pipeline correto:

### UI / Frontend
**Sinais:** palavras-chave como "tela", "página", "componente", "layout", "form", "tabela", "card", "modal", "sidebar", "topbar", "responsivo", "design", "interface", "estilo", "cor"; arquivos em `src/components/`, `src/app/**/page.tsx`, `src/features/**/components/`; handoff bundle do Claude Design anexado.

**Pipeline:** GitHub → Architect → **Designer** → Coder → Reviewer (com checklist do Designer) → QA → Security → Docs → Reporter

### Backend
**Sinais:** "API", "endpoint", "rota", "service", "repository", "DTO", "schema", "migration", "job", "queue".

**Pipeline:** GitHub → Architect → Coder → Reviewer → QA → Security → Docs → Reporter

### Refactor sem UI
**Pipeline:** GitHub → Architect → Coder → Reviewer → QA → Security → Docs → Reporter

### Misto (UI + Backend)
**Pipeline:** GitHub → Architect → **Designer** (UI) ‖ Coder (backend) → Coder (UI) → Reviewer → QA → Security → Docs → Reporter

---

## Instruções

Você deve executar TODOS os agentes aplicáveis na ordem especificada. Para cada agente, assuma o papel descrito, execute a análise/ação e produza o output no formato definido. Só passe ao próximo agente após concluir o atual.

### Ordem de Execução (pipeline completo com UI):

**1. 🎯 MAESTRO** — Classifique a demanda (tipo, severidade) e selecione o pipeline de acordo com as regras acima.

**2. 🐙 GITHUB (Fase 1)** — Crie a issue com o template padrão, defina branch name e labels. Use `gh` CLI para criar a issue e branch no repositório.

**3. 📐 ARCHITECT** — Analise o impacto arquitetural, valide padrões, proponha a estrutura de implementação. Decida: approved/needs_changes/rejected.

**4. 🎨 DESIGNER** *(somente em demandas de UI)* — Leia o design system em `./design-system/` e produza o briefing técnico completo que o Coder vai seguir. Inclui: layout, componentes shadcn, tokens, estados, responsividade e checklist para o Reviewer.

**5. 💻 CODER** — Implemente seguindo estritamente o plano do ARCHITECT e (quando aplicável) o briefing do DESIGNER. Código tipado, limpo, com error handling.

**6. 🔍 REVIEWER** — Faça code review de tudo que foi implementado. Classifique issues como 🔴 BLOCKER / 🟡 WARNING / 🔵 SUGGESTION. Em PRs de UI, aplique também a checklist do design system. Se houver blockers, corrija antes de prosseguir.

**7. 🧪 QA** — Crie testes unitários (Vitest), de integração e defina cenários E2E (Playwright). Garanta cobertura dos happy paths, error paths e edge cases.

**8. 🛡️ SECURITY** — Faça audit de segurança: XSS, injection, CSRF, IDOR, dados sensíveis, validação de inputs. Classifique vulnerabilidades por severidade.

**9. 📚 DOCS** — Documente: JSDoc/TSDoc em exports, atualize README/CHANGELOG, crie ADRs se necessário.

**10. 🐙 GITHUB (Fase 2)** — Prepare commits semânticos (Conventional Commits), crie PR com template completo incluindo relatório de todos os agentes. Use `gh` CLI.

**11. 📊 REPORTER** — Gere relatório final consolidado com métricas, status de cada agente, débitos técnicos e próximos passos.

| #   | Agente | Função |
|-----|--------|--------|
| 1   | 🎯 Maestro | Orquestra, classifica e roteia pelo pipeline correto |
| 2   | 🐙 GitHub | Issues, branches, commits, PRs |
| 3   | 📐 Architect | Impacto e planejamento técnico |
| 4   | 🎨 Designer | Guardião do design system. Produz briefing técnico para o Coder em demandas de UI |
| 5   | 💻 Coder | Implementação |
| 6   | 🔍 Reviewer | Code review com severidade + checklist do design system em PRs de UI |
| 7   | 🧪 QA | Testes unitários, integração e E2E |
| 8   | 🛡️ Security | OWASP Top 10 + vulnerabilidades |
| 9   | 📚 Docs | JSDoc, README, CHANGELOG, ADRs |
| 10  | 🐙 GitHub | Commits semânticos e PR final |
| 11  | 📊 Reporter | Relatório final com métricas |

---

## Regras

- ❌ Nenhum agente aplicável pode ser pulado
- 🎨 O Designer é obrigatório em qualquer demanda que toque UI
- 🔄 Se qualquer agente rejeitar, volte ao agente relevante e corrija
- 📝 Mostre o output formatado de CADA agente
- ✅ Só considere completo quando TODOS aprovarem
