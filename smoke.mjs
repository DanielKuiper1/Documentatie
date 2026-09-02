import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert'
import { compile, evaluateExpression } from './src/utils/expression.js'
import { parseInteractive, parseInteractiveTable, parsePlot } from './src/utils/interactive.js'
import { resolveDocLink } from './src/utils/links.js'
import { linearRegression, sumSquaredError, ticks, formatTick } from './src/utils/stats.js'
import { renderDocument, extractHeadings, buildHeadingTree, flattenHeadings, highlight } from './src/utils/markdown.js'
import { requiredPackages, outputToPlotSource } from './src/utils/python.js'

/* ---------------------------------------------------------- expressies --- */
assert.strictEqual(compile('1 + 2 * 3')(), 7)
assert.strictEqual(compile('2 ** 3 ** 2')(), 512)
assert.strictEqual(compile('a > 1 ? 10 : 20')({ a: 5 }), 10)
assert.ok(Number.isNaN(evaluateExpression('window.alert(1)')))
assert.ok(Number.isNaN(evaluateExpression('unknownVar + 1')))

/* --------------------------------------------------------------- links --- */
// Volgnummers horen niet in de URL (regressie: links braken na het hernoemen).
assert.strictEqual(
  resolveDocLink('./10-aan-de-slag/10-installatie.md', '/'),
  '/aan-de-slag/installatie'
)
assert.strictEqual(
  resolveDocLink('../20-handleidingen/10-basis.md#lijsten', '/30-wiskunde/algebra'),
  '/20-handleidingen/basis#lijsten'.replace('/20-handleidingen/', '/handleidingen/')
)
assert.strictEqual(resolveDocLink('./20-analyse.md', '/wiskunde/algebra'), '/wiskunde/analyse')
assert.strictEqual(resolveDocLink('https://vuejs.org', '/'), 'https://vuejs.org')
assert.strictEqual(resolveDocLink('#kopje', '/referentie'), '#kopje')

/* ------------------------------------------------------ kopjeshiërarchie --- */
const tree = buildHeadingTree(
  extractHeadings('# Inleiding\n## Installatie\n### Windows\n### Linux\n## Configuratie\n# Gevorderd\n## Plug-ins')
)
assert.strictEqual(tree.length, 2, 'twee h1-kopjes op het hoogste niveau')
assert.strictEqual(tree[0].children.length, 2)
assert.strictEqual(tree[0].children[0].children.length, 2)
assert.deepStrictEqual(
  flattenHeadings(tree).map((h) => `${'  '.repeat(h.depth)}${h.text}`),
  [
    'Inleiding',
    '  Installatie',
    '    Windows',
    '    Linux',
    '  Configuratie',
    'Gevorderd',
    '  Plug-ins'
  ]
)
// Een pagina die bij h2 begint springt niet voor niets in.
assert.deepStrictEqual(
  buildHeadingTree(extractHeadings('## Een\n### Twee')).map((h) => h.depth),
  [0]
)
// Kopjes binnen een codeblok tellen niet mee.
assert.deepStrictEqual(extractHeadings('# Echt\n```\n# nep\n```\n## Ook echt').map((h) => h.text), [
  'Echt',
  'Ook echt'
])

/* ------------------------------------------------------------ blokken --- */
const blocks = renderDocument(
  ['# T', '', '```code-group', '=== npm | bash', 'npm i', '```', '', '```python-run', 'print(1)', '```'].join('\n'),
  '/'
)
assert.deepStrictEqual(blocks.map((b) => b.type), ['html', 'code-group', 'python'])

/* ------------------------------------------------------------- grafiek --- */
const spec = parsePlot(
  [
    'title: Test',
    'x: 0..10 | label: Uren',
    'points: 1,52 2,58',
    'fit: linear',
    'editable: true',
    'slope = 3 | label: Helling, min: 0, max: 10, step: 0.05',
    'curve: slope * x + 55 | label: Mijn lijn, residuals: true'
  ].join('\n')
)
assert.strictEqual(spec.error, null)
assert.strictEqual(spec.editable, true)
assert.strictEqual(spec.curves[0].residuals, true)
assert.strictEqual(spec.points.length, 2)

/* ------------------------------------------------------------ regressie --- */
const perfect = linearRegression([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }])
assert.strictEqual(perfect.slope, 2)
assert.strictEqual(perfect.r2, 1)
const points = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 8 }]
const fit = linearRegression(points)
const best = sumSquaredError(points, (x) => fit.slope * x + fit.intercept)
for (const delta of [-0.5, -0.1, 0.1, 0.5]) {
  assert.ok(sumSquaredError(points, (x) => (fit.slope + delta) * x + fit.intercept) > best)
}
assert.deepStrictEqual(ticks(0, 10, 5), [0, 2, 4, 6, 8, 10])
assert.deepStrictEqual(ticks(0, 1, 5).map(formatTick), ['0', '0.2', '0.4', '0.6', '0.8', '1'])

