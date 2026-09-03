// Bouwt CONTEXT.md: één bestand met alles wat een AI nodig heeft om
// geldige docs/*.md-pagina's voor deze site te schrijven.
// Gebruik: npm run context
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))

const BRONNEN = [
  ['src/utils/markdown.js', 'Welke codeblokken een component worden (COMPONENT_FENCES) en hoe Markdown in blokken uiteenvalt.'],
  ['src/utils/interactive.js', 'De parsers: exact welke regels en opties `interactive`, `interactive-table` en `plot` accepteren.'],
  ['src/utils/expression.js', 'De expressietaal: welke operatoren, constanten en functies bestaan. Alles daarbuiten geeft een streepje.'],
  ['src/utils/links.js', 'Hoe een relatieve .md-link een route wordt.'],
  ['src/utils/docs.js', 'Hoe bestandsnamen routes, titels en zijbalkvolgorde bepalen.'],
  ['src/utils/stats.js', 'De fit-berekening achter `fit: linear` en de fit_*-variabelen.'],
  ['smoke.mjs', 'De controles van `npm test`. Een pagina moet hier doorheen komen.']
]

const uit = []
uit.push('# Contextbundel voor het schrijven van documentatiepagina\'s')
uit.push('')
uit.push('Automatisch gegenereerd door `build-context.mjs` — niet met de hand aanpassen.')
uit.push(`Gegenereerd op ${new Date().toISOString().slice(0, 10)}.`)
uit.push('')
uit.push('## Hoe je dit gebruikt')
uit.push('')
uit.push('Geef dit hele bestand aan Claude met een opdracht als:')
uit.push('')
uit.push('> Schrijf een pagina `docs/statistiek/regressie.md` over lineaire regressie,')
uit.push('> met een `plot`-blok met sleepbare meetpunten en een `interactive`-blok.')
uit.push('')
uit.push('Deel 1 is de handleiding met de schrijfwijze. Deel 2 zijn de echte parsers,')
uit.push('zodat er geen opties verzonnen worden die niet bestaan. Deel 3 zijn de')
uit.push('bestaande pagina\'s als stijlvoorbeeld.')
uit.push('')
uit.push('Controleer het resultaat altijd met `npm test`.')
uit.push('')
uit.push('---')
uit.push('')
uit.push('# Deel 1 — De handleiding')
uit.push('')
uit.push(readFileSync(join(ROOT, 'COMPONENTEN.md'), 'utf8').trim())
uit.push('')
uit.push('---')
uit.push('')
uit.push('# Deel 2 — De bron achter de schrijfwijze')
uit.push('')
uit.push('Dit is de code die je Markdown leest. Wat hier niet in staat, bestaat niet.')
uit.push('')

for (const [pad, waarom] of BRONNEN) {
  const code = readFileSync(join(ROOT, pad), 'utf8').trimEnd()
  const taal = extname(pad) === '.vue' ? 'vue' : 'js'
  uit.push(`## \`${pad}\``)
  uit.push('')
  uit.push(waarom)
  uit.push('')
  uit.push('```' + taal)
  uit.push(code)
  uit.push('```')
  uit.push('')
}

// Deel 3: alle bestaande documenten, als stijl- en syntaxisvoorbeeld.
function verzamel(map) {
  const gevonden = []
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam)
    if (statSync(pad).isDirectory()) gevonden.push(...verzamel(pad))
    else if (extname(naam) === '.md') gevonden.push(pad)
  }
  return gevonden.sort()
}

const docs = verzamel(join(ROOT, 'docs'))
uit.push('---')
uit.push('')
uit.push('# Deel 3 — De bestaande pagina\'s')
uit.push('')
uit.push('Volg deze toon, kopstructuur en manier van doseren.')
uit.push('')

for (const pad of docs) {
  const kort = relative(ROOT, pad).replace(/[\\]+/g, '/')
  const inhoud = readFileSync(pad, 'utf8').trimEnd()
  const hek = '`'.repeat(Math.max(4, ...(inhoud.match(/`+/g) || ['']).map(m => m.length + 1)))
  uit.push(`## \`${kort}\``)
  uit.push('')
  uit.push(hek + 'md')
  uit.push(inhoud)
  uit.push(hek)
  uit.push('')
}

const doel = join(ROOT, 'CONTEXT.md')
writeFileSync(doel, uit.join('\n'), 'utf8')
console.log(`CONTEXT.md geschreven — ${docs.length} documenten, ${BRONNEN.length} bronbestanden, ${uit.join('\n').length} tekens.`)
