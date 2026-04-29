import { describe, it, expect, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'fs'
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
  return mkdtempSync(join(tmpdir(), 'octechpus-profile-test-'))
}

// ── profile list ──────────────────────────────────────────────────────────────

describe('profile list', () => {
  it('exits with code 0', () => {
    const result = runCLI(['profile', 'list'])
    expect(result.status).toBe(0)
  })

  it('lists known profiles in output', () => {
    const result = runCLI(['profile', 'list'])
    expect(result.stdout).toContain('python-fastapi')
    expect(result.stdout).toContain('nextjs-react')
    expect(result.stdout).toContain('node-typescript')
    expect(result.stdout).toContain('go-api')
  })

  it('lists at least 6 profiles', () => {
    const result = runCLI(['profile', 'list'])
    const profileNames = ['python-fastapi', 'nextjs-react', 'node-typescript', 'go-api', 'rust-cli', 'python-cli']
    const found = profileNames.filter(n => result.stdout.includes(n))
    expect(found.length).toBeGreaterThanOrEqual(6)
  })
})

// ── profile show ──────────────────────────────────────────────────────────────

describe('profile show', () => {
  it('exits with code 0 for a known profile', () => {
    const result = runCLI(['profile', 'show', 'python-fastapi'])
    expect(result.status).toBe(0)
  })

  it('outputs JSON containing the resolved language field', () => {
    const result = runCLI(['profile', 'show', 'python-fastapi'])
    expect(result.stdout).toContain('"language": "python"')
  })

  it('resolves inherited fields — shows pytest from python-fastapi', () => {
    const result = runCLI(['profile', 'show', 'python-fastapi'])
    expect(result.stdout).toContain('"framework": "pytest"')
  })

  it('resolves nextjs-react through node-typescript parent — shows TypeScript language', () => {
    const result = runCLI(['profile', 'show', 'nextjs-react'])
    expect(result.stdout).toContain('"language": "typescript"')
  })

  it('exits with code 1 and error message for unknown profile', () => {
    const result = runCLI(['profile', 'show', 'does-not-exist'])
    expect(result.status).toBe(1)
    const output = result.stdout + result.stderr
    expect(output).toContain('Profile not found')
  })

  it('exits with code 1 when no name given', () => {
    const result = runCLI(['profile', 'show'])
    expect(result.status).toBe(1)
  })
})

// ── profile switch ────────────────────────────────────────────────────────────

describe('profile switch', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('switches from node-typescript to nextjs-react and re-renders CLAUDE.md', () => {
    tmpDir = makeTmpDir()

    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })
    const before = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(before).toContain('node-typescript')

    const result = runCLI(['profile', 'switch', 'nextjs-react'], { cwd: tmpDir })
    expect(result.status).toBe(0)

    const after = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(after).toContain('nextjs-react')
  })

  it('updates manifest.json to the new profile name after switch', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })
    runCLI(['profile', 'switch', 'nextjs-react'], { cwd: tmpDir })

    const manifest = JSON.parse(readFileSync(join(tmpDir, '.octechpus', 'manifest.json'), 'utf-8'))
    expect(manifest.profile).toBe('nextjs-react')
  })

  it('re-renders agent commands with new profile during switch', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })

    const qaBefore = readFileSync(join(tmpDir, '.claude', 'commands', 'qa.md'), 'utf-8')
    expect(qaBefore).toContain('vitest')

    runCLI(['profile', 'switch', 'python-fastapi'], { cwd: tmpDir })
    const qaAfter = readFileSync(join(tmpDir, '.claude', 'commands', 'qa.md'), 'utf-8')
    expect(qaAfter).toContain('pytest')
  })

  it('exits with code 1 when switching to unknown profile', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })
    const result = runCLI(['profile', 'switch', 'nonexistent-xyz'], { cwd: tmpDir })
    expect(result.status).toBe(1)
  })

  it('warns when project is not initialized', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['profile', 'switch', 'python-fastapi'], { cwd: tmpDir })
    const output = result.stdout + result.stderr
    expect(output).toContain('not installed')
  })
})

// ── profile current ───────────────────────────────────────────────────────────

describe('profile current', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('shows profile name from manifest after init', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=go-api'], { cwd: tmpDir })
    const result = runCLI(['profile', 'current'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('go-api')
  })

  it('reports no profile in an uninitialized directory', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['profile', 'current'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    const output = result.stdout.toLowerCase()
    expect(output).toMatch(/no profile|not set|initialize/)
  })
})
