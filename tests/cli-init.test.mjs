import { describe, it, expect, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs'
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
  return mkdtempSync(join(tmpdir(), 'octechpus-test-'))
}

// ── --stack flag ─────────────────────────────────────────────────────────────

describe('init --stack=python-fastapi', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('exits with code 0 and creates CLAUDE.md', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init', '--stack=python-fastapi'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    expect(existsSync(join(tmpDir, 'CLAUDE.md'))).toBe(true)
  })

  it('CLAUDE.md contains python-fastapi as Stack Profile', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=python-fastapi'], { cwd: tmpDir })
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('python-fastapi')
  })

  it('CLAUDE.md references pytest as test framework', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=python-fastapi'], { cwd: tmpDir })
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('pytest')
  })

  it('writes .octechpus/manifest.json with correct profile and version', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=python-fastapi'], { cwd: tmpDir })
    const manifestPath = join(tmpDir, '.octechpus', 'manifest.json')
    expect(existsSync(manifestPath)).toBe(true)
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    expect(manifest.profile).toBe('python-fastapi')
    expect(manifest.version).toBe('2.0.0')
  })

  it('creates .claude/commands/ with core command files', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=python-fastapi'], { cwd: tmpDir })
    const coreCmds = ['pipeline.md', 'architect.md', 'review.md', 'qa.md', 'security.md']
    for (const cmd of coreCmds) {
      expect(existsSync(join(tmpDir, '.claude', 'commands', cmd))).toBe(true)
    }
  })
})

// ── auto-detection ────────────────────────────────────────────────────────────

describe('init — auto-detection from project files', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('detects python-fastapi from pyproject.toml with fastapi dependency', () => {
    tmpDir = makeTmpDir()
    writeFileSync(join(tmpDir, 'pyproject.toml'), '[project]\ndependencies = ["fastapi", "uvicorn"]\n')
    const result = runCLI(['init'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('python-fastapi')
  })

  it('detects nextjs-react from package.json with next dependency', () => {
    tmpDir = makeTmpDir()
    writeFileSync(
      join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'my-app', dependencies: { next: '^14.0.0', react: '^18.0.0' } })
    )
    const result = runCLI(['init'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('nextjs-react')
  })
})

// ── interactive selection ─────────────────────────────────────────────────────

describe('init — interactive profile selection (empty folder)', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('selects profile by name from piped stdin and creates correct CLAUDE.md', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init'], { cwd: tmpDir, input: 'python-fastapi\n' })
    expect(result.status).toBe(0)
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('python-fastapi')
  })

  it('selects profile by number "1" from piped stdin', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init'], { cwd: tmpDir, input: '1\n' })
    expect(result.status).toBe(0)
    expect(existsSync(join(tmpDir, 'CLAUDE.md'))).toBe(true)
  })
})

// ── update — preserves customizations ────────────────────────────────────────

describe('update — customization preservation', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('preserves a manually-edited command file across update', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })

    const reviewPath = join(tmpDir, '.claude', 'commands', 'review.md')
    const customMarker = '<!-- CUSTOM EDIT BY USER -->'
    const original = readFileSync(reviewPath, 'utf-8')
    writeFileSync(reviewPath, original + '\n\n' + customMarker, 'utf-8')

    runCLI(['update'], { cwd: tmpDir })

    const after = readFileSync(reviewPath, 'utf-8')
    expect(after).toContain(customMarker)
  })

  it('updates a non-customized file when update is run', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })

    const result = runCLI(['update'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Updated')
  })

  it('overrides customizations when --force is passed', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })

    const reviewPath = join(tmpDir, '.claude', 'commands', 'review.md')
    const customMarker = '<!-- WILL BE OVERRIDDEN -->'
    writeFileSync(reviewPath, customMarker, 'utf-8')

    runCLI(['update', '--force'], { cwd: tmpDir })

    const after = readFileSync(reviewPath, 'utf-8')
    expect(after).not.toContain(customMarker)
  })
})

// ── error handling ────────────────────────────────────────────────────────────

describe('init — error cases', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  it('exits with code 1 when --stack is an unknown profile name', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init', '--stack=nonexistent-profile-xyz'], { cwd: tmpDir })
    expect(result.status).toBe(1)
  })

  it('outputs "Profile not found" for unknown --stack', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init', '--stack=nonexistent-profile-xyz'], { cwd: tmpDir })
    const output = result.stdout + result.stderr
    expect(output).toContain('Profile not found')
  })
})
