# 003. Modo Guiado de Escolha de Profile + Campo `example_project`

**Data:** 2026-06-27
**Status:** Accepted (v2.9.0)

## Contexto

O `octechpus init` precisa que o usuário escolha um *profile* de stack. Hoje a
escolha acontece de três formas:

1. **Auto-detecção** (`stack-detector.mjs`) — quando há sinais claros (`go.mod`,
   `tsconfig.json`, `composer.json` etc.).
2. **Flag explícita** `--stack=<name>`.
3. **Lista manual numerada** — fallback quando a confiança é baixa/nula.

Cada profile expõe três campos de metadado usados na lista: `description`
(uma linha técnica), `tags` (palavras-chave) e `when_to_use` — este último escrito
**para desenvolvedores**, com o sinal de detecção entre parênteses
(ex.: *"serviços/CLIs/libs em Node com TypeScript (tsconfig ou dep typescript)"*).

Dois problemas para um usuário **leigo** (não-técnico):

1. **A lista não diz "serve para fazer o quê".** Quem não sabe o que é `tsconfig`,
   `go.mod` ou `Pydantic` não consegue mapear o profile ao próprio projeto.
2. **Quando a auto-detecção falha**, o leigo cai numa lista de 15 nomes técnicos
   sem nenhum caminho guiado — precisa já saber a resposta para escolher.

> **Escopo:** este ADR trata do **CLI octechpus em si** (o scaffolder), não do
> sistema gerado nos projetos-alvo. O CLI roda standalone via `npx`, **sem LLM em
> runtime** e com dependência única `js-yaml`.

## Decisão

Duas mudanças complementares, ambas aditivas.

### 1. Campo `example_project` nos profiles

Adicionar um campo opcional `example_project` a cada profile concreto (15 arquivos
em `src/profiles/*.yaml`; **não** em `_base.yaml`). É uma frase curta em
**português, linguagem leiga**, com um exemplo concreto de projeto.

- `when_to_use` é **preservado** — continua sendo a dica técnica de detecção.
- `example_project` responde "serve para fazer o quê", para o leigo.
- Separar os dois mantém cada um claro: detecção (técnico) vs. exemplo (humano).
- `profile-loader.listProfiles()` passa a expor o campo; `cli.mjs` exibe uma linha
  `💡` logo abaixo da dica `↳`, nos dois pontos onde profiles são listados
  (seleção interativa do `init` e comando `profile list`).
- Leitura tolerante: profile sem o campo apenas não imprime a linha (sem erro).

### 2. Modo guiado ("Me ajude a escolher")

Na seleção manual do `init`, oferecer — além da lista numerada — a opção
**`g` / "Me ajude a escolher"**. Ao selecioná-la, o CLI conduz um **questionário
determinístico de 5 perguntas** e recomenda um profile com justificativa, pedindo
confirmação antes de montar.

**Restrição central:** o CLI **não tem LLM em runtime**. A "discussão" é, portanto,
um **sistema de pontuação determinístico**, não uma conversa com IA. Cada resposta
soma pontos aos profiles candidatos; o de maior pontuação é recomendado.

As 5 perguntas (eixos):

1. **Tipo de produto** — site web / app de celular / API-backend / ferramenta de
   terminal / projeto de IA-LLM.
2. **Linguagem de preferência** — ou "tanto faz".
3. **Performance bruta é crítica?** (favorece Go/Rust).
4. **Ambiente corporativo/enterprise?** (favorece Java/.NET).
5. **Mistura várias linguagens / não se encaixa?** (favorece `generic`).

**Isolamento arquitetural:** a lógica de scoring vive num módulo novo e **puro**
`src/lib/profile-advisor.mjs`, exportando os dados das perguntas e
`recommendProfile(answers, profiles)`. O `cli.mjs` apenas orquestra o I/O via
`askFn` (injetável, como já é hoje). Isso torna o scoring **unit-testável sem
subprocess** e espelha a separação existente (lib = lógica, cli = orquestração).

O scoring usa os metadados **já presentes** nos profiles (`tags`, `description`,
`example_project`) mais uma pequena tabela de afinidade por eixo — sem hardcode de
nomes de profile espalhado pela lógica, para que novos profiles entrem no
questionário só por terem `tags` coerentes.

## Consequências

**Positivas**
- Leigo entende a lista ("ah, é tipo um e-commerce") e tem um caminho guiado quando
  a detecção falha.
- Zero dependência nova; tudo offline; nenhuma chamada de rede/IA.
- Scoring isolado e testável; profiles continuam sendo a fonte da verdade.

**Negativas / trade-offs**
- O questionário é heurístico — pode recomendar o profile "quase certo". Mitigado por
  **sempre** pedir confirmação e manter a lista completa acessível.
- Mais um campo para manter por profile (`example_project`). Aceitável: é opcional e
  validado por teste (todos os concretos devem tê-lo).

**Alternativas descartadas**
- *Reescrever `when_to_use` para linguagem leiga*: perderia o sinal de detecção, que
  tem valor técnico próprio. Preferimos um campo separado.
- *Discussão conduzida por IA no `init`*: impossível sem LLM em runtime e contra o
  princípio de scaffolder de dependência mínima. Uma versão IA-conduzida seria um
  comando à parte (ex.: `/maestro`), fora do escopo deste ADR.
