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

/**
 * Cria um "prompter" com UM único readline reaproveitado por várias perguntas.
 *
 * `ask()` abre/fecha um readline a cada chamada — o que perde o input restante
 * quando o stdin é um pipe (testes, `printf | octechpus`): o readline emite
 * todas as linhas do chunk de uma vez, antes da próxima pergunta registrar seu
 * listener. Este asker resolve isso BUFFERIZANDO cada linha numa fila assim que
 * chega; `ask()` consome da fila (ou espera a próxima). Funciona igual para pipe
 * (linhas chegam juntas) e TTY (linhas chegam conforme o usuário digita).
 *
 * Chame `close()` ao terminar para liberar o stdin e deixar o processo sair.
 *
 * @returns {{ ask: (q: string) => Promise<string>, close: () => void }}
 */
export function createAsker() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const queued = []   // linhas recebidas e ainda não consumidas
  const waiting = []  // resolvers de ask() à espera de linha
  let closed = false

  rl.on('line', (line) => {
    const value = line.trim().toLowerCase()
    const next = waiting.shift()
    if (next) next(value)
    else queued.push(value)
  })
  rl.on('close', () => {
    closed = true
    while (waiting.length) waiting.shift()('') // libera pendências no EOF
  })

  const ask = (question) => {
    if (question) process.stdout.write(question)
    return new Promise((resolve) => {
      if (queued.length) resolve(queued.shift())
      else if (closed) resolve('')
      else waiting.push(resolve)
    })
  }
  return { ask, close: () => rl.close() }
}
