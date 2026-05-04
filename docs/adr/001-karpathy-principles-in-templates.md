# 001. Incorporar os Princípios de Karpathy nos Templates de Agentes

**Data:** 2026-05-03
**Status:** Accepted

## Contexto

Os templates de agentes do Octechpus definem o comportamento de LLMs em todos
os projetos scaffoldados pelo CLI. Na prática, agentes frequentemente:

- Assumem escopo sem declarar suposições
- Entregam código além do que foi pedido
- Executam demandas vagas sem critério de sucesso claro
- Adicionam complexidade desnecessária à implementação

O repositório `forrestchang/andrej-karpathy-skills` (109k stars) sistematizou
esses problemas em 4 princípios práticos amplamente validados pela comunidade.

## Decisão

Incorporar os 4 princípios de Karpathy como regras obrigatórias nos templates:

1. **CLAUDE.md** — seção universal visível a todos no repo scaffoldado
2. **architect.md** — bloco "Pensar primeiro" antes da análise técnica
3. **coder.md** — regras Simplicity + Surgical + auto-checagem
4. **review.md** — validações BLOCKER K1-K4
5. **pipeline.md** — Maestro converte demanda em critérios testáveis

## Alternativas consideradas

**A. Adicionar como campo em `_base.yaml`**
Descartada: os princípios são universais e invariáveis entre stacks. Torná-los
um campo YAML adiciona complexidade de herança sem benefício.

**B. Documento separado referenciado nos templates**
Descartada: adiciona um hop de leitura. Embutir diretamente nos templates onde
o comportamento é esperado é mais eficaz para LLMs.

**C. Não fazer nada — confiar nos princípios genéricos já existentes**
Descartada: "DRY sem premature abstraction" e "Nomes descritivos" são genéricos
demais. Os princípios de Karpathy são operacionais e verificáveis.

## Consequências

- Positivas: comportamento mais previsível de todos os agentes; o Reviewer
  passa a ter critérios BLOCKER explícitos para escopo e simplicidade
- Negativas: templates ficam ~30% maiores; projetos já scaffoldados precisam
  de `octechpus update` para receber as mudanças
- Neutras: nenhum profile YAML, lib ou teste é alterado
