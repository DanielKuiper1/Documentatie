/**
 * Parsers for the two interactive fenced-block formats.
 *
 * ```interactive
 * title: Compound interest
 * principal = 1000 | label: Principal, min: 0, max: 50000, step: 100, prefix: $
 * rate = 5         | label: Interest rate, min: 0, max: 20, step: 0.1, suffix: %
 * amount = principal * (1 + rate / 100) ** years | label: Final amount, prefix: $
 * ```
 *
 * A line whose right-hand side is a plain number becomes an editable field;
 * anything else becomes a derived (read-only) result.
 *
 * ```interactive-table
 * | Quantity* (min: 0, max: 20) | Price* | Total = Quantity * Price |
 * | 1 | 10 |
 * | 2 | 12 |
 * ```
 *
 * `*` marks an editable column, `Name = expression` marks a computed column.
 */

/** `label: Principal, min: 0, step: 0.5` -> object */
function parseOptions(text) {
  const options = {}
  if (!text) return options
  for (const part of splitTopLevel(text, ',')) {
    const index = part.indexOf(':')
    if (index === -1) continue
    const key = part.slice(0, index).trim()
    const raw = part.slice(index + 1).trim()
    const asNumber = Number(raw)
    options[key] = raw !== '' && !Number.isNaN(asNumber) ? asNumber : raw
  }
  return options
}

/** Split on `separator`, ignoring anything inside parentheses. */
function splitTopLevel(text, separator) {
  const parts = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === separator && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.map((part) => part.trim()).filter(Boolean)
}

function identifier(name) {
  return name.replace(/[^\w]/g, '')
}

export function parseInteractive(source) {
  const spec = { title: '', description: '', fields: [], outputs: [], error: null }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const meta = line.match(/^(title|description)\s*:\s*(.+)$/i)
    if (meta) {
      spec[meta[1].toLowerCase()] = meta[2].trim()
      continue
    }

    const [definition, optionText] = splitOnce(line, '|')
    const index = definition.indexOf('=')
    if (index === -1) {
      spec.error = `Kan deze regel niet lezen: "${line}"`
      continue
    }

    const name = identifier(definition.slice(0, index).trim())
    const value = definition.slice(index + 1).trim()
    const options = parseOptions(optionText)
    const numeric = Number(value)

    if (value !== '' && !Number.isNaN(numeric)) {
      spec.fields.push({
        name,
        label: options.label || name,
        value: numeric,
        min: options.min ?? 0,
        max: options.max ?? Math.max(numeric * 2, 100),
        step: options.step ?? guessStep(numeric),
        prefix: options.prefix || '',
        suffix: options.suffix || '',
        slider: options.slider !== 'false'
      })
    } else {
      spec.outputs.push({
        name,
        label: options.label || name,
        expression: value,
        prefix: options.prefix || '',
        suffix: options.suffix || '',
        decimals: options.decimals ?? 2
      })
    }
  }

  return spec
}

function guessStep(value) {
  if (Number.isInteger(value)) return Math.abs(value) >= 1000 ? 100 : 1
  return 0.1
}

function splitOnce(text, separator) {
  const index = text.indexOf(separator)
  return index === -1 ? [text.trim(), ''] : [text.slice(0, index).trim(), text.slice(index + 1).trim()]
}

/**
 * Pull a trailing `(key: value, ...)` group off a column header without
 * disturbing parentheses that belong to the expression itself.
 */
function splitHeaderOptions(cell) {
  const match = cell.trim().match(/^(.*)\(([^()]*:[^()]*)\)$/)
  if (!match) return { head: cell.trim(), options: {} }
  return { head: match[1].trim(), options: parseOptions(match[2]) }
}

/**
 * ```plot
 * title: Linear regression
 * x: 0..10 | label: Study hours
 * y: 40..100 | label: Exam score
 * points: 1,52 2,55 3,61 4,64 5,72
 * fit: linear
 * slope = 3 | label: Your slope, min: -5, max: 10, step: 0.1
 * curve: slope * x + 50 | label: Your line
 * readout: fit_r2 | label: R2, decimals: 4
 * ```
 *
 * Curves are expressions of `x` plus any slider defined in the same block; the
 * least-squares fit exposes `fit_slope`, `fit_intercept`, `fit_r2`, `fit_sse`
 * and `fit_n` to curves and readouts alike.
 */
