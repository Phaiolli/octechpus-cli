import readline from 'readline'

export const COLORS = {
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

export const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`
export const bold = (text) => c('bold', text)

export function printBanner(version) {
  console.log('')
  console.log(c('cyan', '  🐙 ═══════════════════════════════════════════'))
  console.log(c('cyan', '     OCTECHPUS — Agent Orchestrator System'))
  console.log(c('cyan', `     v${version}`))
  console.log(c('cyan', '  ═══════════════════════════════════════════════'))
  console.log('')
}

export function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}
