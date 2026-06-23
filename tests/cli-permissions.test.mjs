import { describe, it, expect, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { mkdtempSync, rmSync, readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI = join(__dirname, '..', 'src', 'cli.mjs')

function runCLI(args, { input = '', cwd } = {}) {
  return spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    input,
    cwd: cwd || process.cwd(),
    env: process.env,
  })
}

function makeTmpDir() {
  return mkdtempSync(join(tmpdir(), 'octechpus-perms-'))
}

function readFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  return match ? match[1] : ''
}

// ── settings.json ─────────────────────────────────────────────────────────────

describe('init generates .claude/settings.json', () => {
  let tmpDir
  afterEach(() => { if (tmpDir) rmSync(tmpDir, { recursive: true, force: true }) })

  it('writes a valid settings.json with permissions allow/ask/deny', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const path = join(tmpDir, '.claude', 'settings.json')
    expect(existsSync(path)).toBe(true)
    const settings = JSON.parse(readFileSync(path, 'utf-8'))
    expect(Array.isArray(settings.permissions.allow)).toBe(true)
    expect(Array.isArray(settings.permissions.ask)).toBe(true)
    expect(Array.isArray(settings.permissions.deny)).toBe(true)
    expect(settings.permissions.allow.length).toBeGreaterThan(0)
  })

  it('denies reading secrets (.env) and destructive commands', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const settings = JSON.parse(readFileSync(join(tmpDir, '.claude', 'settings.json'), 'utf-8'))
    expect(settings.permissions.deny.some(r => r.includes('.env'))).toBe(true)
    expect(settings.permissions.deny.some(r => r.includes('rm -rf'))).toBe(true)
  })

  it('asks (not auto-allows) on git push and npm publish', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const settings = JSON.parse(readFileSync(join(tmpDir, '.claude', 'settings.json'), 'utf-8'))
    expect(settings.permissions.ask.some(r => r.includes('git push'))).toBe(true)
  })

  it('derives Write/Edit deny rules from guardrails.read_only_paths', () => {
    tmpDir = makeTmpDir()
    // python-ai-pipeline declares read_only_paths: ["profiles/**/prompts/**"]
    runCLI(['init', '--stack=python-ai-pipeline'], { cwd: tmpDir })
    const settings = JSON.parse(readFileSync(join(tmpDir, '.claude', 'settings.json'), 'utf-8'))
    expect(settings.permissions.deny).toContain('Write(profiles/**/prompts/**)')
    expect(settings.permissions.deny).toContain('Edit(profiles/**/prompts/**)')
    // no double-glob from a path that already ends in /**
    expect(settings.permissions.deny.every(r => !r.includes('/**/**'))).toBe(true)
  })
})

// ── scoped subagents ──────────────────────────────────────────────────────────

describe('init generates scoped .claude/agents/', () => {
  let tmpDir
  afterEach(() => { if (tmpDir) rmSync(tmpDir, { recursive: true, force: true }) })

  it('creates one subagent file per active agent', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const dir = join(tmpDir, '.claude', 'agents')
    expect(existsSync(dir)).toBe(true)
    const files = readdirSync(dir).filter(f => f.endsWith('.md'))
    // 12 always-on agents; cost-engineer is opt-in (off for node-javascript)
    expect(files).toContain('security.md')
    expect(files).toContain('coder.md')
    expect(files).not.toContain('cost-engineer.md')
  })

  it('analysis agents are read-only (no Write/Edit/Bash)', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    for (const name of ['security', 'reviewer', 'privacy', 'architect']) {
      const fm = readFrontmatter(readFileSync(join(tmpDir, '.claude', 'agents', `${name}.md`), 'utf-8'))
      expect(fm).toContain('tools: Read, Grep, Glob')
      expect(fm).not.toContain('Write')
      expect(fm).not.toContain('Bash')
    }
  })

  it('action agents have write/exec tools', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const fm = readFrontmatter(readFileSync(join(tmpDir, '.claude', 'agents', 'coder.md'), 'utf-8'))
    expect(fm).toContain('Write')
    expect(fm).toContain('Edit')
    expect(fm).toContain('Bash')
  })

  it('does not leak the $ARGUMENTS slash-command placeholder', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    for (const name of ['coder', 'security', 'reviewer', 'docs']) {
      const content = readFileSync(join(tmpDir, '.claude', 'agents', `${name}.md`), 'utf-8')
      expect(content).not.toContain('$ARGUMENTS')
    }
  })

  it('embeds the anti prompt-injection guard in every subagent', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const dir = join(tmpDir, '.claude', 'agents')
    for (const f of readdirSync(dir).filter(n => n.endsWith('.md'))) {
      expect(readFileSync(join(dir, f), 'utf-8')).toContain('Segurança de execução')
    }
  })

  it('applies model tiering (opus for security, haiku for docs)', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const sec = readFrontmatter(readFileSync(join(tmpDir, '.claude', 'agents', 'security.md'), 'utf-8'))
    const docs = readFrontmatter(readFileSync(join(tmpDir, '.claude', 'agents', 'docs.md'), 'utf-8'))
    expect(sec).toContain('model: opus')
    expect(docs).toContain('model: haiku')
  })

  it('generates cost-engineer subagent only when the agent is opt-in enabled', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=python-ai-pipeline'], { cwd: tmpDir })
    expect(existsSync(join(tmpDir, '.claude', 'agents', 'cost-engineer.md'))).toBe(true)
  })
})

