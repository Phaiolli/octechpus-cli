import { describe, it, expect, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI = join(__dirname, '..', 'src', 'cli.mjs')
const PKG_VERSION = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')).version

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

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g
function stripAnsi(s) {
  return (s || '').replace(ANSI_RE, '')
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
    expect(manifest.version).toBe(PKG_VERSION)
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
    // 'a' = caminho "Projeto em andamento"; pasta vazia → detecção falha → lista
    const result = runCLI(['init'], { cwd: tmpDir, input: 'a\npython-fastapi\n' })
    expect(result.status).toBe(0)
    const content = readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('python-fastapi')
  })

  it('selects profile by number "1" from piped stdin', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init'], { cwd: tmpDir, input: 'a\n1\n' })
    expect(result.status).toBe(0)
    expect(existsSync(join(tmpDir, 'CLAUDE.md'))).toBe(true)
  })

  it('shows the plain-language example (💡) for each profile in the list', () => {
    tmpDir = makeTmpDir()
    // pick generic to end the prompt; we only assert on the printed list above it
    const result = runCLI(['init', '--dry-run'], { cwd: tmpDir, input: 'a\ngeneric\n' })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('💡 Ex.:')
    expect(result.stdout).toContain('O aplicativo de celular')
  })

  it('guided mode ("?") asks 5 questions and recommends a matching profile', () => {
    tmpDir = makeTmpDir()
    // ? → describe → product=2(mobile) → lang=1(JS/TS) → perf=2 → ent=2 → mixed=2 → confirm(Enter)
    const input = 'a\n?\num app de celular para academia\n2\n1\n2\n2\n2\n\n'
    const result = runCLI(['init', '--dry-run'], { cwd: tmpDir, input })
    const out = stripAnsi(result.stdout)
    expect(result.status).toBe(0)
    expect(out).toContain('Modo guiado')
    expect(out).toMatch(/Recomendação:\s+react-native/)
  })

  it('guided mode recommends generic when the project is "mixed"', () => {
    tmpDir = makeTmpDir()
    // ? → (no describe) → product=3 → lang=9 → perf=2 → ent=2 → mixed=1(misto) → confirm
    const input = 'a\n?\n\n3\n9\n2\n2\n1\n\n'
    const result = runCLI(['init', '--dry-run'], { cwd: tmpDir, input })
    const out = stripAnsi(result.stdout)
    expect(result.status).toBe(0)
    expect(out).toMatch(/Recomendação:\s+generic/)
  })
})

