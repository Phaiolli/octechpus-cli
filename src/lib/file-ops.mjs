import { existsSync, mkdirSync, writeFileSync, readdirSync, copyFileSync, statSync } from 'fs'
import { dirname } from 'path'
import { join } from 'path'
import { c } from './prompts.mjs'

export function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

export function fileCreated(filepath, dryRun) {
  const rel = filepath.replace(process.cwd() + '/', '')
  if (dryRun) {
    console.log(`  ${c('yellow', '○')} ${c('dim', 'would create')} ${rel}`)
  } else {
    console.log(`  ${c('green', '✓')} ${rel}`)
  }
}

export function fileSkipped(filepath, reason) {
  const rel = filepath.replace(process.cwd() + '/', '')
  console.log(`  ${c('yellow', '⊘')} ${rel} ${c('dim', `(${reason})`)}`)
}

export function fileExists(filepath) {
  const rel = filepath.replace(process.cwd() + '/', '')
  console.log(`  ${c('blue', '●')} ${rel} ${c('dim', '(already exists)')}`)
}

export function writeFile(filepath, content, options = {}) {
  const { force = false, dryRun = false } = options

  if (dryRun) {
    fileCreated(filepath, true)
    return true
  }

  if (existsSync(filepath) && !force) return false

  ensureDir(dirname(filepath))
  writeFileSync(filepath, content, 'utf-8')
  fileCreated(filepath, false)
  return true
}

export function copyDir(srcDir, destDir, options = {}) {
  const { force = false, dryRun = false } = options
  const entries = readdirSync(srcDir)
  for (const entry of entries) {
    const srcPath = join(srcDir, entry)
    const destPath = join(destDir, entry)
    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      if (!dryRun) ensureDir(destPath)
      copyDir(srcPath, destPath, options)
    } else {
      if (existsSync(destPath) && !force) {
        fileExists(destPath)
      } else {
        if (!dryRun) {
          ensureDir(dirname(destPath))
          copyFileSync(srcPath, destPath)
        }
        fileCreated(destPath, dryRun)
      }
    }
  }
}
