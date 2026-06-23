import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { resolveProfile } from '../src/lib/profile-loader.mjs'
import { renderTemplate } from '../src/lib/template-renderer.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', 'src', 'templates')

function loadTemplate(name) {
  return readFileSync(join(TEMPLATES_DIR, name), 'utf-8')
}

function render(templateName, profileName) {
  const tpl = loadTemplate(templateName)
  const profile = resolveProfile(profileName)
  return renderTemplate(tpl, profile, { strict: false })
}

// ── architect.md ────────────────────────────────────────────────────────────

describe('architect.md — python-fastapi', () => {
  it('contains Python-specific review rules', () => {
    const result = render('commands/architect.md', 'python-fastapi')
    expect(result).toContain('type hints')
    expect(result).toContain('Pydantic')
  })

  it('does NOT contain Vitest, Zod, or JSDoc references', () => {
    const result = render('commands/architect.md', 'python-fastapi')
    expect(result).not.toContain('Vitest')
    expect(result).not.toContain('Zod')
    expect(result).not.toContain('JSDoc')
    expect(result).not.toContain('TSDoc')
  })

  it('renders Designer block (designer always-on)', () => {
    const result = render('commands/architect.md', 'python-fastapi')
    expect(result).toContain('Designer Handoff')
  })
})

describe('architect.md — nextjs-react', () => {
  it('contains TypeScript-specific review rules', () => {
    const result = render('commands/architect.md', 'nextjs-react')
    expect(result).toContain('TypeScript')
  })

  it('renders the Designer Handoff block (designer=true)', () => {
    const result = render('commands/architect.md', 'nextjs-react')
    expect(result).toContain('Designer Handoff')
  })
})

describe('architect.md — node-typescript', () => {
  it('renders Designer block (designer always-on)', () => {
    const result = render('commands/architect.md', 'node-typescript')
    expect(result).toContain('Designer Handoff')
  })

  it('contains TypeScript-specific rules', () => {
    const result = render('commands/architect.md', 'node-typescript')
    expect(result).toContain('TypeScript')
  })
})

// ── CLAUDE.md ────────────────────────────────────────────────────────────────

describe('CLAUDE.md — python-ai-pipeline', () => {
  it('contains Cost Engineer in pipeline diagram', () => {
    const result = render('CLAUDE.md', 'python-ai-pipeline')
    expect(result).toContain('Cost Engineer')
  })

  it('contains python-ai-pipeline profile name', () => {
    const result = render('CLAUDE.md', 'python-ai-pipeline')
    expect(result).toContain('python-ai-pipeline')
  })

  it('shows pytest as test framework', () => {
    const result = render('CLAUDE.md', 'python-ai-pipeline')
    expect(result).toContain('pytest')
  })
})

describe('CLAUDE.md — node-typescript', () => {
  it('does NOT contain Cost Engineer in pipeline (cost_engineer=false)', () => {
    const result = render('CLAUDE.md', 'node-typescript')
    expect(result).not.toContain('Cost Engineer')
  })

  it('renders Designer command (designer always-on)', () => {
    const result = render('CLAUDE.md', 'node-typescript')
    expect(result).toContain('/design')
  })

  it('contains the Privacy command and compliance framework', () => {
    const result = render('CLAUDE.md', 'node-typescript')
    expect(result).toContain('/privacy')
    expect(result).toContain('lgpd')
  })
})

describe('CLAUDE.md — nextjs-react', () => {
  it('contains /design command (designer always-on)', () => {
    const result = render('CLAUDE.md', 'nextjs-react')
    expect(result).toContain('/design')
  })
})

// ── review.md ────────────────────────────────────────────────────────────────

describe('review.md — python-fastapi', () => {
  it('lists Python forbidden patterns', () => {
    const result = render('commands/review.md', 'python-fastapi')
    expect(result).toContain('print\\(')
  })

  it('renders the stack-agnostic UX/UI checklist (designer always-on)', () => {
    const result = render('commands/review.md', 'python-fastapi')
    expect(result).toContain('Validação de UX/UI')
    expect(result).toContain('WCAG AA')
    // no hardcoded stack-specific tooling in the generic checklist
    expect(result).not.toContain('shadcn/ui')
  })
})

describe('review.md — nextjs-react', () => {
  it('renders the stack-agnostic UX/UI checklist', () => {
    const result = render('commands/review.md', 'nextjs-react')
    expect(result).toContain('Validação de UX/UI')
    expect(result).toContain('design system')
    expect(result).toContain('focus-visible')
  })
})

describe('review.md — warn_patterns (severity tier)', () => {
  it('renders the WARNING section when warn_patterns exist', () => {
    const result = render('commands/review.md', 'node-typescript')
    expect(result).toContain('🟡 WARNING')
    expect(result).toContain('@ts-expect-error')
  })

  it('omits the WARNING section when warn_patterns is empty', () => {
    const tpl = loadTemplate('commands/review.md')
    const profile = { ...resolveProfile('python-cli'), warn_patterns: [] }
    const result = renderTemplate(tpl, profile, { strict: false })
    expect(result).not.toContain('Padrões desencorajados')
  })
})

