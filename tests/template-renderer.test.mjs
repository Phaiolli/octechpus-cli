import { describe, it, expect } from 'vitest'
import { renderTemplate } from '../src/lib/template-renderer.mjs'

const profile = {
  language: 'typescript',
  runtime: 'node>=18',
  testing: {
    framework: 'vitest',
    coverage_target: 80,
  },
  agents: {
    designer: true,
    cost_engineer: false,
  },
  forbidden_patterns: ['console.log', ': any', '// @ts-ignore'],
}

describe('renderTemplate — simple substitution', () => {
  it('replaces a single top-level placeholder', () => {
    const result = renderTemplate('lang: {{stack.language}}', profile)
    expect(result).toBe('lang: typescript')
  })

  it('replaces a nested placeholder with dot notation', () => {
    const result = renderTemplate('framework: {{stack.testing.framework}}', profile)
    expect(result).toBe('framework: vitest')
  })

  it('replaces multiple placeholders in one template', () => {
    const tpl = '{{stack.language}} / {{stack.testing.framework}} @ {{stack.testing.coverage_target}}%'
    expect(renderTemplate(tpl, profile)).toBe('typescript / vitest @ 80%')
  })
})

describe('renderTemplate — conditional blocks', () => {
  it('renders block when condition is truthy', () => {
    const tpl = '{{#if stack.agents.designer}}Designer active{{/if}}'
    expect(renderTemplate(tpl, profile)).toBe('Designer active')
  })

  it('removes block when condition is falsy', () => {
    const tpl = '{{#if stack.agents.cost_engineer}}Cost engineer active{{/if}}'
    expect(renderTemplate(tpl, profile)).toBe('')
  })

  it('handles nested {{#if}} — outer false removes inner {{/if}} too', () => {
    const tpl = '{{#if stack.agents.cost_engineer}}outer {{#if stack.agents.designer}}inner{{/if}} end{{/if}}rest'
    expect(renderTemplate(tpl, profile)).toBe('rest')
  })

  it('handles nested {{#if}} — outer true, inner false leaves no residual {{/if}}', () => {
    const tpl = 'A{{#if stack.agents.designer}}B{{#if stack.agents.cost_engineer}}C{{/if}}D{{/if}}E'
    expect(renderTemplate(tpl, profile)).toBe('ABDE')
  })
})

describe('renderTemplate — each loops', () => {
  it('renders a list from an array', () => {
    const tpl = '{{#each stack.forbidden_patterns}}- {{this}}\n{{/each}}'
    const result = renderTemplate(tpl, profile)
    expect(result).toContain('- console.log')
    expect(result).toContain('- : any')
    expect(result).toContain('- // @ts-ignore')
  })

  it('renders empty string for empty array', () => {
    const profileWithEmpty = { ...profile, forbidden_patterns: [] }
    const tpl = '{{#each stack.forbidden_patterns}}- {{this}}{{/each}}'
    expect(renderTemplate(tpl, profileWithEmpty)).toBe('')
  })
})

describe('renderTemplate — strict vs loose mode', () => {
  it('strict mode throws for missing placeholder', () => {
    expect(() =>
      renderTemplate('{{stack.nonexistent.field}}', profile, { strict: true })
    ).toThrow(/placeholder not found/)
  })

  it('loose mode returns empty string for missing placeholder', () => {
    const result = renderTemplate('{{stack.nonexistent.field}}', profile, { strict: false })
    expect(result).toBe('')
  })
})
