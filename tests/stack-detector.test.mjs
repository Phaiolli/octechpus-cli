import { describe, it, expect, afterEach } from 'vitest'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { detectStack } from '../src/lib/stack-detector.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixtures = join(__dirname, 'fixtures')

function makeDir(files) {
  const dir = mkdtempSync(join(tmpdir(), 'octechpus-det-'))
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content)
  }
  return dir
}

describe('detectStack — python-project', () => {
  it('detects python-fastapi with high confidence', () => {
    const result = detectStack(join(fixtures, 'python-project'))
    expect(result.best.name).toBe('python-fastapi')
    expect(result.best.confidenceLabel).toBe('high')
    expect(result.best.evidence.some(e => e.includes('fastapi'))).toBe(true)
  })
})

describe('detectStack — nodejs-project', () => {
  it('detects nextjs-react with high confidence', () => {
    const result = detectStack(join(fixtures, 'nodejs-project'))
    expect(result.best.name).toBe('nextjs-react')
    expect(result.best.confidenceLabel).toBe('high')
  })
})

describe('detectStack — empty-project', () => {
  it('returns confidence none for a project with no stack signals', () => {
    const result = detectStack(join(fixtures, 'empty-project'))
    expect(result.best.confidenceLabel).toBe('none')
    expect(result.candidates).toHaveLength(0)
  })
})

describe('detectStack — python-ai-project', () => {
  it('detects python-ai-pipeline when fastapi + anthropic are both present', () => {
    const result = detectStack(join(fixtures, 'python-ai-project'))
    expect(result.best.name).toBe('python-ai-pipeline')
    expect(result.best.confidenceLabel).toBe('high')
  })
})

describe('detectStack — new stacks', () => {
  let dir
  afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }) })

  it('plain JS (package.json, no TypeScript) → node-javascript over node-typescript', () => {
    dir = makeDir({ 'package.json': JSON.stringify({ name: 'x', dependencies: { express: '^4' } }) })
    const r = detectStack(dir)
    expect(r.best.name).toBe('node-javascript')
  })

  it('Java Spring (pom.xml with spring) → java-spring', () => {
    dir = makeDir({ 'pom.xml': '<project><dependencies>spring-boot-starter-web</dependencies></project>' })
    const r = detectStack(dir)
    expect(r.best.name).toBe('java-spring')
  })

  it('.NET (.csproj) → dotnet-api', () => {
    dir = makeDir({ 'App.csproj': '<Project Sdk="Microsoft.NET.Sdk.Web"></Project>' })
    const r = detectStack(dir)
    expect(r.best.name).toBe('dotnet-api')
  })

  it('Rails (Gemfile with rails) → ruby-rails', () => {
    dir = makeDir({ 'Gemfile': "source 'https://rubygems.org'\ngem 'rails', '~> 7.1'\n" })
    const r = detectStack(dir)
    expect(r.best.name).toBe('ruby-rails')
  })

  it('Laravel (composer.json with laravel/*) → php-laravel', () => {
    dir = makeDir({ 'composer.json': JSON.stringify({ require: { 'laravel/framework': '^11' } }) })
    const r = detectStack(dir)
    expect(r.best.name).toBe('php-laravel')
  })

  it('React Native (package.json with react-native) → react-native', () => {
    dir = makeDir({ 'package.json': JSON.stringify({ name: 'x', dependencies: { 'react-native': '0.74' } }) })
    const r = detectStack(dir)
    expect(r.best.name).toBe('react-native')
  })

  it('Nuxt (nuxt dependency) → vue-nuxt', () => {
    dir = makeDir({ 'package.json': JSON.stringify({ name: 'x', dependencies: { nuxt: '^3' } }) })
    const r = detectStack(dir)
    expect(r.best.name).toBe('vue-nuxt')
  })
})

describe('detectStack — from a markdown project doc', () => {
  let dir
  afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }) })

  it('detects python-fastapi from a README (no manifests) with high confidence', () => {
    dir = makeDir({ 'README.md': '# Faturas\nAPI em FastAPI com Pydantic v2 e uvicorn.' })
    const r = detectStack(dir)
    expect(r.best.name).toBe('python-fastapi')
    expect(r.best.confidenceLabel).toBe('high')
    expect(r.best.evidence.some(e => e.includes('doc .md'))).toBe(true)
  })

  it('detects nextjs-react from a PROJECT.md description', () => {
    dir = makeDir({ 'PROJECT.md': '# Painel\nFrontend em Next.js + React + TypeScript com Tailwind e shadcn/ui.' })
    const r = detectStack(dir)
    expect(r.best.name).toBe('nextjs-react')
  })

  it('honors the describeFile option for a non-standard doc name', () => {
    dir = makeDir({ 'arquitetura.md': '# Arq\nApp em Ruby on Rails com RSpec.' })
    // não é um nome de overview reconhecido → só detecta via describeFile
    expect(detectStack(dir).best.name).toBe(null)
    expect(detectStack(dir, { describeFile: 'arquitetura.md' }).best.name).toBe('ruby-rails')
  })

  it('returns no candidates for a README without tech keywords', () => {
    dir = makeDir({ 'README.md': '# Projeto\nUm documento sem menção a tecnologias.' })
    const r = detectStack(dir)
    expect(r.candidates).toHaveLength(0)
  })

  it('a manifest still outranks prose (package.json + README mentioning Python)', () => {
    dir = makeDir({
      'package.json': JSON.stringify({ name: 'x', dependencies: { next: '^14' } }),
      'README.md': '# X\nMencionamos FastAPI e Django no histórico, mas é Next.js.',
    })
    const r = detectStack(dir)
    expect(r.best.name).toBe('nextjs-react')
  })
})

describe('detectStack — ambiguous-project', () => {
  it('returns multiple candidates when both package.json and pyproject.toml exist', () => {
    const result = detectStack(join(fixtures, 'ambiguous-project'))
    const names = result.candidates.map(c => c.name)
    expect(names.length).toBeGreaterThan(1)
    // Both Node and Python stacks should be present
    const hasNode = names.some(n => n.startsWith('node') || n.startsWith('nextjs'))
    const hasPython = names.some(n => n.startsWith('python'))
    expect(hasNode).toBe(true)
    expect(hasPython).toBe(true)
  })
})