// ── maestro.md / reporter.md ─────────────────────────────────────────────────

describe('maestro.md', () => {
  it('contains the severity rubric and iteration cap', () => {
    const result = render('commands/maestro.md', 'node-typescript')
    expect(result).toContain('Rubrica de severidade')
    expect(result).toContain('2 rejeições')
  })
})

describe('reporter.md', () => {
  it('contains the scoring floor rule', () => {
    const result = render('commands/reporter.md', 'node-typescript')
    expect(result).toContain('Piso')
    expect(result).toContain('Privacidade')
  })
})

// ── qa.md ────────────────────────────────────────────────────────────────────

describe('qa.md — python-fastapi', () => {
  it('shows pytest as framework', () => {
    const result = render('commands/qa.md', 'python-fastapi')
    expect(result).toContain('pytest')
  })

  it('shows factory_boy as fixtures', () => {
    const result = render('commands/qa.md', 'python-fastapi')
    expect(result).toContain('factory_boy')
  })
})

describe('qa.md — go-api', () => {
  it('shows go_test as framework', () => {
    const result = render('commands/qa.md', 'go-api')
    expect(result).toContain('go_test')
  })

  it('does NOT show playwright_python (e2e=null)', () => {
    const result = render('commands/qa.md', 'go-api')
    expect(result).not.toContain('playwright_python')
  })
})

// ── pipeline.md ──────────────────────────────────────────────────────────────

describe('pipeline.md — python-ai-pipeline', () => {
  it('includes Cost Engineer step', () => {
    const result = render('commands/pipeline.md', 'python-ai-pipeline')
    expect(result).toContain('COST ENGINEER')
  })
})

describe('pipeline.md — node-typescript', () => {
  it('does NOT include Cost Engineer step', () => {
    const result = render('commands/pipeline.md', 'node-typescript')
    expect(result).not.toContain('COST ENGINEER')
  })

  it('delegates to scoped subagents via the Task tool', () => {
    const result = render('commands/pipeline.md', 'node-typescript')
    expect(result).toContain('Task(coder)')
    expect(result).toContain('Task(security)')
    expect(result).toContain('.octechpus/run/')
  })

  it('audit delegates to read-only subagents in parallel', () => {
    const result = render('commands/audit.md', 'node-typescript')
    expect(result).toContain('Task(security)')
    expect(result).toContain('Task(privacy)')
  })

  it('includes Designer step (designer always-on)', () => {
    const result = render('commands/pipeline.md', 'node-typescript')
    expect(result).toContain('DESIGNER')
  })

  it('includes the Privacy step always', () => {
    const result = render('commands/pipeline.md', 'node-typescript')
    expect(result).toContain('PRIVACY')
  })
})

describe('pipeline.md — nextjs-react', () => {
  it('includes Designer step (designer always-on)', () => {
    const result = render('commands/pipeline.md', 'nextjs-react')
    expect(result).toContain('DESIGNER')
  })
})

// ── security.md ──────────────────────────────────────────────────────────────

describe('security.md — python-fastapi', () => {
  it('mentions pydantic_v2 as validation library', () => {
    const result = render('commands/security.md', 'python-fastapi')
    expect(result).toContain('pydantic_v2')
  })

  it('does NOT mention Zod', () => {
    const result = render('commands/security.md', 'python-fastapi')
    expect(result).not.toContain('Zod')
  })
})

describe('security.md — node-typescript', () => {
  it('mentions zod as validation library', () => {
    const result = render('commands/security.md', 'node-typescript')
    expect(result).toContain('zod')
  })
})

describe('security.md — python-ai-pipeline', () => {
  it('renders read_only_paths block (guardrails non-empty)', () => {
    const result = render('commands/security.md', 'python-ai-pipeline')
    expect(result).toContain('profiles/**/prompts/**')
  })
})

describe('security.md — OWASP 2021 + API Top 10', () => {
  it('uses the OWASP 2021 categories and API security checks', () => {
    const result = render('commands/security.md', 'node-typescript')
    expect(result).toContain('2021')
    expect(result).toContain('SSRF')
    expect(result).toContain('BOLA')
    expect(result).toContain('supply chain')
  })
})

// ── privacy.md ───────────────────────────────────────────────────────────────

describe('privacy.md — compliance framework injection', () => {
  it('injects lgpd as the active framework by default', () => {
    const result = render('commands/privacy.md', 'node-typescript')
    expect(result).toContain('lgpd')
    expect(result).toContain('base legal')
    expect(result).toContain('PII')
  })

  it('renders for every stack (privacy is always-on)', () => {
    for (const p of ['python-fastapi', 'go-api', 'rust-cli', 'nextjs-react', 'generic']) {
      const result = render('commands/privacy.md', p)
      expect(result).toContain('Privacy / Compliance Report')
    }
  })
})
