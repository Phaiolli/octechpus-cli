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

  it('does NOT render Designer block (designer=false)', () => {
    const result = render('commands/architect.md', 'python-fastapi')
    expect(result).not.toContain('Designer Handoff')
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
  it('does NOT render Designer block (designer=false)', () => {
    const result = render('commands/architect.md', 'node-typescript')
    expect(result).not.toContain('Designer Handoff')
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

  it('does NOT render Designer command (designer=false)', () => {
    const result = render('CLAUDE.md', 'node-typescript')
    expect(result).not.toContain('/design')
  })
})

describe('CLAUDE.md — nextjs-react', () => {
  it('contains /design command (designer=true)', () => {
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

  it('does NOT render Design System checklist (designer=false)', () => {
    const result = render('commands/review.md', 'python-fastapi')
    expect(result).not.toContain('shadcn/ui')
  })
})

describe('review.md — nextjs-react', () => {
  it('renders Design System checklist (designer=true)', () => {
    const result = render('commands/review.md', 'nextjs-react')
    expect(result).toContain('shadcn/ui')
    expect(result).toContain('lucide-react')
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

  it('does NOT include Designer step (designer=false)', () => {
    const result = render('commands/pipeline.md', 'node-typescript')
    expect(result).not.toContain('DESIGNER')
  })
})

describe('pipeline.md — nextjs-react', () => {
  it('includes Designer step (designer=true)', () => {
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
