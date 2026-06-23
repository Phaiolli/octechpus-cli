import { existsSync, readFileSync, readdirSync } from 'fs'
import { join, isAbsolute } from 'path'

function readJson(filepath) {
  try { return JSON.parse(readFileSync(filepath, 'utf-8')) } catch { return null }
}

// Collects text from project-overview markdown docs (README and similar), plus an
// optional explicit doc, lowercased into a single blob for keyword scanning.
function collectMarkdown(projectDir, describeFile) {
  const blobs = []
  const seen = new Set()
  const add = (full) => {
    if (!full || seen.has(full)) return
    seen.add(full)
    const t = readText(full)
    if (t) blobs.push(t)
  }
  if (describeFile) add(isAbsolute(describeFile) ? describeFile : join(projectDir, describeFile))
  try {
    const overview = /^(readme|project|architecture|stack|about|overview|spec|prd)\.md$/i
    for (const f of readdirSync(projectDir)) {
      if (overview.test(f)) add(join(projectDir, f))
    }
  } catch { /* unreadable dir */ }
  return blobs.join('\n').toLowerCase()
}

// Scores profiles from the prose of a project-description markdown document.
// Weights are moderate: a single clear framework mention reaches "medium"
// (asks for confirmation); rich descriptions can reach "high".
function scoreMarkdown(candidates, blob) {
  if (!blob) return
  const has = (re) => re.test(blob)
  const m = (name, pts, label) => score(candidates, name, pts, `${label} (doc .md)`)
  const hasTs = has(/\btypescript\b/)

  // ── Frontend / Node ──────────────────────────────────────────────────────
  if (has(/next\.?js/)) {
    m('nextjs-react', 26, 'next.js')
    m('node-typescript', -8, 'next downgrade'); m('node-javascript', -8, 'next downgrade')
  } else if (has(/\bnuxt\b/)) {
    m('vue-nuxt', 26, 'nuxt')
    m('node-typescript', -8, 'nuxt downgrade'); m('node-javascript', -8, 'nuxt downgrade')
  } else if (has(/react[ -]native/) || has(/\bexpo\b/)) {
    m('react-native', 26, 'react native')
    m('node-typescript', -8, 'react-native downgrade'); m('node-javascript', -8, 'react-native downgrade')
  } else if (has(/\bvue(\.js)?\b/)) {
    m('vue-nuxt', 16, 'vue')
  } else if (has(/\breact\b/)) {
    m('nextjs-react', 12, 'react')
  }
  if (has(/tailwind/)) m('nextjs-react', 4, 'tailwind')
  if (has(/shadcn/)) m('nextjs-react', 6, 'shadcn')

  if (has(/\bnest(\.?js)?\b/)) m('node-typescript', 18, 'nestjs')
  if (has(/\bexpress\b/) || has(/\bfastify\b/) || has(/\bkoa\b/)) {
    m(hasTs ? 'node-typescript' : 'node-javascript', 14, 'express/fastify/koa')
  }
  if (hasTs && !has(/next\.?js/) && !has(/\bnuxt\b/)) m('node-typescript', 14, 'typescript')
  if (!hasTs && (has(/\bnode\.?js\b/) || has(/\bjavascript\b/))) m('node-javascript', 14, 'node/javascript sem typescript')

  // ── Python ───────────────────────────────────────────────────────────────
  if (has(/\bfastapi\b/)) m('python-fastapi', 26, 'fastapi')
  if (has(/\bpydantic\b/)) m('python-fastapi', 8, 'pydantic')
  if (has(/\buvicorn\b/)) m('python-fastapi', 6, 'uvicorn')
  if (has(/\bclick\b/) || has(/\btyper\b/)) {
    m('python-cli', 22, 'click/typer'); m('python-fastapi', -8, 'cli downgrade')
  }
  if (has(/\blangchain\b/) || has(/\banthropic\b/) || has(/\bopenai\b/) || has(/\bllms?\b/)) {
    m('python-ai-pipeline', 24, 'LLM library')
    if (has(/\bfastapi\b/)) m('python-ai-pipeline', 16, 'fastapi + LLM')
  }

  // ── Go / Rust ─────────────────────────────────────────────────────────────
  if (has(/\bgolang\b/) || has(/go modules/) || has(/\bgin\b/) || has(/chi router/)) m('go-api', 24, 'go')
  if (has(/\brust\b/) || has(/\bcargo\b/) || has(/\btokio\b/) || has(/\bclap\b/)) m('rust-cli', 22, 'rust')

  // ── Java / .NET ───────────────────────────────────────────────────────────
  if (has(/spring boot/) || has(/\bspring\b/)) m('java-spring', 24, 'spring')
  else if (has(/\bjava\b/)) m('java-spring', 10, 'java')
  if (has(/asp\.?net/) || has(/\.net\b/) || has(/\bc#/) || has(/\bcsharp\b/)) m('dotnet-api', 24, '.net/c#')

  // ── Ruby / PHP ────────────────────────────────────────────────────────────
  if (has(/ruby on rails/) || has(/\brails\b/)) m('ruby-rails', 24, 'rails')
  else if (has(/\bruby\b/)) m('ruby-rails', 10, 'ruby')
  if (has(/\blaravel\b/)) m('php-laravel', 24, 'laravel')
  else if (has(/\bphp\b/)) m('php-laravel', 12, 'php')
}

// Returns the name of the first top-level file matching one of the extensions, or null.
function findByExt(dir, exts) {
  try {
    const found = readdirSync(dir).find(f => exts.some(ext => f.endsWith(ext)))
    return found || null
  } catch { return null }
}

function readText(filepath) {
  try { return readFileSync(filepath, 'utf-8') } catch { return null }
}

function hasDep(pkg, name) {
  if (!pkg) return false
  return !!(pkg.dependencies?.[name] || pkg.devDependencies?.[name])
}

function score(candidates, name, points, evidence) {
  const existing = candidates.find(c => c.name === name)
  if (existing) {
    existing.confidence += points
    existing.evidence.push(evidence)
  } else {
    candidates.push({ name, confidence: points, evidence: [evidence] })
  }
}

export function detectStack(projectDir, options = {}) {
  const candidates = []

  const pkgPath = join(projectDir, 'package.json')
  const pyprojectPath = join(projectDir, 'pyproject.toml')
  const cargoPath = join(projectDir, 'Cargo.toml')
  const goModPath = join(projectDir, 'go.mod')

  // ── Node / TypeScript / JavaScript ───────────────────────────────────────────
  const pkg = readJson(pkgPath)
  if (pkg) {
    score(candidates, 'node-typescript', 20, 'package.json found')
    const hasTs = existsSync(join(projectDir, 'tsconfig.json')) || hasDep(pkg, 'typescript')
    if (hasTs) {
      score(candidates, 'node-typescript', 15, 'TypeScript (tsconfig.json / typescript dep)')
    } else {
      // Plain JavaScript project — do not force the TypeScript profile
      score(candidates, 'node-javascript', 25, 'package.json without TypeScript')
      score(candidates, 'node-typescript', -15, 'no TypeScript, downgrading node-typescript')
    }
    if (hasDep(pkg, 'react-native') || hasDep(pkg, 'expo')) {
      score(candidates, 'react-native', 40, 'react-native/expo in dependencies')
      score(candidates, 'node-typescript', -10, 'react-native detected, downgrading node-typescript')
      score(candidates, 'node-javascript', -10, 'react-native detected, downgrading node-javascript')
    } else if (hasDep(pkg, 'nuxt')) {
      score(candidates, 'vue-nuxt', 40, 'nuxt in dependencies')
      score(candidates, 'node-typescript', -10, 'nuxt detected, downgrading node-typescript')
      score(candidates, 'node-javascript', -10, 'nuxt detected, downgrading node-javascript')
    } else if (hasDep(pkg, 'vue')) {
      score(candidates, 'vue-nuxt', 25, 'vue in dependencies')
    } else if (hasDep(pkg, 'next')) {
      score(candidates, 'nextjs-react', 40, 'next in dependencies')
      // nextjs-react > node-typescript when next is present
      score(candidates, 'node-typescript', -10, 'next detected, downgrading node-typescript')
      score(candidates, 'node-javascript', -10, 'next detected, downgrading node-javascript')
    }
    if (existsSync(join(projectDir, 'next.config.js')) || existsSync(join(projectDir, 'next.config.ts'))) {
      score(candidates, 'nextjs-react', 15, 'next.config.* found')
    }
    if (existsSync(join(projectDir, 'nuxt.config.ts')) || existsSync(join(projectDir, 'nuxt.config.js'))) {
      score(candidates, 'vue-nuxt', 15, 'nuxt.config.* found')
    }
    if (existsSync(join(projectDir, 'src', 'app')) || existsSync(join(projectDir, 'app'))) {
      score(candidates, 'nextjs-react', 10, 'app/ directory (Next.js App Router)')
    }
  }

  // ── Python ──────────────────────────────────────────────────────────────────
  const pyproject = readText(pyprojectPath)
  if (pyproject) {
    score(candidates, 'python-fastapi', 20, 'pyproject.toml found')

    if (pyproject.includes('fastapi')) {
      score(candidates, 'python-fastapi', 30, 'fastapi in pyproject.toml')
    }
    if (pyproject.includes('click') || pyproject.includes('typer')) {
      score(candidates, 'python-cli', 30, 'click/typer in pyproject.toml')
      score(candidates, 'python-fastapi', -10, 'cli framework detected, downgrading python-fastapi')
    }
    if (pyproject.includes('anthropic') || pyproject.includes('openai') || pyproject.includes('langchain')) {
      score(candidates, 'python-ai-pipeline', 30, 'LLM library in pyproject.toml')
      // LLM + fastapi together → clearly an AI pipeline, not a plain API
      if (pyproject.includes('fastapi')) {
        score(candidates, 'python-ai-pipeline', 30, 'fastapi + LLM library combination')
      }
    }
    if (existsSync(join(projectDir, 'app', 'main.py'))) {
      score(candidates, 'python-fastapi', 10, 'app/main.py structure')
    }
  }

  // ── Rust ────────────────────────────────────────────────────────────────────
  if (existsSync(cargoPath)) {
    score(candidates, 'rust-cli', 20, 'Cargo.toml found')
    const cargo = readText(cargoPath)
    if (cargo?.includes('clap')) score(candidates, 'rust-cli', 20, 'clap in Cargo.toml')
    if (existsSync(join(projectDir, 'src', 'main.rs'))) {
      score(candidates, 'rust-cli', 10, 'src/main.rs found')
    }
  }

  // ── Go ──────────────────────────────────────────────────────────────────────
  if (existsSync(goModPath)) {
    score(candidates, 'go-api', 20, 'go.mod found')
    if (existsSync(join(projectDir, 'cmd'))) {
      score(candidates, 'go-api', 15, 'cmd/ directory found')
    }
  }

  // ── Java (Maven/Gradle + Spring) ──────────────────────────────────────────────
  const pomXml = readText(join(projectDir, 'pom.xml'))
  const gradle = readText(join(projectDir, 'build.gradle')) || readText(join(projectDir, 'build.gradle.kts'))
  if (pomXml || gradle) {
    score(candidates, 'java-spring', 20, pomXml ? 'pom.xml found' : 'build.gradle found')
    if ((pomXml || gradle || '').includes('spring')) {
      score(candidates, 'java-spring', 25, 'spring in build config')
    }
  }

  // ── .NET (C#) ─────────────────────────────────────────────────────────────────
  const csproj = findByExt(projectDir, ['.csproj', '.sln'])
  if (csproj) {
    score(candidates, 'dotnet-api', 30, `${csproj} found`)
  }

  // ── Ruby (Rails) ──────────────────────────────────────────────────────────────
  const gemfile = readText(join(projectDir, 'Gemfile'))
  if (gemfile) {
    score(candidates, 'ruby-rails', 20, 'Gemfile found')
    if (gemfile.includes('rails')) score(candidates, 'ruby-rails', 25, 'rails in Gemfile')
  }

  // ── PHP (Laravel) ─────────────────────────────────────────────────────────────
  const composer = readJson(join(projectDir, 'composer.json'))
  if (composer) {
    score(candidates, 'php-laravel', 20, 'composer.json found')
    const req = { ...composer.require, ...composer['require-dev'] }
    if (req && Object.keys(req).some(k => k.startsWith('laravel/'))) {
      score(candidates, 'php-laravel', 25, 'laravel/* in composer.json')
    }
  }

  // ── Project description (.md) ─────────────────────────────────────────────
  // Scans README and similar overview docs (and an optional explicit doc) so the
  // stack can be inferred from prose — useful for greenfield projects described
  // in a document before any manifest/lockfile exists.
  scoreMarkdown(candidates, collectMarkdown(projectDir, options.describeFile))

  // Remove zero-evidence placeholders and deduplicate
  const clean = candidates.filter(c => c.evidence.filter(Boolean).length > 0)

  // Normalize confidence to labels
  const labeled = clean.map(c => ({
    ...c,
    confidenceLabel: c.confidence >= 40 ? 'high' : c.confidence >= 20 ? 'medium' : 'low',
  }))

  labeled.sort((a, b) => b.confidence - a.confidence)

  const best = labeled[0] ?? { name: null, confidence: 0, confidenceLabel: 'none', evidence: [] }

  return { candidates: labeled, best }
}
