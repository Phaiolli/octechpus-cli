#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createHash } from 'crypto'
import { c, bold, printBanner, ask } from './lib/prompts.mjs'
import { ensureDir, writeFile, copyDir, fileExists, fileCreated, fileSkipped } from './lib/file-ops.mjs'
import { listProfiles, resolveProfile, validateProfile } from './lib/profile-loader.mjs'
import { renderTemplate } from './lib/template-renderer.mjs'
import { detectStack } from './lib/stack-detector.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const VERSION = '2.1.0'
const TEMPLATES_DIR = join(__dirname, 'templates')
const DESIGN_SYSTEM_TEMPLATES_DIR = join(TEMPLATES_DIR, 'design-system')
const MANIFEST_PATH = '.octechpus/manifest.json'

// Templates that receive {{stack.xxx}} placeholder rendering
const RENDERED_TEMPLATES = new Set([
  'CLAUDE.md',
  'commands/pipeline.md', 'commands/architect.md', 'commands/coder.md',
  'commands/review.md', 'commands/qa.md', 'commands/security.md',
  'commands/docs.md', 'commands/github-issue.md', 'commands/profiler.md',
  'commands/design.md', 'commands/cost-engineer.md', 'commands/audit.md',
])

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function printHelp() {
  printBanner(VERSION)
  console.log(`  ${bold('Usage:')}`)
  console.log(`    octechpus ${c('green', '<command>')} [options]`)
  console.log('')
  console.log(`  ${bold('Commands:')}`)
  console.log(`    ${c('green', 'init')}                          Setup Octechpus (auto-detect stack)`)
  console.log(`    ${c('green', 'init --stack=<profile>')}        Setup with explicit stack profile`)
  console.log(`    ${c('green', 'status')}                        Check current setup and profile`)
  console.log(`    ${c('green', 'doctor')}                        Diagnose issues, check for drift`)
  console.log(`    ${c('green', 'update')}                        Update commands (preserves customizations)`)
  console.log(`    ${c('green', 'profile list')}                  List available stack profiles`)
  console.log(`    ${c('green', 'profile show <name>')}           Show resolved profile (after inheritance)`)
  console.log(`    ${c('green', 'profile current')}               Show active profile of current project`)
  console.log(`    ${c('green', 'profile switch <name>')}         Switch project to a different profile`)
  console.log(`    ${c('green', 'design-system add')}             Add design system to project`)
  console.log(`    ${c('green', 'design-system update')}          Sync design-system/ with latest`)
  console.log(`    ${c('green', 'help')}                          Show this message`)
  console.log('')
  console.log(`  ${bold('Options:')}`)
  console.log(`    ${c('yellow', '--stack=<name>')}         Explicit profile (skips auto-detection)`)
  console.log(`    ${c('yellow', '--force')}                Overwrite without asking`)
  console.log(`    ${c('yellow', '--minimal')}              Only .claude/commands (no docs, no github)`)
  console.log(`    ${c('yellow', '--dry-run')}              Preview without writing`)
  console.log(`    ${c('yellow', '--with-design-system')}   Include Designer + design-system/`)
  console.log(`    ${c('yellow', '--keep-customizations')}  Update preserves edited files ${c('dim', '(default: true)')}`)
  console.log('')
  console.log(`  ${bold('Examples:')}`)
  console.log(`    ${c('dim', 'npx octechpus init')}`)
  console.log(`    ${c('dim', 'npx octechpus init --stack=python-fastapi')}`)
  console.log(`    ${c('dim', 'npx octechpus init --stack=nextjs-react')}`)
  console.log(`    ${c('dim', 'npx octechpus profile list')}`)
  console.log(`    ${c('dim', 'npx octechpus profile switch python-ai-pipeline')}`)
  console.log(`    ${c('dim', 'npx octechpus status')}`)
  console.log(`    ${c('dim', 'npx octechpus update')}`)
  console.log('')
}

function loadTemplate(name) {
  const filepath = join(TEMPLATES_DIR, name)
  if (!existsSync(filepath)) {
    console.error(c('red', `  ✗ Template not found: ${name}`))
    process.exit(1)
  }
  return readFileSync(filepath, 'utf-8')
}

