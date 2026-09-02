/**
 * Pyodide draait hier, in een Web Worker.
 *
 * Twee redenen: de pagina blijft reageren terwijl Python rekent, en een script
 * dat niet stopt (`while True: pass`) kan van buitenaf worden afgebroken — een
 * worker beëindigen is de enige manier om WebAssembly-code te onderbreken.
 *
 * De worker heeft geen DOM, geen `window` en geen toegang tot de rest van de
 * applicatie. Alleen de berichten hieronder gaan heen en weer.
 */

const PYODIDE_VERSION = '0.28.3'
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

// Grens aan de uitvoer, zodat een lus die miljoenen regels print de pagina niet
// plat legt voordat de tijdslimiet toeslaat.
const MAX_OUTPUT_CHARS = 100_000
const MAX_OUTPUT_LINES = 2000

const PREAMBLE = `
import json as _json

_doc_outputs = []

def plot(x, y=None, label="reeks", fit=False, x_label="x", y_label="y", title=""):
    """Teken een grafiek. Geef x en y als lijsten, of alleen y."""
    xs = list(range(len(x))) if y is None else list(x)
    ys = list(x) if y is None else list(y)
    # Punten met een ontbrekende waarde vallen weg: ze zijn niet te tekenen en
    # NaN levert bovendien ongeldige JSON op.
    pairs = []
    for a, b in zip(xs, ys):
        try:
            a, b = float(a), float(b)
        except (TypeError, ValueError):
            continue
        if a == a and b == b and abs(a) != float("inf") and abs(b) != float("inf"):
            pairs.append((a, b))
    _doc_outputs.append({
        "kind": "plot",
        "x": [a for a, _ in pairs],
        "y": [b for _, b in pairs],
        "label": str(label),
        "fit": bool(fit),
        "x_label": str(x_label),
        "y_label": str(y_label),
        "title": str(title),
    })

def table(data, title=""):
    """Toon een tabel. Accepteert een pandas DataFrame, een dict of een lijst met dicts."""
    if hasattr(data, "to_dict"):
        columns = [str(c) for c in data.columns]
        rows = [[_cell(r[c]) for c in data.columns] for _, r in data.iterrows()]
    elif isinstance(data, dict):
        columns = [str(c) for c in data.keys()]
        rows = list(map(list, zip(*[[_cell(v) for v in col] for col in data.values()])))
    else:
        records = list(data)
        columns = [str(c) for c in records[0].keys()] if records else []
        rows = [[_cell(r[c]) for c in columns] for r in records]
    _doc_outputs.append({"kind": "table", "columns": columns, "rows": rows, "title": str(title)})

_MISSING = {"nan", "NaN", "NaT", "None", "<NA>", "nat", "null"}

def _cell(value):
    """Eén tabelcel. Ontbrekende waarden worden None; die tonen we als een streepje."""
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        text = str(value)
        return None if text.strip() in _MISSING else text
    if number != number:  # NaN is de enige waarde die niet aan zichzelf gelijk is
        return None
    if number in (float("inf"), float("-inf")):
        return str(number)
    return int(number) if number == int(number) and abs(number) < 1e15 else round(number, 6)
`

const KNOWN_PACKAGES = ['pandas', 'numpy', 'matplotlib', 'scipy', 'sympy', 'statsmodels', 'scikit-learn']

let pyodide = null
const loadedPackages = new Set()

function requiredPackages(code) {
  return KNOWN_PACKAGES.filter((name) =>
    new RegExp(`(^|\\n)\\s*(import|from)\\s+${name.replace('-', '_')}\\b`).test(code)
  )
}

const status = (message) => self.postMessage({ type: 'status', message })

async function ensureRuntime() {
  if (pyodide) return pyodide
  status('Python wordt geladen…')
  const { loadPyodide } = await import(/* @vite-ignore */ `${CDN}pyodide.mjs`)
  pyodide = await loadPyodide({ indexURL: CDN })
  await pyodide.runPythonAsync(PREAMBLE)
  return pyodide
}

self.onmessage = async (event) => {
  const { type, code, id } = event.data || {}
  if (type !== 'run') return

  const chunks = []
  let outputChars = 0
  let truncated = false

  const collect = (text) => {
    if (truncated) return
    if (chunks.length >= MAX_OUTPUT_LINES || outputChars + text.length > MAX_OUTPUT_CHARS) {
      truncated = true
      chunks.push('… uitvoer afgekapt.')
      return
    }
    outputChars += text.length
    chunks.push(text)
  }

  try {
    const runtime = await ensureRuntime()

    const packages = requiredPackages(code).filter((name) => !loadedPackages.has(name))
    if (packages.length) {
      status(`Pakketten laden: ${packages.join(', ')}…`)
      await runtime.loadPackage(packages)
      for (const name of packages) loadedPackages.add(name)
    }

    status('Uitvoeren…')
    runtime.setStdout({ batched: collect })
    runtime.setStderr({ batched: collect })

    await runtime.runPythonAsync('_doc_outputs.clear()')
    await runtime.runPythonAsync(code)
    const outputs = JSON.parse(await runtime.runPythonAsync('_json.dumps(_doc_outputs)'))

    self.postMessage({ type: 'result', id, output: chunks.join('\n'), outputs, error: null })
  } catch (error) {
    self.postMessage({
      type: 'result',
      id,
      output: chunks.join('\n'),
      outputs: [],
      error: String((error && error.message) || error)
    })
  } finally {
    if (pyodide) {
      pyodide.setStdout({})
      pyodide.setStderr({})
    }
  }
}
