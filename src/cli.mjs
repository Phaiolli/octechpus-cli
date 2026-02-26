#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const VERSION = '1.0.0'
const TEMPLATES_DIR = join(__dirname, 'templates')

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`
const bold = (text) => c('bold', text)

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function printBanner() {
  console.log('')
  console.log(c('cyan', '  🐙 ═══════════════════════════════════════════'))
  console.log(c('cyan', '     OCTECHPUS — Agent Orchestrator System'))
  console.log(c('cyan', `     v${VERSION}`))
  console.log(c('cyan', '  ═══════════════════════════════════════════════'))
  console.log('')
}

function printHelp() {
  printBanner()
  console.log(`  ${bold('Usage:')}`)
  console.log(`    octechpus ${c('green', '<command>')} [options]`)
  console.log('')
  console.log(`  ${bold('Commands:')}`)
  console.log(`    ${c('green', 'init')}        Setup Octechpus in current project`)
  console.log(`    ${c('green', 'init')} ${c('dim', '<path>')}  Setup Octechpus in specified directory`)
  console.log(`    ${c('green', 'status')}      Check Octechpus setup in current project`)
  console.log(`    ${c('green', 'doctor')}      Diagnose issues with current setup`)
  console.log(`    ${c('green', 'update')}      Update agent commands to latest version`)
  console.log(`    ${c('green', 'help')}        Show this help message`)
  console.log('')
  console.log(`  ${bold('Options:')}`)
  console.log(`    ${c('yellow', '--force')}     Overwrite existing files without asking`)
  console.log(`    ${c('yellow', '--minimal')}   Only install .claude/commands (no docs, no github templates)`)
  console.log(`    ${c('yellow', '--dry-run')}   Show what would be created without writing files`)
  console.log('')
  console.log(`  ${bold('Examples:')}`)
  console.log(`    ${c('dim', 'npx octechpus init')}`)
  console.log(`    ${c('dim', 'npx octechpus init ./my-project')}`)
  console.log(`    ${c('dim', 'npx octechpus init --force')}`)
  console.log(`    ${c('dim', 'npx octechpus status')}`)
  console.log('')
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function fileCreated(filepath, dryRun) {
  const rel = filepath.replace(process.cwd() + '/', '')
  if (dryRun) {
    console.log(`  ${c('yellow', '○')} ${c('dim', 'would create')} ${rel}`)
  } else {
    console.log(`  ${c('green', '✓')} ${rel}`)
  }
}

function fileSkipped(filepath, reason) {
  const rel = filepath.replace(process.cwd() + '/', '')
  console.log(`  ${c('yellow', '⊘')} ${rel} ${c('dim', `(${reason})`)}`)
}

function fileExists(filepath) {
  const rel = filepath.replace(process.cwd() + '/', '')
  console.log(`  ${c('blue', '●')} ${rel} ${c('dim', '(already exists)')}`)
}

function loadTemplate(name) {
  const filepath = join(TEMPLATES_DIR, name)
  if (!existsSync(filepath)) {
    console.error(c('red', `  ✗ Template not found: ${name}`))
    process.exit(1)
  }
  return readFileSync(filepath, 'utf-8')
}

function writeFile(filepath, content, options = {}) {
  const { force = false, dryRun = false } = options

  if (dryRun) {
    fileCreated(filepath, true)
    return true
  }

  if (existsSync(filepath) && !force) {
    return false // caller handles skip/merge
  }

  ensureDir(dirname(filepath))
  writeFileSync(filepath, content, 'utf-8')
  fileCreated(filepath, false)
  return true
}

// ═══════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════

async function commandInit(targetDir, options = {}) {
  const { force = false, minimal = false, dryRun = false } = options

  printBanner()

  const projectDir = resolve(targetDir)
  const isExistingProject = existsSync(join(projectDir, 'package.json')) ||
                             existsSync(join(projectDir, '.git')) ||
                             existsSync(join(projectDir, 'CLAUDE.md'))

  if (isExistingProject) {
    console.log(`  ${c('blue', 'ℹ')} Existing project detected at ${c('cyan', projectDir)}`)
    console.log(`  ${c('blue', 'ℹ')} Installing Octechpus into existing project...`)
  } else {
    console.log(`  ${c('blue', 'ℹ')} Setting up Octechpus at ${c('cyan', projectDir)}`)
  }
  console.log('')

  // Track what we create
  let created = 0
  let skipped = 0
  let existed = 0

  // ─────────────────────────────────────────────
  // 1. .claude/commands/ (ALWAYS)
  // ─────────────────────────────────────────────
  console.log(bold('  Agent Commands (.claude/commands/)'))

  const commands = ['pipeline', 'audit', 'architect', 'review', 'qa', 'security', 'docs', 'github-issue']

  for (const cmd of commands) {
    const filepath = join(projectDir, '.claude', 'commands', `${cmd}.md`)
    const content = loadTemplate(`commands/${cmd}.md`)

    if (existsSync(filepath) && !force) {
      fileExists(filepath)
      existed++
    } else {
      writeFile(filepath, content, { force: true, dryRun })
      created++
    }
  }
  console.log('')

  // ─────────────────────────────────────────────
  // 2. CLAUDE.md
  // ─────────────────────────────────────────────
  console.log(bold('  Project Config'))

  const claudeMdPath = join(projectDir, 'CLAUDE.md')
  const claudeMdContent = loadTemplate('CLAUDE.md')

  if (existsSync(claudeMdPath)) {
    if (force) {
      writeFile(claudeMdPath, claudeMdContent, { force: true, dryRun })
      created++
    } else {
      // Append Octechpus section to existing CLAUDE.md
      if (!dryRun) {
        const existing = readFileSync(claudeMdPath, 'utf-8')
        if (existing.includes('OCTECHPUS')) {
          fileExists(claudeMdPath)
          existed++
        } else {
          const merged = claudeMdContent + '\n\n---\n\n' +
            '# EXISTING PROJECT DOCUMENTATION\n\n' +
            '> The content below was preserved from your original CLAUDE.md\n\n' +
            existing
          writeFileSync(claudeMdPath, merged, 'utf-8')
          console.log(`  ${c('green', '✓')} CLAUDE.md ${c('dim', '(merged with existing)')}`)
          created++
        }
      } else {
        console.log(`  ${c('yellow', '○')} ${c('dim', 'would merge')} CLAUDE.md`)
        created++
      }
    }
  } else {
    writeFile(claudeMdPath, claudeMdContent, { dryRun })
    created++
  }
  console.log('')

  if (!minimal) {
    // ─────────────────────────────────────────────
    // 3. docs/
    // ─────────────────────────────────────────────
    console.log(bold('  Documentation'))

    const docsFiles = {
      'docs/AGENTS.md': 'docs/AGENTS.md',
    }

    for (const [target, template] of Object.entries(docsFiles)) {
      const filepath = join(projectDir, target)
      if (existsSync(filepath) && !force) {
        fileExists(filepath)
        existed++
      } else {
        writeFile(filepath, loadTemplate(template), { force, dryRun })
        created++
      }
    }

    // Create docs/adr/ directory
    const adrDir = join(projectDir, 'docs', 'adr')
    if (!existsSync(adrDir)) {
      if (!dryRun) {
        ensureDir(adrDir)
        writeFile(join(adrDir, '.gitkeep'), '', { dryRun })
      } else {
        console.log(`  ${c('yellow', '○')} ${c('dim', 'would create')} docs/adr/`)
      }
      created++
    }

    // CHANGELOG.md
    const changelogPath = join(projectDir, 'CHANGELOG.md')
    if (!existsSync(changelogPath)) {
      writeFile(changelogPath, loadTemplate('CHANGELOG.md'), { dryRun })
      created++
    } else {
      fileExists(changelogPath)
      existed++
    }
    console.log('')

    // ─────────────────────────────────────────────
    // 4. .github/ templates
    // ─────────────────────────────────────────────
    console.log(bold('  GitHub Templates'))

    const githubFiles = {
      '.github/ISSUE_TEMPLATE/feature.md': 'github/ISSUE_TEMPLATE/feature.md',
      '.github/ISSUE_TEMPLATE/bug.md': 'github/ISSUE_TEMPLATE/bug.md',
      '.github/ISSUE_TEMPLATE/refactor.md': 'github/ISSUE_TEMPLATE/refactor.md',
      '.github/PULL_REQUEST_TEMPLATE.md': 'github/PULL_REQUEST_TEMPLATE.md',
    }

    for (const [target, template] of Object.entries(githubFiles)) {
      const filepath = join(projectDir, target)
      if (existsSync(filepath) && !force) {
        fileExists(filepath)
        existed++
      } else {
        writeFile(filepath, loadTemplate(template), { force, dryRun })
        created++
      }
    }
    console.log('')
  }

  // ─────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────
  console.log(c('cyan', '  ═══════════════════════════════════════════════'))
  console.log('')
  if (dryRun) {
    console.log(`  ${c('yellow', 'DRY RUN')} — No files were written`)
    console.log(`  Would create: ${c('green', created)} files`)
    console.log(`  Already exist: ${c('blue', existed)} files`)
  } else {
    console.log(`  ${c('green', '✓')} Octechpus installed successfully!`)
    console.log(`  Created: ${c('green', created)} files | Existing: ${c('blue', existed)} files`)
  }
  console.log('')
  console.log(`  ${bold('Available commands in Claude Code:')}`)
  console.log(`    ${c('green', '/pipeline')} ${c('dim', '[demanda]')}    — Full agent pipeline`)
  console.log(`    ${c('green', '/audit')} ${c('dim', '[escopo?]')}      — Full project audit`)
  console.log(`    ${c('green', '/review')} ${c('dim', '[escopo]')}      — Code review`)
  console.log(`    ${c('green', '/security')} ${c('dim', '[escopo]')}    — Security audit`)
  console.log(`    ${c('green', '/qa')} ${c('dim', '[escopo]')}          — Create tests`)
  console.log(`    ${c('green', '/architect')} ${c('dim', '[escopo]')}   — Architecture analysis`)
  console.log(`    ${c('green', '/docs')} ${c('dim', '[escopo]')}        — Documentation`)
  console.log(`    ${c('green', '/github-issue')} ${c('dim', '[demanda]')} — GitHub issue`)
  console.log('')
  console.log(`  ${c('dim', 'Open Claude Code and try:')} ${c('cyan', '/audit')}`)
  console.log('')
}

function commandStatus(targetDir) {
  printBanner()

  const projectDir = resolve(targetDir)
  console.log(`  ${bold('Project:')} ${c('cyan', projectDir)}`)
  console.log('')

  const checks = [
    { path: '.claude/commands/pipeline.md', label: 'Pipeline command', critical: true },
    { path: '.claude/commands/audit.md', label: 'Audit command', critical: true },
    { path: '.claude/commands/architect.md', label: 'Architect command', critical: false },
    { path: '.claude/commands/review.md', label: 'Review command', critical: false },
    { path: '.claude/commands/qa.md', label: 'QA command', critical: false },
    { path: '.claude/commands/security.md', label: 'Security command', critical: false },
    { path: '.claude/commands/docs.md', label: 'Docs command', critical: false },
    { path: '.claude/commands/github-issue.md', label: 'GitHub Issue command', critical: false },
    { path: 'CLAUDE.md', label: 'CLAUDE.md config', critical: true },
    { path: 'docs/AGENTS.md', label: 'Agents reference', critical: false },
    { path: 'docs/adr', label: 'ADR directory', critical: false },
    { path: 'CHANGELOG.md', label: 'Changelog', critical: false },
    { path: '.github/ISSUE_TEMPLATE', label: 'Issue templates', critical: false },
    { path: '.github/PULL_REQUEST_TEMPLATE.md', label: 'PR template', critical: false },
  ]

  let ok = 0
  let missing = 0
  let criticalMissing = 0

  for (const check of checks) {
    const filepath = join(projectDir, check.path)
    if (existsSync(filepath)) {
      console.log(`  ${c('green', '✓')} ${check.label}`)
      ok++
    } else {
      const icon = check.critical ? c('red', '✗') : c('yellow', '○')
      console.log(`  ${icon} ${check.label} ${c('dim', '(missing)')}`)
      missing++
      if (check.critical) criticalMissing++
    }
  }

  console.log('')

  if (missing === 0) {
    console.log(`  ${c('green', '✓ Octechpus is fully configured!')}`)
  } else if (criticalMissing > 0) {
    console.log(`  ${c('red', `✗ ${criticalMissing} critical file(s) missing.`)} Run ${c('cyan', 'npx octechpus init')} to fix.`)
  } else {
    console.log(`  ${c('yellow', `○ ${missing} optional file(s) missing.`)} Run ${c('cyan', 'npx octechpus init')} to complete setup.`)
  }
  console.log('')
}

async function commandDoctor(targetDir) {
  printBanner()

  const projectDir = resolve(targetDir)
  console.log(`  ${bold('Diagnosing:')} ${c('cyan', projectDir)}`)
  console.log('')

  let issues = 0

  // Check CLAUDE.md has Octechpus section
  const claudeMdPath = join(projectDir, 'CLAUDE.md')
  if (existsSync(claudeMdPath)) {
    const content = readFileSync(claudeMdPath, 'utf-8')
    if (!content.includes('OCTECHPUS') && !content.includes('octechpus') && !content.includes('Octechpus')) {
      console.log(`  ${c('yellow', '⚠')} CLAUDE.md exists but missing Octechpus section`)
      console.log(`    ${c('dim', 'Run')} ${c('cyan', 'npx octechpus init')} ${c('dim', 'to merge')}`)
      issues++
    } else {
      console.log(`  ${c('green', '✓')} CLAUDE.md has Octechpus config`)
    }
  } else {
    console.log(`  ${c('red', '✗')} CLAUDE.md not found`)
    issues++
  }

  // Check commands directory
  const commandsDir = join(projectDir, '.claude', 'commands')
  if (existsSync(commandsDir)) {
    const files = readdirSync(commandsDir).filter(f => f.endsWith('.md'))
    const expected = ['pipeline', 'audit', 'architect', 'review', 'qa', 'security', 'docs', 'github-issue']
    const missing = expected.filter(cmd => !files.includes(`${cmd}.md`))

    if (missing.length === 0) {
      console.log(`  ${c('green', '✓')} All ${expected.length} agent commands present`)
    } else {
      console.log(`  ${c('yellow', '⚠')} Missing commands: ${missing.join(', ')}`)
      issues++
    }
  } else {
    console.log(`  ${c('red', '✗')} .claude/commands/ directory not found`)
    issues++
  }

  // Check for common issues
  const gitDir = join(projectDir, '.git')
  if (!existsSync(gitDir)) {
    console.log(`  ${c('yellow', '⚠')} Not a git repository — GitHub agent won't work`)
    issues++
  } else {
    console.log(`  ${c('green', '✓')} Git repository detected`)
  }

  // Check if gh CLI is available
  try {
    execSync('gh --version', { stdio: 'pipe' })
    console.log(`  ${c('green', '✓')} GitHub CLI (gh) available`)
  } catch {
    console.log(`  ${c('yellow', '⚠')} GitHub CLI (gh) not found — install from https://cli.github.com`)
    issues++
  }

  console.log('')
  if (issues === 0) {
    console.log(`  ${c('green', '✓ All checks passed!')}`)
  } else {
    console.log(`  ${c('yellow', `⚠ ${issues} issue(s) found`)}`)
  }
  console.log('')
}

