/**
 * profile-advisor — Recomendação GUIADA e DETERMINÍSTICA de profile.
 *
 * O CLI octechpus roda standalone (`npx`), SEM LLM em runtime. Por isso a
 * "discussão" da stack é um sistema de PONTUAÇÃO determinístico: cada resposta
 * do questionário soma pontos aos profiles candidatos (via suas `tags`), e o de
 * maior pontuação é recomendado. Nada aqui faz rede, I/O ou chamada de IA — é
 * uma função pura sobre os metadados que `listProfiles()` já expõe.
 *
 * Ver docs/adr/003-profile-advisor-e-example-project.md.
 */

// ── Pesos do scoring ──────────────────────────────────────────────────────────
const WEIGHT_PRODUCT = 4 // tipo de produto é o sinal mais forte
const WEIGHT_LANGUAGE = 3 // linguagem é binária (o profile usa ou não)
const WEIGHT_AXIS = 3 // performance / enterprise
const WEIGHT_DESCRIPTION = 2 // texto livre: reforço, não dominante

/**
 * As 5 perguntas do modo guiado. Cada opção carrega as `tags` que ela favorece;
 * o scoring cruza essas tags com as `tags` de cada profile. Profiles novos
 * entram no questionário só por terem tags coerentes — sem hardcode de nomes.
 */
export const ADVISOR_QUESTIONS = [
  {
    id: 'product',
    prompt: 'O que você vai construir?',
    weight: WEIGHT_PRODUCT,
    options: [
      { key: '1', label: 'Um site ou página web (loja, blog, painel)', short: 'um site/web', tags: ['web', 'frontend'] },
      { key: '2', label: 'Um aplicativo de celular (Android/iOS)', short: 'um app de celular', tags: ['mobile'] },
      { key: '3', label: 'Uma API / servidor (backend que outros apps consomem)', short: 'uma API/backend', tags: ['backend', 'api'] },
      { key: '4', label: 'Uma ferramenta de linha de comando (terminal)', short: 'uma ferramenta de terminal', tags: ['cli'] },
      { key: '5', label: 'Um projeto de IA / chatbot com LLM', short: 'um projeto de IA/LLM', tags: ['ai', 'ml', 'llm'] },
    ],
  },
  {
    id: 'language',
    prompt: 'Tem preferência de linguagem?',
    weight: WEIGHT_LANGUAGE,
    cap: 1, // match de linguagem é binário: conta no máximo uma vez
    options: [
      { key: '1', label: 'JavaScript / TypeScript', tags: ['javascript', 'typescript', 'node'] },
      { key: '2', label: 'Python', tags: ['python'] },
      { key: '3', label: 'Java', tags: ['java'] },
      { key: '4', label: 'C# / .NET', tags: ['csharp', 'dotnet'] },
      { key: '5', label: 'PHP', tags: ['php', 'laravel'] },
      { key: '6', label: 'Ruby', tags: ['ruby', 'rails'] },
      { key: '7', label: 'Go', tags: ['go'] },
      { key: '8', label: 'Rust', tags: ['rust'] },
      { key: '9', label: 'Tanto faz / não sei', tags: [] },
    ],
  },
  {
    id: 'performance',
    prompt: 'Performance bruta é crítica? (precisa ser o mais rápido e leve possível)',
    weight: WEIGHT_AXIS,
    options: [
      { key: '1', label: 'Sim', tags: ['systems'] },
      { key: '2', label: 'Não / tanto faz', tags: [] },
    ],
  },
  {
    id: 'enterprise',
    prompt: 'É um ambiente corporativo/enterprise? (banco, seguradora, grande empresa)',
    weight: WEIGHT_AXIS,
    options: [
      { key: '1', label: 'Sim', tags: ['enterprise'] },
      { key: '2', label: 'Não / startup / projeto pessoal', tags: [] },
    ],
  },
  {
    id: 'mixed',
    prompt: 'O projeto mistura várias linguagens ou não se encaixa em nada acima?',
    options: [
      { key: '1', label: 'Sim, é misto / não sei classificar', forceGeneric: true },
      { key: '2', label: 'Não, é um tipo só', tags: [] },
    ],
  },
]

/**
 * Desempate quando vários profiles empatam em pontos: índice menor = preferido.
 * Favorece generalistas amigáveis a iniciantes em vez de stacks enterprise.
 */
const TIEBREAK_PRIORITY = [
  'node-typescript', 'node-javascript', 'python-fastapi', 'nextjs-react',
  'python-cli', 'go-api', 'vue-nuxt', 'react-native', 'python-ai-pipeline',
  'ruby-rails', 'php-laravel', 'rust-cli', 'java-spring', 'dotnet-api', 'generic',
]

// Texto livre (PT) → tags. Determinístico: regex sobre a descrição do usuário.
const DESCRIPTION_KEYWORDS = [
  { re: /(loja|e-?commerce|site|p[áa]gina|blog|painel|landing|institucional|frontend)/, tags: ['web', 'frontend'] },
  { re: /(app|aplicativo|celular|mobile|android|ios)/, tags: ['mobile'] },
  { re: /(api|back-?end|servidor|endpoint|micro-?servi)/, tags: ['backend', 'api'] },
  { re: /(cli|terminal|linha de comando|script)/, tags: ['cli'] },
  { re: /(\bia\b|i\.a|intelig[êe]ncia|chatbot|\bllm\b|\bgpt\b|machine learning|\bml\b)/, tags: ['ai', 'ml', 'llm'] },
  { re: /(banco|seguradora|corporativ|enterprise|\berp\b|folha de pagamento)/, tags: ['enterprise'] },
  { re: /(r[áa]pid|alta performance|baixo n[íi]vel|desempenho)/, tags: ['systems'] },
]

