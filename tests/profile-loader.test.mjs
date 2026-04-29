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

  it('nextjs-react has designer=true, node-typescript has designer=false', () => {
    const nextjs = resolveProfile('nextjs-react')
    const node = resolveProfile('node-typescript')
    expect(nextjs.agents.designer).toBe(true)
    expect(node.agents.designer).toBe(false)
  })

  it('nextjs-react forbidden_patterns includes both parent and child patterns', () => {
    const profile = resolveProfile('nextjs-react')
    const patterns = profile.forbidden_patterns
    // From node-typescript parent
    expect(patterns.some(p => p.includes('console'))).toBe(true)
    // From nextjs-react itself
    expect(patterns.some(p => p.includes('transition-all'))).toBe(true)
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
})
