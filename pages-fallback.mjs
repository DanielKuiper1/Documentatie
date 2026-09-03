import { copyFileSync, existsSync } from 'node:fs'

/**
 * GitHub Pages kent geen herschrijfregels: een diepe link als
 * /documentatie/referentie levert daar een 404 op zodra je de pagina ververst.
 * Pages serveert bij een 404 wel `404.html`, dus een kopie van `index.html`
 * daaronder laat de router alsnog de juiste pagina tonen.
 */
const bron = 'dist/index.html'

if (!existsSync(bron)) {
  console.error('pages-fallback: dist/index.html ontbreekt; draai eerst de build.')
  process.exit(1)
}

copyFileSync(bron, 'dist/404.html')
console.log('pages-fallback: dist/404.html aangemaakt')