// ── manifest tracking ─────────────────────────────────────────────────────────

describe('manifest tracks the generated files', () => {
  let tmpDir
  afterEach(() => { if (tmpDir) rmSync(tmpDir, { recursive: true, force: true }) })

  it('records settings.json and subagents in the manifest', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const manifest = JSON.parse(readFileSync(join(tmpDir, '.octechpus', 'manifest.json'), 'utf-8'))
    expect(manifest.files['.claude/settings.json']).toBeTruthy()
    expect(manifest.files['.claude/agents/security.md']).toBeTruthy()
  })
})

// ── migration (existing v2.4 projects) ────────────────────────────────────────

describe('update backfills permissions + subagents on existing projects', () => {
  let tmpDir
  afterEach(() => { if (tmpDir) rmSync(tmpDir, { recursive: true, force: true }) })

  it('adds settings.json and .claude/agents/ when missing', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    // simulate a project installed before v2.5 (commands only, no settings/agents)
    rmSync(join(tmpDir, '.claude', 'settings.json'), { force: true })
    rmSync(join(tmpDir, '.claude', 'agents'), { recursive: true, force: true })
    expect(existsSync(join(tmpDir, '.claude', 'settings.json'))).toBe(false)

    runCLI(['update'], { cwd: tmpDir })

    expect(existsSync(join(tmpDir, '.claude', 'settings.json'))).toBe(true)
    expect(existsSync(join(tmpDir, '.claude', 'agents', 'security.md'))).toBe(true)
  })
})

// ── doctor integrity check ────────────────────────────────────────────────────

describe('doctor verifies manifest integrity', () => {
  let tmpDir
  afterEach(() => { if (tmpDir) rmSync(tmpDir, { recursive: true, force: true }) })

  it('reports a clean install as matching the manifest', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    const out = runCLI(['doctor'], { cwd: tmpDir }).stdout
    expect(out).toMatch(/Integrity: all \d+ tracked files match/)
  })

  it('flags a missing tracked file', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    rmSync(join(tmpDir, '.claude', 'agents', 'security.md'), { force: true })
    const out = runCLI(['doctor'], { cwd: tmpDir }).stdout
    expect(out).toContain('faltando')
  })
})

// ── profile switch re-renders ─────────────────────────────────────────────────

describe('profile switch re-generates subagents', () => {
  let tmpDir
  afterEach(() => { if (tmpDir) rmSync(tmpDir, { recursive: true, force: true }) })

  it('adds cost-engineer subagent after switching to a profile that enables it', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-javascript'], { cwd: tmpDir })
    expect(existsSync(join(tmpDir, '.claude', 'agents', 'cost-engineer.md'))).toBe(false)
    runCLI(['profile', 'switch', 'python-ai-pipeline'], { cwd: tmpDir })
    expect(existsSync(join(tmpDir, '.claude', 'agents', 'cost-engineer.md'))).toBe(true)
  })
})
