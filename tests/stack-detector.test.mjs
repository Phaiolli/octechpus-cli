import { describe, it, expect } from 'vitest'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { detectStack } from '../src/lib/stack-detector.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = join(__dirname, 'fixtures')

describe('detectStack — python-project', () => {
  it('detects python-fastapi with high confidence', () => {
    const result = detectStack(join(fixtures, 'python-project'))
    expect(result.best.name).toBe('python-fastapi')
    expect(result.best.confidenceLabel).toBe('high')
    expect(result.best.evidence.some(e => e.includes('fastapi'))).toBe(true)
  })
})

describe('detectStack — nodejs-project', () => {
  it('detects nextjs-react with high confidence', () => {
    const result = detectStack(join(fixtures, 'nodejs-project'))
    expect(result.best.name).toBe('nextjs-react')
    expect(result.best.confidenceLabel).toBe('high')
  })
})

describe('detectStack — empty-project', () => {
  it('returns confidence none for a project with no stack signals', () => {
    const result = detectStack(join(fixtures, 'empty-project'))
    expect(result.best.confidenceLabel).toBe('none')
    expect(result.candidates).toHaveLength(0)
  })
})

describe('detectStack — python-ai-project', () => {
  it('detects python-ai-pipeline when fastapi + anthropic are both present', () => {
    const result = detectStack(join(fixtures, 'python-ai-project'))
    expect(result.best.name).toBe('python-ai-pipeline')
    expect(result.best.confidenceLabel).toBe('high')
  })
})

describe('detectStack — ambiguous-project', () => {
  it('returns multiple candidates when both package.json and pyproject.toml exist', () => {
    const result = detectStack(join(fixtures, 'ambiguous-project'))
    const names = result.candidates.map(c => c.name)
    expect(names.length).toBeGreaterThan(1)
    // Both Node and Python stacks should be present
    const hasNode = names.some(n => n.startsWith('node') || n.startsWith('nextjs'))
    const hasPython = names.some(n => n.startsWith('python'))
    expect(hasNode).toBe(true)
    expect(hasPython).toBe(true)
  })
})