function loadRenderedTemplate(name, profile) {
  const raw = loadTemplate(name)
  if (!profile || !RENDERED_TEMPLATES.has(name)) return raw
  return renderTemplate(raw, profile, { strict: false })
}

function computeHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 16)
}

function readManifest(projectDir) {
  const path = join(projectDir, MANIFEST_PATH)
  if (!existsSync(path)) return null
  try { return JSON.parse(readFileSync(path, 'utf-8')) } catch { return null }
}

function writeManifest(projectDir, data) {
  const path = join(projectDir, MANIFEST_PATH)
  ensureDir(dirname(path))
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
}

function getCurrentProfile(projectDir) {
  const manifest = readManifest(projectDir)
  if (manifest?.profile) {
    try { return resolveProfile(manifest.profile) } catch { /* stale manifest */ }
  }
  const claudeMdPath = join(projectDir, 'CLAUDE.md')
  if (existsSync(claudeMdPath)) {
    const match = readFileSync(claudeMdPath, 'utf-8').match(/\*\*Profile:\*\*\s+(\S+)/)
    if (match) {
      try { return resolveProfile(match[1]) } catch { /* unknown profile */ }
    }
  }
  return null
}

function getActiveCommands(profile, includeDesign = false) {
  const cmds = ['pipeline', 'audit', 'architect', 'coder', 'review', 'qa', 'security', 'docs', 'github-issue', 'profiler']
  if (profile?.agents?.designer || includeDesign) cmds.push('design')
  if (profile?.agents?.cost_engineer) cmds.push('cost-engineer')
  return cmds
}

async function selectProfile(projectDir, stackFlag, { askFn = ask } = {}) {
  if (stackFlag) {
    try {
      const resolved = resolveProfile(stackFlag)
      validateProfile(resolved)
      console.log(`  ${c('blue', 'ℹ')} Using profile: ${c('cyan', stackFlag)}`)
      return resolved
    } catch {
      const available = listProfiles().map(p => p.name).join(', ')
      console.error(c('red', `  ✗ Profile not found: "${stackFlag}"`))
      console.error(c('dim', `  Available: ${available}`))
      process.exit(1)
    }
  }

  const { candidates, best } = detectStack(projectDir)

  if (best.confidenceLabel === 'high') {
    const evidence = best.evidence.filter(Boolean).slice(0, 2).join(', ')
    console.log(`  ${c('green', '✓')} Stack detected: ${c('cyan', best.name)} (confidence: high)`)
    if (evidence) console.log(`  ${c('dim', `Evidence: ${evidence}`)}`)
    console.log('')
    return resolveProfile(best.name)
  }

  if (best.confidenceLabel === 'medium') {
    const evidence = best.evidence.filter(Boolean).slice(0, 2).join(', ')
    console.log(`  ${c('yellow', '?')} Probable stack: ${c('cyan', best.name)} (confidence: medium)`)
    if (evidence) console.log(`  ${c('dim', `Evidence: ${evidence}`)}`)
    console.log('')
    const answer = await askFn(`  Apply ${bold(best.name)} profile? (Y/n): `)
    if (!answer || answer === 'y' || answer === 'yes') {
      return resolveProfile(best.name)
    }
    console.log('')
    // fall through to manual selection
  }

  const profiles = listProfiles()

  if (best.confidenceLabel === 'low' && candidates.length > 0) {
    console.log(`  ${c('yellow', '○')} Candidates detected (low confidence):`)
    candidates.slice(0, 3).forEach((cand, i) => {
      console.log(`    ${c('dim', `${i + 1}.`)} ${c('cyan', cand.name)}`)
    })
    console.log('')
  } else {
    console.log(`  ${c('yellow', '?')} Could not auto-detect stack.`)
  }

  console.log(`  ${c('blue', 'ℹ')} Available profiles:`)
  profiles.forEach((p, i) => {
    console.log(`    ${c('dim', `${i + 1}.`)} ${c('cyan', p.name.padEnd(26))} ${c('dim', p.description || '')}`)
  })
  console.log('')

  const answer = await askFn(`  Select profile (name or 1-${profiles.length}): `)
  const trimmed = answer.trim()
  const num = parseInt(trimmed, 10)
  const profileName = !isNaN(num) && num >= 1 && num <= profiles.length
    ? profiles[num - 1].name
    : trimmed

  if (!profileName) {
    console.error(c('red', '  ✗ No profile selected.'))
    process.exit(1)
  }

  try {
    return resolveProfile(profileName)
  } catch {
    console.error(c('red', `  ✗ Unknown profile: "${profileName}"`))
    process.exit(1)
  }
}

