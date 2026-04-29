/**
 * Renders {{placeholders}} in markdown templates using a resolved profile object.
 *
 * Supported syntax:
 *   {{stack.path.to.value}}          — simple value substitution
 *   {{#if stack.path.to.bool}}...{{/if}}  — conditional block
 *   {{#each stack.path.to.array}}- {{this}}{{/each}}  — list iteration
 *
 * Modes:
 *   strict (default) — throws if a placeholder has no value
 *   loose            — replaces missing values with empty string
 */

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function renderTemplate(template, profile, { strict = true } = {}) {
  let result = template

  // {{#each stack.x.y}}- {{this}}{{/each}}
  result = result.replace(
    /\{\{#each (stack\.[^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, path, body) => {
      const key = path.slice('stack.'.length)
      const arr = getByPath(profile, key)
      if (!Array.isArray(arr) || arr.length === 0) return ''
      return arr.map(item => body.replace(/\{\{this\}\}/g, item)).join('')
    }
  )

  // {{#if stack.x.y}}...{{/if}} — loop handles nesting (innermost-first each pass)
  let prev
  do {
    prev = result
    result = result.replace(
      /\{\{#if (stack\.[^}]+)\}\}((?:(?!\{\{#if )[\s\S])*?)\{\{\/if\}\}/g,
      (_, path, body) => {
        const key = path.slice('stack.'.length)
        const val = getByPath(profile, key)
        return val ? body : ''
      }
    )
  } while (result !== prev)

  // {{stack.x.y.z}}
  result = result.replace(/\{\{stack\.([^}]+)\}\}/g, (match, path) => {
    const val = getByPath(profile, path)
    // null means "not applicable" — always render as empty, never throw
    if (val === null) return ''
    if (val === undefined) {
      if (strict) throw new Error(`Template placeholder not found in profile: stack.${path}`)
      return ''
    }
    return String(val)
  })

  return result
}