function overlapCount(tagsA, tagsB) {
  if (!tagsA?.length || !tagsB?.length) return 0
  return tagsA.filter(t => tagsB.includes(t)).length
}

/**
 * Pontua cada profile a partir das respostas (e da descrição opcional).
 *
 * @param {Object} answers   mapa questionId → opção escolhida (ou undefined p/ pular)
 * @param {Array}  profiles  saída de listProfiles() (precisa de .name e .tags)
 * @param {Object} [opts]
 * @param {string} [opts.description]  texto livre do usuário ("o que vai construir")
 * @returns {{ranked: Array<{name,score}>, forceGeneric: boolean}}
 */
export function scoreProfiles(answers = {}, profiles = [], opts = {}) {
  const scores = new Map(profiles.map(p => [p.name, 0]))
  let forceGeneric = false

  for (const q of ADVISOR_QUESTIONS) {
    const opt = answers[q.id]
    if (!opt) continue
    if (opt.forceGeneric) { forceGeneric = true; continue }
    const tags = opt.tags || []
    if (tags.length === 0) continue
    const weight = q.weight || 1
    for (const p of profiles) {
      let overlap = overlapCount(tags, p.tags)
      if (q.cap) overlap = Math.min(overlap, q.cap)
      if (overlap > 0) scores.set(p.name, scores.get(p.name) + overlap * weight)
    }
  }

  const description = (opts.description || '').toLowerCase()
  if (description.trim()) {
    const matchedTags = new Set()
    for (const { re, tags } of DESCRIPTION_KEYWORDS) {
      if (re.test(description)) tags.forEach(t => matchedTags.add(t))
    }
    if (matchedTags.size > 0) {
      const descTags = [...matchedTags]
      for (const p of profiles) {
        const overlap = overlapCount(descTags, p.tags)
        if (overlap > 0) scores.set(p.name, scores.get(p.name) + overlap * WEIGHT_DESCRIPTION)
      }
    }
  }

  const tieIndex = name => {
    const i = TIEBREAK_PRIORITY.indexOf(name)
    return i === -1 ? TIEBREAK_PRIORITY.length : i
  }
  const ranked = profiles
    .map(p => ({ name: p.name, score: scores.get(p.name) || 0 }))
    .sort((a, b) => b.score - a.score || tieIndex(a.name) - tieIndex(b.name))

  return { ranked, forceGeneric }
}

/**
 * Recomenda um profile com base nas respostas. Sempre retorna uma recomendação
 * (cai em `generic` quando não há sinal suficiente ou o usuário marcou "misto").
 *
 * @returns {{name: string, score: number, rationale: string, ranked: Array, forced: boolean}}
 */
export function recommendProfile(answers = {}, profiles = [], opts = {}) {
  const { ranked, forceGeneric } = scoreProfiles(answers, profiles, opts)
  const hasGeneric = profiles.some(p => p.name === 'generic')

  if (forceGeneric && hasGeneric) {
    return {
      name: 'generic',
      score: ranked.find(r => r.name === 'generic')?.score ?? 0,
      rationale: 'Você indicou um projeto misto / que não se encaixa — generic mantém todo o pipeline ativo sem exigir uma stack específica.',
      ranked,
      forced: true,
    }
  }

  const top = ranked[0]
  if (!top || top.score === 0) {
    return {
      name: hasGeneric ? 'generic' : top?.name || '',
      score: 0,
      rationale: 'Não consegui inferir uma stack pelas respostas — generic é o fallback seguro (você pode trocar depois com `octechpus profile switch`).',
      ranked,
      forced: false,
    }
  }

  return {
    name: top.name,
    score: top.score,
    rationale: buildRationale(answers, opts, top.name, ranked),
    ranked,
    forced: false,
  }
}

function buildRationale(answers, opts, name, ranked) {
  const parts = []
  if (answers.product) parts.push(answers.product.short || answers.product.label.toLowerCase())
  if (answers.language && (answers.language.tags || []).length) {
    parts.push(`de preferência em ${answers.language.label}`)
  }
  if (answers.performance && (answers.performance.tags || []).includes('systems')) {
    parts.push('com performance crítica')
  }
  if (answers.enterprise && (answers.enterprise.tags || []).includes('enterprise')) {
    parts.push('em ambiente corporativo')
  }
  const desc = (opts.description || '').trim()
  const lead = parts.length
    ? `Você descreveu: ${parts.join(', ')}.`
    : desc
      ? `A partir da sua descrição.`
      : 'Com base nas suas respostas.'

  const runnerUp = ranked.find(r => r.name !== name && r.score > 0)
  const tail = runnerUp ? ` (alternativa próxima: ${runnerUp.name})` : ''
  return `${lead} → ${name} é o profile que melhor encaixa${tail}.`
}