// ═══════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════

async function commandInit(targetDir, options = {}) {
  const {
    force = false, minimal = false, dryRun = false,
    withDesignSystem = false, stack = null, askFn = ask,
  } = options

  printBanner(VERSION)

  const projectDir = resolve(targetDir)
  const isExistingProject = existsSync(join(projectDir, 'package.json')) ||
                             existsSync(join(projectDir, '.git')) ||
                             existsSync(join(projectDir, 'CLAUDE.md'))

  if (isExistingProject) {
    console.log(`  ${c('blue', 'ℹ')} Existing project detected at ${c('cyan', projectDir)}`)
    console.log(`  ${c('blue', 'ℹ')} Installing Octechpus...`)
  } else {
    console.log(`  ${c('blue', 'ℹ')} Setting up Octechpus at ${c('cyan', projectDir)}`)
  }
  console.log('')

  const profile = await selectProfile(projectDir, stack, { askFn })
  console.log(`  ${c('green', '✓')} Profile: ${c('cyan', profile.name)}`)
  console.log('')

  let created = 0
  let existed = 0
  const manifestFiles = {}

  // ─────────────────────────────────────────────
  // 1. .claude/commands/
  // ─────────────────────────────────────────────
  console.log(bold('  Agent Commands (.claude/commands/)'))

  const commands = getActiveCommands(profile, withDesignSystem)

  for (const cmd of commands) {
    const filepath = join(projectDir, '.claude', 'commands', `${cmd}.md`)
    const content = loadRenderedTemplate(`commands/${cmd}.md`, profile)
    const relPath = `.claude/commands/${cmd}.md`

    if (existsSync(filepath) && !force) {
      fileExists(filepath)
      existed++
    } else {
      writeFile(filepath, content, { force: true, dryRun })
      created++
      if (!dryRun) manifestFiles[relPath] = computeHash(content)
    }
  }
  console.log('')

  // ─────────────────────────────────────────────
  // 2. CLAUDE.md
  // ─────────────────────────────────────────────
  console.log(bold('  Project Config'))

  const claudeMdPath = join(projectDir, 'CLAUDE.md')
  const claudeMdContent = loadRenderedTemplate('CLAUDE.md', profile)

  if (existsSync(claudeMdPath)) {
    if (force) {
      writeFile(claudeMdPath, claudeMdContent, { force: true, dryRun })
      created++
      if (!dryRun) manifestFiles['CLAUDE.md'] = computeHash(claudeMdContent)
    } else {
      if (!dryRun) {
        const existing = readFileSync(claudeMdPath, 'utf-8')
        if (existing.includes('OCTECHPUS')) {
          fileExists(claudeMdPath)
          existed++
        } else {
          const merged = claudeMdContent + '\n\n---\n\n# EXISTING PROJECT DOCUMENTATION\n\n' +
            '> The content below was preserved from your original CLAUDE.md\n\n' + existing
          writeFileSync(claudeMdPath, merged, 'utf-8')
          console.log(`  ${c('green', '✓')} CLAUDE.md ${c('dim', '(merged with existing)')}`)
          created++
          manifestFiles['CLAUDE.md'] = computeHash(merged)
        }
      } else {
        console.log(`  ${c('yellow', '○')} ${c('dim', 'would merge')} CLAUDE.md`)
        created++
      }
    }
  } else {
    writeFile(claudeMdPath, claudeMdContent, { dryRun })
    created++
    if (!dryRun) manifestFiles['CLAUDE.md'] = computeHash(claudeMdContent)
  }
  console.log('')

  if (!minimal) {
    // ─────────────────────────────────────────────
    // 3. docs/
    // ─────────────────────────────────────────────
    console.log(bold('  Documentation'))

    const agentsPath = join(projectDir, 'docs', 'OCTECHPUS_AGENTS.md')
    if (existsSync(agentsPath) && !force) {
      fileExists(agentsPath)
      existed++
    } else {
      writeFile(agentsPath, loadTemplate('docs/OCTECHPUS_AGENTS.md'), { force, dryRun })
      created++
    }

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

  if (withDesignSystem || profile.agents?.designer) {
    console.log(bold('  Design System (design-system/)'))
    const destDesignSystem = join(projectDir, 'design-system')
    copyDir(DESIGN_SYSTEM_TEMPLATES_DIR, destDesignSystem, { force, dryRun })
    created++
    console.log('')
  }

  // ─────────────────────────────────────────────
  // Manifest
  // ─────────────────────────────────────────────
  if (!dryRun && Object.keys(manifestFiles).length > 0) {
    writeManifest(projectDir, {
      version: VERSION,
      profile: profile.name,
      installedAt: new Date().toISOString(),
      files: manifestFiles,
    })
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
    console.log(`  ${c('green', '✓')} Octechpus installed! Profile: ${c('cyan', profile.name)}`)
    console.log(`  Created: ${c('green', created)} files | Existing: ${c('blue', existed)} files`)
  }
  console.log('')
  console.log(`  ${bold('Available commands in Claude Code:')}`)
  console.log(`    ${c('green', '/pipeline')}     — Full agent pipeline`)
  console.log(`    ${c('green', '/audit')}        — Project audit`)
  console.log(`    ${c('green', '/review')}       — Code review`)
  console.log(`    ${c('green', '/security')}     — Security audit`)
  console.log(`    ${c('green', '/qa')}           — Create tests`)
  console.log(`    ${c('green', '/architect')}    — Architecture analysis`)
  console.log(`    ${c('green', '/docs')}         — Documentation`)
  if (profile.agents?.designer) {
    console.log(`    ${c('green', '/design')}       — Design system briefing`)
  }
  if (profile.agents?.cost_engineer) {
    console.log(`    ${c('green', '/cost')}         — Cost audit`)
  }
  console.log('')
  console.log(`  ${c('dim', 'Run')} ${c('cyan', 'npx octechpus status')} ${c('dim', 'to verify setup')}`)
  console.log('')
}

function commandStatus(targetDir) {
  printBanner(VERSION)

  const projectDir = resolve(targetDir)
  console.log(`  ${bold('Project:')} ${c('cyan', projectDir)}`)

  const manifest = readManifest(projectDir)
  if (manifest?.profile) {
    console.log(`  ${bold('Profile:')} ${c('cyan', manifest.profile)}`)

    try {
      const profile = resolveProfile(manifest.profile)
      const active = Object.entries(profile.agents || {}).filter(([, v]) => v).map(([k]) => k)
      const inactive = Object.entries(profile.agents || {}).filter(([, v]) => !v).map(([k]) => k)
      if (active.length) console.log(`  ${bold('Active agents:')} ${active.join(', ')}`)
      if (inactive.length) console.log(`  ${bold('Inactive agents:')} ${c('dim', inactive.join(', '))}`)
    } catch { /* ignore stale manifest */ }

    const { best } = detectStack(projectDir)
    if (best.confidenceLabel === 'high' && best.name !== manifest.profile) {
      console.log(`  ${c('yellow', '⚠')} Drift: declared ${c('cyan', manifest.profile)} but code suggests ${c('cyan', best.name)}`)
      console.log(`  ${c('dim', `Run: npx octechpus profile switch ${best.name}`)}`)
    }
  } else {
    console.log(`  ${bold('Profile:')} ${c('dim', 'none')} — run ${c('cyan', 'npx octechpus init')} to set up`)
  }
  console.log('')

  const checks = [
    { path: '.claude/commands/pipeline.md', label: 'Pipeline command', critical: true },
    { path: '.claude/commands/audit.md', label: 'Audit command', critical: true },
    { path: '.claude/commands/architect.md', label: 'Architect command', critical: false },
    { path: '.claude/commands/coder.md', label: 'Coder command', critical: false },
    { path: '.claude/commands/review.md', label: 'Review command', critical: false },
    { path: '.claude/commands/qa.md', label: 'QA command', critical: false },
    { path: '.claude/commands/security.md', label: 'Security command', critical: false },
    { path: '.claude/commands/docs.md', label: 'Docs command', critical: false },
    { path: '.claude/commands/github-issue.md', label: 'GitHub Issue command', critical: false },
    { path: '.claude/commands/design.md', label: 'Design command (optional)', critical: false },
    { path: 'design-system', label: 'Design system files (optional)', critical: false },
    { path: 'CLAUDE.md', label: 'CLAUDE.md config', critical: true },
    { path: 'docs/OCTECHPUS_AGENTS.md', label: 'Agents reference', critical: false },
    { path: 'docs/adr', label: 'ADR directory', critical: false },
    { path: 'CHANGELOG.md', label: 'Changelog', critical: false },
    { path: '.github/ISSUE_TEMPLATE', label: 'Issue templates', critical: false },
    { path: '.github/PULL_REQUEST_TEMPLATE.md', label: 'PR template', critical: false },
  ]

  let missing = 0
  let criticalMissing = 0

  for (const check of checks) {
    const filepath = join(projectDir, check.path)
    if (existsSync(filepath)) {
      console.log(`  ${c('green', '✓')} ${check.label}`)
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
  printBanner(VERSION)

  const projectDir = resolve(targetDir)
  console.log(`  ${bold('Diagnosing:')} ${c('cyan', projectDir)}`)
  console.log('')

  let issues = 0

  // Profile check
  const manifest = readManifest(projectDir)
  if (manifest?.profile) {
    const { best } = detectStack(projectDir)
    if (best.confidenceLabel === 'high' && best.name !== manifest.profile) {
      console.log(`  ${c('yellow', '⚠')} Profile drift: declared "${manifest.profile}" but detected "${best.name}"`)
      console.log(`    ${c('dim', 'Run')} ${c('cyan', `npx octechpus profile switch ${best.name}`)} ${c('dim', 'to fix')}`)
      issues++
    } else {
      console.log(`  ${c('green', '✓')} Profile (${manifest.profile}) matches detected stack`)
    }
  } else {
    console.log(`  ${c('yellow', '⚠')} No profile set. Run ${c('cyan', 'npx octechpus init')} to initialize`)
    issues++
  }

  // CLAUDE.md check
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

  // Commands check
  const commandsDir = join(projectDir, '.claude', 'commands')
  if (existsSync(commandsDir)) {
    const files = readdirSync(commandsDir).filter(f => f.endsWith('.md'))
    const expected = ['pipeline', 'audit', 'architect', 'review', 'qa', 'security', 'docs', 'github-issue']
    const missing = expected.filter(cmd => !files.includes(`${cmd}.md`))
    if (missing.length === 0) {
      console.log(`  ${c('green', '✓')} All ${expected.length} core agent commands present`)
    } else {
      console.log(`  ${c('yellow', '⚠')} Missing commands: ${missing.join(', ')}`)
      issues++
    }
  } else {
    console.log(`  ${c('red', '✗')} .claude/commands/ directory not found`)
    issues++
  }

  // Git check
  if (!existsSync(join(projectDir, '.git'))) {
    console.log(`  ${c('yellow', '⚠')} Not a git repository — GitHub agent won't work`)
    issues++
  } else {
    console.log(`  ${c('green', '✓')} Git repository detected`)
  }

  // gh CLI check
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
  const { force = false, dryRun = false, keepCustomizations = true } = options

  printBanner(VERSION)

  const projectDir = resolve(targetDir)
  const commandsDir = join(projectDir, '.claude', 'commands')

  if (!existsSync(commandsDir)) {
    console.log(`  ${c('red', '✗')} Octechpus not installed. Run ${c('cyan', 'npx octechpus init')} first.`)
    console.log('')
    return
  }

  const manifest = readManifest(projectDir)
  const profile = getCurrentProfile(projectDir)

  if (profile) {
    console.log(`  ${c('blue', 'ℹ')} Updating with profile: ${c('cyan', profile.name)}`)
  } else {
    console.log(`  ${c('yellow', '⚠')} No profile found — updating without rendering`)
  }
  console.log('')

  const commands = profile
    ? getActiveCommands(profile, existsSync(join(commandsDir, 'design.md')))
    : ['pipeline', 'audit', 'architect', 'coder', 'review', 'qa', 'security', 'docs', 'github-issue', 'profiler']

  if (!profile || !profile.agents?.cost_engineer) {
    if (existsSync(join(commandsDir, 'cost-engineer.md')) && !commands.includes('cost-engineer')) {
      commands.push('cost-engineer')
    }
  }

  let updated = 0
  let skippedCount = 0
  const updatedHashes = {}

  for (const cmd of commands) {
    const filepath = join(commandsDir, `${cmd}.md`)
    if (!existsSync(filepath)) continue

    const newContent = loadRenderedTemplate(`commands/${cmd}.md`, profile)
    const newHash = computeHash(newContent)
    const relPath = `.claude/commands/${cmd}.md`

    if (keepCustomizations && !force && manifest?.files?.[relPath]) {
      const currentHash = computeHash(readFileSync(filepath, 'utf-8'))
      if (currentHash !== manifest.files[relPath]) {
        fileSkipped(filepath, 'customized — use --force to override')
        skippedCount++
        updatedHashes[relPath] = currentHash
        continue
      }
    }

    writeFile(filepath, newContent, { force: true, dryRun })
    updated++
    if (!dryRun) updatedHashes[relPath] = newHash
  }

  const agentsPath = join(projectDir, 'docs', 'OCTECHPUS_AGENTS.md')
  if (existsSync(join(projectDir, 'docs'))) {
    writeFile(agentsPath, loadTemplate('docs/OCTECHPUS_AGENTS.md'), { force: true, dryRun })
    updated++
  }

  if (!dryRun && manifest && Object.keys(updatedHashes).length > 0) {
    manifest.version = VERSION
    manifest.updatedAt = new Date().toISOString()
    manifest.files = { ...manifest.files, ...updatedHashes }
    writeManifest(projectDir, manifest)
  }

  console.log('')
  console.log(`  ${c('green', `✓ Updated ${updated} files`)}`)
  if (skippedCount > 0) {
    console.log(`  ${c('yellow', `⊘ Skipped ${skippedCount} customized file(s)`)} ${c('dim', '(use --force to override)')}`)
  }
  console.log(`  ${c('dim', 'Note: CLAUDE.md was NOT modified. Run profile switch to re-render it.')}`)
  console.log('')
}

async function commandProfile(subcommand, profileArg, targetDir) {
  const projectDir = resolve(targetDir)

  switch (subcommand) {
    case 'list': {
      printBanner(VERSION)
      const profiles = listProfiles()
      console.log(bold('  Available Profiles:'))
      console.log('')
      for (const p of profiles) {
        console.log(`  ${c('cyan', p.name.padEnd(28))} ${c('dim', p.description || '')}`)
      }
      console.log('')
      console.log(`  ${c('dim', 'Use:')} npx octechpus init --stack=<name>`)
      console.log(`  ${c('dim', 'Or:')} npx octechpus profile switch <name>`)
      console.log('')
      break
    }

    case 'show': {
      if (!profileArg) {
        console.error(c('red', '  Usage: octechpus profile show <name>'))
        process.exit(1)
      }
      printBanner(VERSION)
      try {
        const resolved = resolveProfile(profileArg)
        console.log(bold(`  Profile: ${profileArg}`))
        console.log('')
        console.log(JSON.stringify(resolved, null, 2))
        console.log('')
      } catch {
        console.error(c('red', `  ✗ Profile not found: "${profileArg}"`))
        process.exit(1)
      }
      break
    }

    case 'current': {
      printBanner(VERSION)
      const manifest = readManifest(projectDir)
      if (manifest?.profile) {
        console.log(`  ${bold('Profile:')}    ${c('cyan', manifest.profile)}`)
        console.log(`  ${bold('Installed:')}  ${manifest.installedAt || 'unknown'}`)
        if (manifest.updatedAt) console.log(`  ${bold('Updated:')}    ${manifest.updatedAt}`)
        console.log(`  ${bold('Version:')}    ${manifest.version || 'unknown'}`)
      } else {
        const profile = getCurrentProfile(projectDir)
        if (profile) {
          console.log(`  ${bold('Profile:')} ${c('cyan', profile.name)} ${c('dim', '(read from CLAUDE.md — no manifest)')}`)
          console.log(`  ${c('yellow', '○')} Run ${c('cyan', 'npx octechpus init')} to create a manifest for full tracking`)
        } else {
          console.log(`  ${c('yellow', '○')} No profile set. Run ${c('cyan', 'npx octechpus init')} to initialize.`)
        }
      }
      console.log('')
      break
    }

    case 'switch': {
      if (!profileArg) {
        console.error(c('red', '  Usage: octechpus profile switch <name>'))
        process.exit(1)
      }
      printBanner(VERSION)

      let newProfile
      try {
        newProfile = resolveProfile(profileArg)
        validateProfile(newProfile)
      } catch {
        console.error(c('red', `  ✗ Profile not found: "${profileArg}"`))
        process.exit(1)
      }

      const commandsDir = join(projectDir, '.claude', 'commands')
      if (!existsSync(commandsDir)) {
        console.log(`  ${c('red', '✗')} Octechpus not installed. Run ${c('cyan', 'npx octechpus init')} first.`)
        console.log('')
        return
      }

      const currentProfile = getCurrentProfile(projectDir)
      if (currentProfile) {
        console.log(`  ${c('blue', 'ℹ')} Switching: ${c('dim', currentProfile.name)} → ${c('cyan', newProfile.name)}`)
      } else {
        console.log(`  ${c('blue', 'ℹ')} Setting profile: ${c('cyan', newProfile.name)}`)
      }
      console.log('')

      const manifest = readManifest(projectDir) || { files: {} }
      const commands = getActiveCommands(newProfile, false)
      let switched = 0

      console.log(bold('  Updating agent commands...'))
      for (const cmd of commands) {
        const filepath = join(commandsDir, `${cmd}.md`)
        const content = loadRenderedTemplate(`commands/${cmd}.md`, newProfile)
        writeFile(filepath, content, { force: true })
        manifest.files[`.claude/commands/${cmd}.md`] = computeHash(content)
        switched++
      }

      // Remove commands that aren't active in the new profile
      const activeSet = new Set(commands)
      const optionalCmds = ['design', 'cost-engineer']
      for (const opt of optionalCmds) {
        if (!activeSet.has(opt)) {
          // Don't delete — just don't update. User can remove manually.
        }
      }

      const claudeMdPath = join(projectDir, 'CLAUDE.md')
      if (existsSync(claudeMdPath)) {
        const claudeContent = loadRenderedTemplate('CLAUDE.md', newProfile)
        writeFileSync(claudeMdPath, claudeContent, 'utf-8')
        console.log(`  ${c('green', '✓')} CLAUDE.md ${c('dim', '(re-rendered with new profile)')}`)
        manifest.files['CLAUDE.md'] = computeHash(claudeContent)
      }

      manifest.version = VERSION
      manifest.profile = newProfile.name
      manifest.updatedAt = new Date().toISOString()
      writeManifest(projectDir, manifest)

      console.log('')
      console.log(`  ${c('green', `✓ Switched to ${newProfile.name} (${switched} files updated)`)}`)
      console.log('')
      break
    }

    default:
      console.error(c('red', `  Unknown profile subcommand: "${subcommand}"`))
      console.log(`  Available: ${c('cyan', 'list')}, ${c('cyan', 'show <name>')}, ${c('cyan', 'current')}, ${c('cyan', 'switch <name>')}`)
      process.exit(1)
  }
}

async function commandDesignSystem(subcommand, targetDir, options = {}) {
  const { force = false, dryRun = false } = options

  printBanner(VERSION)

  const projectDir = resolve(targetDir)
  const commandsDir = join(projectDir, '.claude', 'commands')
  const destDesignSystem = join(projectDir, 'design-system')
  const designCmdPath = join(commandsDir, 'design.md')

  if (subcommand === 'add') {
    if (!existsSync(commandsDir)) {
      console.log(`  ${c('red', '✗')} Octechpus not installed. Run ${c('cyan', 'npx octechpus init')} first.`)
      console.log('')
      return
    }

    console.log(`  ${c('blue', 'ℹ')} Adding design system to project...`)
    console.log('')

    const profile = getCurrentProfile(projectDir)
    console.log(bold('  Designer Command (.claude/commands/design.md)'))
    writeFile(designCmdPath, loadRenderedTemplate('commands/design.md', profile), { force, dryRun })
    console.log('')

    console.log(bold('  Design System Files (design-system/)'))
    copyDir(DESIGN_SYSTEM_TEMPLATES_DIR, destDesignSystem, { force, dryRun })
    console.log('')

    console.log(c('cyan', '  ═══════════════════════════════════════════════'))
    console.log('')
    if (dryRun) {
      console.log(`  ${c('yellow', 'DRY RUN')} — No files were written`)
    } else {
      console.log(`  ${c('green', '✓')} Design system added!`)
      console.log(`  Use ${c('cyan', '/design [demanda]')} in Claude Code to activate the Designer agent.`)
    }
    console.log('')

  } else if (subcommand === 'update') {
    console.log(`  ${c('blue', 'ℹ')} Syncing design system with latest templates...`)
    console.log('')

    const profile = getCurrentProfile(projectDir)
    console.log(bold('  Designer Command'))
    writeFile(designCmdPath, loadRenderedTemplate('commands/design.md', profile), { force: true, dryRun })
    console.log('')

    if (existsSync(destDesignSystem)) {
      console.log(bold('  Design System Files (design-system/)'))
      if (!force && !dryRun) {
        console.log(`  ${c('yellow', '⚠')} This will overwrite customized files in design-system/.`)
        const answer = await ask(`  Continue? (y/N): `)
        if (answer !== 'y' && answer !== 'yes') {
          console.log(`  ${c('yellow', '⊘')} Update cancelled.`)
          console.log('')
          return
        }
      }
      copyDir(DESIGN_SYSTEM_TEMPLATES_DIR, destDesignSystem, { force: true, dryRun })
    } else {
      console.log(`  ${c('yellow', '⚠')} design-system/ not found. Run ${c('cyan', 'npx octechpus design-system add')} first.`)
    }
    console.log('')

    console.log(c('cyan', '  ═══════════════════════════════════════════════'))
    console.log('')
    if (dryRun) {
      console.log(`  ${c('yellow', 'DRY RUN')} — No files were written`)
    } else {
      console.log(`  ${c('green', '✓')} Design system updated!`)
    }
    console.log('')

  } else {
    console.error(c('red', `  Unknown design-system subcommand: ${subcommand}`))
    console.log(`  Available: ${c('cyan', 'add')}, ${c('cyan', 'update')}`)
    process.exit(1)
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2)
const flags = args.filter(a => a.startsWith('-'))
const positional = args.filter(a => !a.startsWith('-'))

const command = positional[0] || 'help'
const subcommand = positional[1] || null

// Parse --stack=<name>
const stackFlag = flags.find(f => f.startsWith('--stack='))?.split('=').slice(1).join('=') || null

const options = {
  force: flags.includes('--force'),
  minimal: flags.includes('--minimal'),
  dryRun: flags.includes('--dry-run'),
  withDesignSystem: flags.includes('--with-design-system'),
  keepCustomizations: !flags.includes('--no-keep-customizations'),
  stack: stackFlag,
}

// Target directory: positional arg that looks like a path
const targetArg = positional.find(a => a !== command && a !== subcommand && (a.startsWith('.') || a.startsWith('/')))
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
  case 'profile': {
    const profileSubcmd = positional[1] || 'list'
    const profileArg = positional[2] || null
    await commandProfile(profileSubcmd, profileArg, targetDir)
    break
  }
  case 'design-system':
    await commandDesignSystem(subcommand || 'add', targetDir, options)
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
    console.error(c('red', `  Unknown command: ${command}`))
    console.log(`  Run ${c('cyan', 'npx octechpus help')} for usage`)
    process.exit(1)
}
