import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { load as yamlLoad } from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROFILES_DIR = join(__dirname, '..', 'profiles')

const cache = new Map()

export function listProfiles() {
  return readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.yaml') && !f.startsWith('_'))
    .map(f => {
      const name = f.replace('.yaml', '')
      try {
        const raw = yamlLoad(readFileSync(join(PROFILES_DIR, f), 'utf-8'))
        return { name, description: raw.description || '', file: f }
      } catch {
        return { name, description: '', file: f }
      }
    })
}

export function loadProfile(name) {
  if (cache.has(name)) return cache.get(name)

  const filepath = join(PROFILES_DIR, `${name}.yaml`)
  if (!existsSync(filepath)) {
    throw new Error(`Profile not found: "${name}" (looked in ${PROFILES_DIR})`)
  }

  const raw = yamlLoad(readFileSync(filepath, 'utf-8'))
  cache.set(name, raw)
  return raw
}

function deepMerge(base, override) {
  const result = { ...base }
  for (const [key, val] of Object.entries(override)) {
    if (val === null || val === undefined) {
      result[key] = val
    } else if (Array.isArray(val)) {
      const baseArr = Array.isArray(result[key]) ? result[key] : []
      if (typeof val[0] === 'string' && val[0] === '!override') {
        result[key] = val.slice(1)
      } else {
        result[key] = [...baseArr, ...val]
      }
    } else if (typeof val === 'object') {
      result[key] = deepMerge(typeof result[key] === 'object' && result[key] !== null ? result[key] : {}, val)
    } else {
      result[key] = val
    }
  }
  return result
}

export function resolveProfile(name) {
  const profile = loadProfile(name)

  if (!profile.extends) return { ...profile }

  const parent = resolveProfile(profile.extends)
  const { extends: _, ...profileWithoutExtends } = profile
  return deepMerge(parent, profileWithoutExtends)
}

export function validateProfile(profile) {
  let base
  try {
    base = loadProfile('_base')
  } catch {
    throw new Error(
      `Cannot validate profile "${profile.name}": _base.yaml is missing or invalid. ` +
      `This is a critical file — restore it from the octechpus-cli repository.`
    )
  }
  const required = base.required_placeholders || []
  const missing = []

  for (const placeholder of required) {
    const parts = placeholder.split('.')
    let val = profile
    for (const part of parts) {
      val = val?.[part]
    }
    if (val === undefined) {
      missing.push(placeholder)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Profile "${profile.name}" is missing required placeholders:\n` +
      missing.map(p => `  - ${p}`).join('\n')
    )
  }

  return true
}