/* --------------------------------------------------------------- python --- */
assert.deepStrictEqual(requiredPackages('import pandas as pd\nimport json'), ['pandas'])
assert.deepStrictEqual(requiredPackages('from numpy import array'), ['numpy'])
assert.deepStrictEqual(requiredPackages('print(1)'), [])
const plotSource = outputToPlotSource({
  x: [1, 2],
  y: [3, 4],
  label: 'r',
  fit: true,
  x_label: 'uren',
  y_label: 'cijfer',
  title: 'Titel'
})
assert.ok(plotSource.includes('points: 1,3 2,4'))
assert.strictEqual(parsePlot(plotSource).error, null)
assert.strictEqual(parsePlot(plotSource).points.length, 2)

/* ------------------------------------------------- alle echte documenten --- */
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
    )
}

const routes = new Set()
for (const file of walk('docs')) {
  const relative = file.split(path.sep).slice(1).join('/')
  const route =
    '/' +
    relative
      .replace(/\.md$/, '')
      .split('/')
      .map((segment) => segment.replace(/^\d+[-_]/, ''))
      .filter((segment) => segment !== 'index')
      .join('/')
  routes.add(route.replace(/\/$/, '') || '/')
}

let checked = 0
for (const file of walk('docs')) {
  const source = fs.readFileSync(file, 'utf8')
  const relative = file.split(path.sep).slice(1).join('/')
  const route =
    '/' +
    relative
      .replace(/\.md$/, '')
      .split('/')
      .map((segment) => segment.replace(/^\d+[-_]/, ''))
      .filter((segment) => segment !== 'index')
      .join('/')
  const docRoute = route.replace(/\/$/, '') || '/'

  for (const block of renderDocument(source, docRoute)) {
    if (block.type === 'interactive') {
      const parsed = parseInteractive(block.source)
      assert.strictEqual(parsed.error, null, `${file}: ${parsed.error}`)
      for (const output of parsed.outputs) compile(output.expression)
    }
    if (block.type === 'interactive-table') {
      const parsed = parseInteractiveTable(block.source)
      assert.strictEqual(parsed.error, null, `${file}: ${parsed.error}`)
      for (const column of parsed.columns) if (column.kind === 'computed') compile(column.expression)
    }
    if (block.type === 'plot') {
      const parsed = parsePlot(block.source)
      assert.strictEqual(parsed.error, null, `${file}: ${parsed.error}`)
      for (const curve of parsed.curves) compile(curve.expression)
      for (const readout of parsed.readouts) compile(readout.expression)
    }
    // Elke interne link moet op een bestaand document uitkomen.
    if (block.type === 'html') {
      for (const match of block.html.matchAll(/href="([^"]+)" data-internal/g)) {
        const target = match[1].split('#')[0]
        if (!target) continue
        assert.ok(routes.has(target), `${file}: dode link naar ${target}`)
        checked++
      }
    }
  }
}

/* --------------------------------------------------- syntaxiskleuring --- */
const samples = {
  js: 'const a = 1 // hoi',
  ts: 'const a: number = 1',
  python: ['def f(x):', '    return x + 1'].join(String.fromCharCode(10)),
  bash: 'echo "hoi" && ls -la',
  json: '{"a": 1}',
  css: '.a { color: red; }',
  html: '<div class="a">hoi</div>',
  vue: '<template><p>hoi</p></template>',
  sql: 'select * from t where a = 1',
  yaml: 'a: 1',
  md: '# kop',
  diff: '+ toegevoegd'
}
for (const [language, code] of Object.entries(samples)) {
  const result = highlight(code, language)
  assert.ok(result.includes('hljs-'), `${language}: geen kleuring`)
}
// Een onbekende taal mag niet crashen en moet veilig ontsnapt worden.
assert.strictEqual(highlight('<script>x</script>', 'brainfuck').includes('<script>'), false)
assert.ok(highlight('gewone tekst', '').length > 0)

/* --------------------------------------- kopjes in de echte documenten --- */
// Regressie: documenten met Windows-regeleindes leverden ooit nul kopjes op,
// waardoor "Op deze pagina" stilletjes verdween.
for (const file of walk('docs')) {
  const source = fs.readFileSync(file, 'utf8')
  const headings = extractHeadings(source)
  assert.ok(headings.length > 0, `${file}: geen kopjes gevonden`)
  assert.strictEqual(headings[0].level, 1, `${file}: eerste kopje is geen h1`)
  const LF = String.fromCharCode(10)
  const CRLF = String.fromCharCode(13, 10)
  const crlf = source.split(LF).join(CRLF)
  assert.deepStrictEqual(
    extractHeadings(crlf).map((h) => h.text),
    headings.map((h) => h.text),
    `${file}: kopjes verschillen met CRLF-regeleindes`
  )
}

console.log(`alle controles geslaagd (${routes.size} routes, ${checked} interne links)`)