async function commandUpdate(targetDir, options = {}) {
  const { force = false, dryRun = false } = options

  printBanner()

  const projectDir = resolve(targetDir)
  const commandsDir = join(projectDir, '.claude', 'commands')

  if (!existsSync(commandsDir)) {
    console.log(`  ${c('red', '✗')} Octechpus not installed. Run ${c('cyan', 'npx octechpus init')} first.`)
    console.log('')
    return
  }

  console.log(`  ${c('blue', 'ℹ')} Updating agent commands...`)
  console.log('')

  const commands = ['pipeline', 'audit', 'architect', 'review', 'qa', 'security', 'docs', 'github-issue']
  let updated = 0

  for (const cmd of commands) {
    const filepath = join(commandsDir, `${cmd}.md`)
    const content = loadTemplate(`commands/${cmd}.md`)
    writeFile(filepath, content, { force: true, dryRun })
    updated++
  }

  // Also update AGENTS.md
  const agentsPath = join(projectDir, 'docs', 'AGENTS.md')
  if (existsSync(join(projectDir, 'docs'))) {
    writeFile(agentsPath, loadTemplate('docs/AGENTS.md'), { force: true, dryRun })
    updated++
  }

  console.log('')
  console.log(`  ${c('green', `✓ Updated ${updated} files`)}`)
  console.log(`  ${c('dim', 'Note: CLAUDE.md was NOT modified. Edit it manually if needed.')}`)
  console.log('')
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2)
const command = args.find(a => !a.startsWith('-')) || 'help'
const flags = args.filter(a => a.startsWith('-'))

const options = {
  force: flags.includes('--force'),
  minimal: flags.includes('--minimal'),
  dryRun: flags.includes('--dry-run'),
}

// Target directory: either specified path or current directory
const targetArg = args.find(a => !a.startsWith('-') && a !== command)
const targetDir = targetArg || process.cwd()

switch (command) {
  case 'init':
    await commandInit(targetDir, options)
    break
  case 'status':
    commandStatus(targetDir)
    break
  case 'doctor':
    await commandDoctor(targetDir)
    break
  case 'update':
    await commandUpdate(targetDir, options)
    break
  case 'help':
  case '--help':
  case '-h':
    printHelp()
    break
  case 'version':
  case '--version':
  case '-v':
    console.log(`octechpus v${VERSION}`)
    break
  default:
    console.log(c('red', `  Unknown command: ${command}`))
    console.log(`  Run ${c('cyan', 'npx octechpus help')} for usage`)
    process.exit(1)
}
