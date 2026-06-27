import { describe, it, expect } from 'vitest'
import { ADVISOR_QUESTIONS, scoreProfiles, recommendProfile } from '../src/lib/profile-advisor.mjs'
import { listProfiles } from '../src/lib/profile-loader.mjs'

const PROFILES = listProfiles()

// Helper: pega a opção de uma pergunta pela key.
function opt(questionId, key) {
  const q = ADVISOR_QUESTIONS.find(x => x.id === questionId)
  return q.options.find(o => o.key === key)
}

describe('ADVISOR_QUESTIONS', () => {
  it('has exactly 5 questions, each with a prompt and options', () => {
    expect(ADVISOR_QUESTIONS).toHaveLength(5)
    for (const q of ADVISOR_QUESTIONS) {
      expect(q.id).toBeTruthy()
      expect(q.prompt).toBeTruthy()
      expect(q.options.length).toBeGreaterThanOrEqual(2)
      expect(q.options.every(o => o.key)).toBe(true)
    }
  })

  it('every tag used in options maps to at least one real profile (no dead tags)', () => {
    const allProfileTags = new Set(PROFILES.flatMap(p => p.tags || []))
    for (const q of ADVISOR_QUESTIONS) {
      for (const o of q.options) {
        for (const t of o.tags || []) {
          expect(allProfileTags.has(t), `tag "${t}" não existe em nenhum profile`).toBe(true)
        }
      }
    }
  })
})

describe('recommendProfile — casos típicos', () => {
  it('IA/LLM + Python → python-ai-pipeline', () => {
    const rec = recommendProfile({ product: opt('product', '5'), language: opt('language', '2') }, PROFILES)
    expect(rec.name).toBe('python-ai-pipeline')
    expect(rec.score).toBeGreaterThan(0)
    expect(rec.rationale).toContain('python-ai-pipeline')
  })

  it('app de celular + JS/TS → react-native (não vaza para profiles web)', () => {
    const rec = recommendProfile({ product: opt('product', '2'), language: opt('language', '1') }, PROFILES)
    expect(rec.name).toBe('react-native')
  })

  it('API/backend + performance crítica → go-api', () => {
    const rec = recommendProfile({ product: opt('product', '3'), performance: opt('performance', '1') }, PROFILES)
    expect(rec.name).toBe('go-api')
  })

  it('site web → escolhe um profile frontend', () => {
    const rec = recommendProfile({ product: opt('product', '1') }, PROFILES)
    expect(['nextjs-react', 'vue-nuxt']).toContain(rec.name)
  })

  it('API enterprise + Java → java-spring', () => {
    const rec = recommendProfile(
      { product: opt('product', '3'), language: opt('language', '3'), enterprise: opt('enterprise', '1') },
      PROFILES,
    )
    expect(rec.name).toBe('java-spring')
  })

  it('CLI + Python → python-cli (não python-fastapi)', () => {
    const rec = recommendProfile({ product: opt('product', '4'), language: opt('language', '2') }, PROFILES)
    expect(rec.name).toBe('python-cli')
  })
})

describe('recommendProfile — regras de borda', () => {
  it('"misto" (forceGeneric) sempre recomenda generic, mesmo com outras respostas', () => {
    const rec = recommendProfile(
      { product: opt('product', '3'), language: opt('language', '7'), mixed: opt('mixed', '1') },
      PROFILES,
    )
    expect(rec.name).toBe('generic')
    expect(rec.forced).toBe(true)
  })

  it('sem nenhuma resposta útil cai em generic (fallback seguro)', () => {
    const rec = recommendProfile({}, PROFILES)
    expect(rec.name).toBe('generic')
    expect(rec.score).toBe(0)
  })

  it('"tanto faz" em linguagem não pontua nenhuma linguagem', () => {
    const { ranked } = scoreProfiles({ language: opt('language', '9') }, PROFILES)
    expect(ranked.every(r => r.score === 0)).toBe(true)
  })

  it('match de linguagem é binário (cap:1) — não dobra por tags repetidas', () => {
    // node-typescript tem tags typescript E node; a opção JS/TS lista ambas.
    // Com cap:1, a contribuição de linguagem é contada uma única vez.
    const { ranked } = scoreProfiles({ language: opt('language', '1') }, PROFILES)
    const node = ranked.find(r => r.name === 'node-typescript')
    // peso de linguagem = 3, cap 1 → exatamente 3, não 6.
    expect(node.score).toBe(3)
  })

  it('empate resolve por prioridade de desempate (generalista amigável)', () => {
    // backend + "tanto faz" empata vários profiles em pontos; o desempate deve
    // preferir node-typescript a stacks enterprise.
    const rec = recommendProfile({ product: opt('product', '3') }, PROFILES)
    expect(rec.name).toBe('node-typescript')
  })

  it('descrição em texto livre reforça o scoring', () => {
    const base = recommendProfile({}, PROFILES, { description: 'um chatbot com inteligência artificial' })
    expect(['python-ai-pipeline']).toContain(base.name)
  })

  it('ranked está ordenado por score decrescente', () => {
    const { ranked } = scoreProfiles({ product: opt('product', '1'), language: opt('language', '1') }, PROFILES)
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score)
    }
  })

  it('é determinístico — mesma entrada, mesma saída', () => {
    const answers = { product: opt('product', '3'), language: opt('language', '7') }
    const a = recommendProfile(answers, PROFILES)
    const b = recommendProfile(answers, PROFILES)
    expect(a.name).toBe(b.name)
    expect(a.score).toBe(b.score)
  })
})