export function parsePlot(source) {
  const spec = {
    title: '',
    description: '',
    x: { label: 'x', min: null, max: null },
    y: { label: 'y', min: null, max: null },
    points: [],
    fields: [],
    curves: [],
    readouts: [],
    fit: false,
    fitLabel: 'Least-squares fit',
    editable: false,
    error: null
  }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const [body, optionText] = splitOnce(line, '|')
    const options = parseOptions(optionText)
    const directive = body.match(/^(title|description|x|y|points|fit|curve|readout|editable)\s*:\s*(.*)$/i)

    if (directive) {
      const key = directive[1].toLowerCase()
      const value = directive[2].trim()

      if (key === 'title' || key === 'description') {
        spec[key] = value
      } else if (key === 'x' || key === 'y') {
        const range = value.match(/^(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)$/)
        if (range) {
          spec[key].min = Number(range[1])
          spec[key].max = Number(range[2])
        }
        if (options.label) spec[key].label = options.label
      } else if (key === 'points') {
        for (const pair of value.split(/[\s;]+/).filter(Boolean)) {
          const [x, y] = pair.split(',').map(Number)
          if (Number.isFinite(x) && Number.isFinite(y)) spec.points.push({ x, y })
        }
      } else if (key === 'fit') {
        spec.fit = value.toLowerCase() !== 'false'
        if (options.label) spec.fitLabel = options.label
      } else if (key === 'curve') {
        spec.curves.push({
          expression: value,
          label: options.label || value,
          residuals: String(options.residuals) === 'true'
        })
      } else if (key === 'readout') {
        spec.readouts.push({
          expression: value,
          label: options.label || value,
          decimals: options.decimals ?? 3,
          prefix: options.prefix || '',
          suffix: options.suffix || ''
        })
      } else if (key === 'editable') {
        spec.editable = value.toLowerCase() !== 'false'
      }
      continue
    }

    // Anything else is a slider, using the same `name = number` form as
    // ```interactive blocks.
    const index = body.indexOf('=')
    if (index === -1) {
      spec.error = `Kan deze regel niet lezen: "${line}"`
      continue
    }
    const name = identifier(body.slice(0, index).trim())
    const value = Number(body.slice(index + 1).trim())
    if (Number.isNaN(value)) {
      spec.error = `"${name}" heeft een startgetal nodig`
      continue
    }
    spec.fields.push({
      name,
      label: options.label || name,
      value,
      min: options.min ?? Math.min(0, value * 2),
      max: options.max ?? Math.max(value * 2, 10),
      step: options.step ?? 0.1,
      prefix: options.prefix || '',
      suffix: options.suffix || ''
    })
  }

  if (!spec.curves.length && !spec.points.length) {
    spec.error = spec.error || 'Een grafiek heeft minstens één curve of enkele punten nodig.'
  }

  return spec
}

export function parseInteractiveTable(source) {
  const spec = { title: '', columns: [], rows: [], error: null, filter: true, sort: true }

  const lines = source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^\|?\s*:?-{2,}/.test(line.replace(/\|/g, '|'))) // drop `|---|---|`

  const rows = []
  for (const line of lines) {
    const meta = line.match(/^(title|filter|sort)\s*:\s*(.+)$/i)
    if (meta && !line.includes('|')) {
      const key = meta[1].toLowerCase()
      spec[key] = key === 'title' ? meta[2].trim() : meta[2].trim() !== 'false'
      continue
    }
    if (!line.includes('|')) continue
    rows.push(splitTopLevel(line.replace(/^\|/, '').replace(/\|$/, ''), '|'))
  }

  if (!rows.length) {
    spec.error = 'Een interactieve tabel heeft een koprij nodig.'
    return spec
  }

  spec.columns = rows[0].map((cell) => {
    const { head, options } = splitHeaderOptions(cell)
    const equals = head.indexOf('=')

    if (equals !== -1) {
      const label = head.slice(0, equals).trim()
      return {
        label,
        key: identifier(label),
        kind: 'computed',
        expression: head.slice(equals + 1).trim(),
        decimals: options.decimals ?? 2,
        prefix: options.prefix || '',
        suffix: options.suffix || ''
      }
    }

    const editable = head.endsWith('*')
    const label = (editable ? head.slice(0, -1) : head).trim()
    return {
      label,
      key: identifier(label),
      kind: editable ? 'input' : 'text',
      min: options.min ?? 0,
      max: options.max ?? 100,
      step: options.step ?? 1,
      slider: options.slider === 'true',
      prefix: options.prefix || '',
      suffix: options.suffix || ''
    }
  })

  spec.rows = rows.slice(1).map((cells) => {
    const row = {}
    spec.columns.forEach((column, i) => {
      const raw = (cells[i] ?? '').trim()
      if (column.kind === 'computed') return
      const numeric = Number(raw)
      row[column.key] = column.kind === 'input' && raw !== '' && !Number.isNaN(numeric) ? numeric : raw
    })
    return row
  })

  return spec
}

export function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}
