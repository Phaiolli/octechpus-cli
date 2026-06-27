import { describe, it, expect, beforeEach } from 'vitest'
import { loadProfile, resolveProfile, validateProfile, listProfiles } from '../src/lib/profile-loader.mjs'

// Clear module cache between tests
beforeEach(() => {
  // profile-loader uses an in-module Map; reimport isn't needed since
  // cache misses are harmless and hits speed up the suite.
})

describe('loadProfile', () => {
  it('loads _base.yaml without error', () => {
    const base = loadProfile('_base')
    expect(base.name).toBe('_base')
    expect(base.agents).toBeDefined()
    expect(base.required_placeholders).toBeInstanceOf(Array)
  })

  it('throws for a non-existent profile', () => {
    expect(() => loadProfile('does-not-exist')).toThrow(/Profile not found/)
  })

  it('rejects a path-traversal name before touching the filesystem', () => {
    expect(() => loadProfile('../../etc/passwd')).toThrow(/Profile not found/)
    expect(() => loadProfile('foo/bar')).toThrow(/Profile not found/)
    expect(() => loadProfile('')).toThrow(/Profile not found/)
  })

  it('still loads _base (underscore name is allowed)', () => {
    expect(loadProfile('_base').name).toBe('_base')
  })
})

describe('resolveProfile', () => {
  it('resolves python-fastapi and inherits _base fields', () => {
    const profile = resolveProfile('python-fastapi')
    expect(profile.name).toBe('python-fastapi')
    // Inherited from _base
    expect(profile.commit_convention).toBe('conventional_commits')
    expect(profile.security.owasp_top_10).toBe(true)
    // Own values
    expect(profile.language).toBe('python')
    expect(profile.testing.framework).toBe('pytest')
  })

  it('resolves nextjs-react through two levels of inheritance (_base → node-typescript → nextjs-react)', () => {
    const profile = resolveProfile('nextjs-react')
    expect(profile.name).toBe('nextjs-react')
    // From _base
    expect(profile.commit_convention).toBe('conventional_commits')
    // From node-typescript
    expect(profile.language).toBe('typescript')
    expect(profile.testing.framework).toBe('vitest')
    // Own override
    expect(profile.frontend.framework).toBe('nextjs_app_router')
  })

  it('designer is enabled in all profiles (always-on, stack-agnostic)', () => {
    const nextjs = resolveProfile('nextjs-react')
    const node = resolveProfile('node-typescript')
    const py = resolveProfile('python-fastapi')
    expect(nextjs.agents.designer).toBe(true)
    expect(node.agents.designer).toBe(true)
    expect(py.agents.designer).toBe(true)
  })

  it('privacy agent and compliance framework are inherited from _base', () => {
    const node = resolveProfile('node-typescript')
    expect(node.agents.privacy).toBe(true)
    expect(node.compliance.framework).toBe('lgpd')
  })

  it('generic profile resolves and validates as a fallback', () => {
    const generic = resolveProfile('generic')
    expect(generic.name).toBe('generic')
    expect(generic.language).toBe('any')
    expect(() => validateProfile(generic)).not.toThrow()
  })

  it('nextjs-react forbidden_patterns includes both parent and child patterns', () => {
    const profile = resolveProfile('nextjs-react')
    const patterns = profile.forbidden_patterns
    // From node-typescript parent
    expect(patterns.some(p => p.includes('console'))).toBe(true)
    // From nextjs-react itself
    expect(patterns.some(p => p.includes('transition-all'))).toBe(true)
  })

  it('warn_patterns is inherited/concatenated (severity tier)', () => {
    const node = resolveProfile('node-typescript')
    expect(node.warn_patterns).toContain('@ts-expect-error')
    const nextjs = resolveProfile('nextjs-react')
    // child warns concat on top of parent warns
    expect(nextjs.warn_patterns).toContain('@ts-expect-error')
    expect(nextjs.warn_patterns.some(p => p.includes('img'))).toBe(true)
  })

  it('generic keeps only eval as BLOCKER; TODO moved to warn', () => {
    const g = resolveProfile('generic')
    expect(g.forbidden_patterns).toEqual(['eval\\('])
    expect(g.warn_patterns.some(p => p.includes('TODO'))).toBe(true)
  })

  it('react-native uses !override to get a clean forbidden list (no web-only patterns)', () => {
    const rn = resolveProfile('react-native')
    expect(rn.forbidden_patterns).not.toContain('<div onClick')
    expect(rn.testing.framework).toBe('jest')
    expect(rn.agents.designer).toBe(true)
  })

  it('python-ai-pipeline review_checklist contains both Python and AI rules', () => {
    const profile = resolveProfile('python-ai-pipeline')
    const checklist = profile.review_checklist
    // From parent (python-fastapi)
    expect(checklist).toContain('type hints')
    expect(checklist).toContain('Pydantic')
    // Own additions
    expect(checklist).toContain('Anthropic')
    expect(checklist).toContain('HMAC')
  })
})

describe('validateProfile', () => {
  it('validates a fully-resolved profile without error', () => {
    const profile = resolveProfile('node-typescript')
    expect(() => validateProfile(profile)).not.toThrow()
  })

  it('throws for a profile with a missing required placeholder', () => {
    const incomplete = {
      name: 'incomplete',
      language: 'typescript',
      // missing runtime, package_manager, testing.framework, etc.
    }
    expect(() => validateProfile(incomplete)).toThrow(/missing required placeholders/)
  })
})

describe('listProfiles', () => {
  it('returns an array of profile metadata (excludes _base)', () => {
    const profiles = listProfiles()
    expect(profiles).toBeInstanceOf(Array)
    expect(profiles.length).toBeGreaterThan(0)
    // _base is not selectable
    expect(profiles.every(p => !p.name.startsWith('_'))).toBe(true)
    // Each entry has name and description
    expect(profiles[0]).toHaveProperty('name')
    expect(profiles[0]).toHaveProperty('description')
  })

  it('includes node-typescript and python-fastapi in the list', () => {
    const names = listProfiles().map(p => p.name)
    expect(names).toContain('node-typescript')
    expect(names).toContain('python-fastapi')
  })

  it('includes the new stacks and the generic fallback', () => {
    const names = listProfiles().map(p => p.name)
    for (const n of ['generic', 'node-javascript', 'java-spring', 'dotnet-api', 'ruby-rails', 'php-laravel', 'vue-nuxt', 'react-native']) {
      expect(names).toContain(n)
    }
  })

  it('every selectable profile exposes a non-empty example_project (plain-language hint)', () => {
    const profiles = listProfiles()
    const missing = profiles.filter(p => !p.example_project || !p.example_project.trim())
    expect(missing.map(p => p.name)).toEqual([])
  })
})
