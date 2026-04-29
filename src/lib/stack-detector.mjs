import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

function readJson(filepath) {
  try { return JSON.parse(readFileSync(filepath, 'utf-8')) } catch { return null }
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

export function detectStack(projectDir) {
  const candidates = []

  const pkgPath = join(projectDir, 'package.json')
  const pyprojectPath = join(projectDir, 'pyproject.toml')
  const cargoPath = join(projectDir, 'Cargo.toml')
  const goModPath = join(projectDir, 'go.mod')

  // ── Node / TypeScript ───────────────────────────────────────────────────────
  const pkg = readJson(pkgPath)
  if (pkg) {
    score(candidates, 'node-typescript', 20, 'package.json found')
    if (existsSync(join(projectDir, 'tsconfig.json'))) {
      score(candidates, 'node-typescript', 15, 'tsconfig.json found')
    }
    if (hasDep(pkg, 'next')) {
      score(candidates, 'nextjs-react', 40, 'next in dependencies')
      // nextjs-react > node-typescript when next is present
      score(candidates, 'node-typescript', -10, 'next detected, downgrading node-typescript')
    }
    if (existsSync(join(projectDir, 'next.config.js')) || existsSync(join(projectDir, 'next.config.ts'))) {
      score(candidates, 'nextjs-react', 15, 'next.config.* found')
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