// ── two-path selection (v2.10.0) ───────────────────────────────────────────────
describe('init — two-path stack selection (v2.10.0)', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  // fastapi(26) + pydantic(8) + uvicorn(6) = 40 → confiança alta → auto-aplica
  const PID_FASTAPI = '# PID do Projeto\n\nBackend em Python usando FastAPI, com Pydantic para validação e Uvicorn como servidor ASGI.\n'

  it('shows the two entry paths (A/B) instead of the long list upfront', () => {
    tmpDir = makeTmpDir()
    const out = stripAnsi(runCLI(['init', '--dry-run'], { cwd: tmpDir, input: 'a\ngeneric\n' }).stdout)
    expect(out).toContain('Projeto em andamento')
    expect(out).toContain('Projeto novo')
  })

  it('path B (new project) reads a PID .md and installs the ideal stack', () => {
    tmpDir = makeTmpDir()
    writeFileSync(join(tmpDir, 'pid.md'), PID_FASTAPI)
    // 'b' → caminho novo; 'pid.md' → documento apontado
    const result = runCLI(['init'], { cwd: tmpDir, input: 'b\npid.md\n' })
    expect(result.status).toBe(0)
    expect(readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')).toContain('python-fastapi')
  })

  it('--describe flag bypasses the menu and enters the new-project path', () => {
    tmpDir = makeTmpDir()
    writeFileSync(join(tmpDir, 'pid.md'), PID_FASTAPI)
    const result = runCLI(['init', '--describe=pid.md'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    expect(readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')).toContain('python-fastapi')
  })

  it('exits 1 when --describe points to a missing/invalid PID', () => {
    tmpDir = makeTmpDir()
    const result = runCLI(['init', '--describe=nope.md'], { cwd: tmpDir })
    expect(result.status).toBe(1)
    expect(stripAnsi(result.stderr + result.stdout)).toMatch(/não encontrado/i)
  })

  it('--describe finds the PID by name only (no path, no .md extension)', () => {
    tmpDir = makeTmpDir()
    // PID em subpasta, informado só pelo nome e sem extensão
    mkdirSync(join(tmpDir, 'docs'), { recursive: true })
    writeFileSync(join(tmpDir, 'docs', 'pid.md'), PID_FASTAPI)
    const result = runCLI(['init', '--describe=pid'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    expect(readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')).toContain('python-fastapi')
  })

  it('--describe by name is ambiguous when multiple .md share the name → exit 1', () => {
    tmpDir = makeTmpDir()
    mkdirSync(join(tmpDir, 'a'), { recursive: true })
    mkdirSync(join(tmpDir, 'b'), { recursive: true })
    writeFileSync(join(tmpDir, 'a', 'pid.md'), PID_FASTAPI)
    writeFileSync(join(tmpDir, 'b', 'pid.md'), PID_FASTAPI)
    const result = runCLI(['init', '--describe=pid'], { cwd: tmpDir })
    expect(result.status).toBe(1)
    expect(stripAnsi(result.stderr + result.stdout)).toMatch(/mais de um/i)
  })

  it('interactive path B with an ambiguous name falls back to guided mode', () => {
    tmpDir = makeTmpDir()
    mkdirSync(join(tmpDir, 'x'), { recursive: true })
    mkdirSync(join(tmpDir, 'y'), { recursive: true })
    writeFileSync(join(tmpDir, 'x', 'pid.md'), PID_FASTAPI)
    writeFileSync(join(tmpDir, 'y', 'pid.md'), PID_FASTAPI)
    // b → nome ambíguo → cai no modo guiado (não sai com erro no modo interativo)
    const input = 'b\npid\n?\n\n3\n9\n2\n2\n1\n\n'
    const out = stripAnsi(runCLI(['init', '--dry-run'], { cwd: tmpDir, input }).stdout)
    expect(out).toMatch(/Mais de um "pid"/)
    expect(out).toContain('Modo guiado')
  })

  it('ignores noise dirs (node_modules) when searching the PID by name', () => {
    tmpDir = makeTmpDir()
    mkdirSync(join(tmpDir, 'node_modules', 'pkg'), { recursive: true })
    writeFileSync(join(tmpDir, 'node_modules', 'pkg', 'pid.md'), PID_FASTAPI)
    writeFileSync(join(tmpDir, 'pid.md'), PID_FASTAPI)
    // só o pid.md fora de node_modules deve contar → sem ambiguidade
    const result = runCLI(['init', '--describe=pid'], { cwd: tmpDir })
    expect(result.status).toBe(0)
    expect(readFileSync(join(tmpDir, 'CLAUDE.md'), 'utf-8')).toContain('python-fastapi')
  })

  it('--describe with a valid .md but no stack signal fails explicitly (no prompt)', () => {
    tmpDir = makeTmpDir()
    writeFileSync(join(tmpDir, 'vague.md'), '# Ideia\n\nUm projeto sobre coisas legais, sem detalhes técnicos.\n')
    const result = runCLI(['init', '--describe=vague.md'], { cwd: tmpDir })
    expect(result.status).toBe(1)
    expect(stripAnsi(result.stderr + result.stdout)).toMatch(/não consegui inferir a stack/i)
  })

  it('installs the /readiness command on init', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })
    expect(existsSync(join(tmpDir, '.claude/commands/readiness.md'))).toBe(true)
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

  it('adds new agent command files introduced by an upgrade', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })

    // simula um projeto instalado numa versão anterior (sem os agentes novos)
    for (const f of ['privacy.md', 'maestro.md', 'reporter.md']) {
      rmSync(join(tmpDir, '.claude', 'commands', f), { force: true })
    }

    runCLI(['update'], { cwd: tmpDir })

    for (const f of ['privacy.md', 'maestro.md', 'reporter.md']) {
      expect(existsSync(join(tmpDir, '.claude', 'commands', f))).toBe(true)
    }
  })

  it('refreshes CLAUDE.md managed sections while preserving user PROJECT DOCUMENTATION', () => {
    tmpDir = makeTmpDir()
    runCLI(['init', '--stack=node-typescript'], { cwd: tmpDir })

    const claudePath = join(tmpDir, 'CLAUDE.md')
    const userDoc = 'Minha doc do projeto: endpoints internos X, Y, Z.'
    // usuário adiciona conteúdo próprio e simula um CLAUDE.md de versão antiga
    let s = readFileSync(claudePath, 'utf-8') + '\n\n' + userDoc + '\n'
    s = s.replace(/## Privacidade[\s\S]*?(?=\n## )/, '')
    writeFileSync(claudePath, s, 'utf-8')
    expect(readFileSync(claudePath, 'utf-8')).not.toContain('Privacidade')

    runCLI(['update'], { cwd: tmpDir })

    const after = readFileSync(claudePath, 'utf-8')
    expect(after).toContain('Privacidade')       // seção gerenciada restaurada
    expect(after).toContain('/privacy')           // comando novo na tabela
    expect(after).toContain(userDoc)              // doc do usuário preservada
    expect(after).not.toContain('{{')             // sem placeholders órfãos
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
