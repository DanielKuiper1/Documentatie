/**
 * Python in de browser, met een harde tijdslimiet.
 *
 * Het echte werk gebeurt in `python.worker.js`. Deze module houdt de worker
 * bij, stuurt code op en breekt af als het te lang duurt. Alleen een worker
 * beëindigen kan een vastgelopen WebAssembly-lus stoppen; vragen of Python zelf
 * wil stoppen werkt daar niet.
 */

/** Standaard tijdslimiet in milliseconden. */
export const DEFAULT_TIMEOUT = 8000

let worker = null
let nextId = 1

function ensureWorker() {
  if (!worker) {
    worker = new Worker(new URL('./python.worker.js', import.meta.url), { type: 'module' })
  }
  return worker
}

/** Gooit de worker weg; de volgende run start met een schone runtime. */
export function terminateRuntime() {
  if (worker) {
    worker.terminate()
    worker = null
  }
}

/** Pakketten die de code nodig heeft, afgeleid uit de import-regels. */
export function requiredPackages(code) {
  const known = ['pandas', 'numpy', 'matplotlib', 'scipy', 'sympy', 'statsmodels', 'scikit-learn']
  return known.filter((name) => new RegExp(`(^|\\n)\\s*(import|from)\\s+${name.replace('-', '_')}\\b`).test(code))
}

/**
 * Voert Python uit en geeft `{ output, outputs, error, timedOut }` terug.
 *
 * Bij een tijdslimiet wordt de worker beëindigd en weggegooid, zodat een
 * volgende poging gewoon weer werkt.
 */
export function runPython(code, onStatus = () => {}, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    let active
    try {
      active = ensureWorker()
    } catch (error) {
      resolve({
        output: '',
        outputs: [],
        error: `Python kon niet gestart worden. (${error.message || error})`,
        timedOut: false
      })
      return
    }

    const id = nextId++
    let timer = null

    const cleanup = () => {
      clearTimeout(timer)
      active.removeEventListener('message', onMessage)
      active.removeEventListener('error', onError)
    }

    function onMessage(event) {
      const data = event.data || {}
      if (data.type === 'status') {
        onStatus(data.message)
        // Laden en pakketten ophalen tellen niet mee voor de rekentijd.
        restartTimer()
        return
      }
      if (data.type !== 'result' || data.id !== id) return
      cleanup()
      resolve({ output: data.output, outputs: data.outputs, error: data.error, timedOut: false })
    }

    function onError(event) {
      cleanup()
      terminateRuntime()
      resolve({
        output: '',
        outputs: [],
        error: `Python is onverwacht gestopt. (${event.message || 'onbekende fout'})`,
        timedOut: false
      })
    }

    function restartTimer() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        cleanup()
        terminateRuntime() // enige manier om een oneindige lus te stoppen
        resolve({
          output: '',
          outputs: [],
          error: `Uitvoering gestopt: tijdslimiet bereikt (${Math.round(timeout / 1000)} seconden).`,
          timedOut: true
        })
      }, timeout)
    }

    active.addEventListener('message', onMessage)
    active.addEventListener('error', onError)
    restartTimer()
    active.postMessage({ type: 'run', code, id })
  })
}

/** Zet een plot()-aanroep om in een bronregel voor de gewone grafiekcomponent. */
export function outputToPlotSource(output) {
  const points = output.x.map((x, index) => `${round(x)},${round(output.y[index])}`).join(' ')
  return [
    output.title ? `title: ${output.title}` : 'title: Resultaat',
    `x: | label: ${output.x_label}`,
    `y: | label: ${output.y_label}`,
    `points: ${points}`,
    output.fit ? 'fit: linear | label: Regressielijn' : ''
  ]
    .filter(Boolean)
    .join('\n')
}

function round(value) {
  return Number(Number(value).toFixed(6))
}
