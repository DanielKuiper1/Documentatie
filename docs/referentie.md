# Referentie

Eén pagina met alle syntaxis die deze site begrijpt. Werkende voorbeelden staan
op [componenten](./componenten.md).

## Routering

| Bestand | Route |
|---------|-------|
| `docs/index.md` | `/` |
| `docs/referentie.md` | `/referentie` |
| `docs/handleidingen/basis.md` | `/handleidingen/basis` |
| `docs/handleidingen/index.md` | `/handleidingen` |
| `docs/10-handleidingen/20-basis.md` | `/handleidingen/basis` |

Mappen en bestandsnamen bepalen de URL. Een `index.md` is de route van zijn map,
en een eventueel volgnummer (`10-`) is alleen voor de volgorde: het staat nooit
in de URL. De titel komt uit het eerste `#`-kopje, en anders uit de
bestandsnaam.

## Links tussen documenten

Relatieve `.md`-links worden routes; alles met een protocol blijft een externe
link en opent in een nieuw tabblad.

```md
[Configuratie](./configuratie.md)
[Installatie](../aan-de-slag/installatie.md#installeren-en-draaien)
[Vue](https://vuejs.org)
```

## Wiskunde

```md
In de regel: $A = \pi r^2$

Als blok:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

## Codegroep

````md
```code-group
=== npm | bash
npm install
=== pnpm | bash
pnpm install
```
````

## Interactieve berekening

````md
```interactive
title: Optionele kop
description: Optionele zin eronder.
naam = 10 | label: Een getal, min: 0, max: 100, step: 1, prefix: $, suffix: %, slider: false
resultaat = naam * 2 | label: Een uitkomst, decimals: 2, prefix: $
```
````

| Sleutel | Voor | Betekenis |
|---------|------|-----------|
| `label` | beide | Tekst naast het veld of resultaat |
| `min`, `max`, `step` | invoer | Grenzen van veld en schuifregelaar |
| `slider` | invoer | `false` verbergt de schuifregelaar |
| `prefix`, `suffix` | beide | Tekst rond de waarde |
| `decimals` | resultaat | Aantal decimalen (standaard `2`) |

## Interactieve tabel

````md
```interactive-table
title: Optionele kop
filter: true
sort: true
| Label | Bewerkbaar* (min: 0, max: 10, step: 1, slider: true) | Afgeleid = Bewerkbaar * 2 (prefix: $, decimals: 2) |
| Eerste | 3 |
| Tweede | 7 |
```
````

- Een gewone kop is een vaste tekstkolom.
- Een kop met `*` erachter is een bewerkbare getalkolom.
- Een kop `Naam = expressie` wordt bij elke wijziging opnieuw berekend.
- Kolomnamen worden variabelen zonder leestekens: `Prijs per stuk` heet
  `Prijsperstuk`.

## Grafiek

````md
```plot
title: Optionele kop
x: 0..10 | label: x-as
y: 0..100 | label: y-as
points: 1,52 2,58 3,61
fit: linear | label: Kleinste-kwadratenlijn
editable: true
slope = 3 | label: Richtingscoëfficiënt, min: 0, max: 10, step: 0.05
curve: slope * x + 50 | label: Mijn lijn, residuals: true
readout: fit_r2 | label: R², decimals: 4
```
````

Curves zijn expressies van `x` plus de schuifregelaars in hetzelfde blok. Met
`fit: linear` zijn de resultaten beschikbaar als `fit_slope`, `fit_intercept`,
`fit_r2`, `fit_r`, `fit_sse`, `fit_n`, `fit_meanx` en `fit_meany`.

## Python

````md
```python-run
import pandas as pd

df = pd.DataFrame({"x": [1, 2, 3], "y": [2, 4, 7]})
table(df, title="Gegevens")
plot(df["x"], df["y"], fit=True)
```
````

`plot()` en `table()` zijn ingebouwd; pakketten zoals `pandas` en `numpy` worden
automatisch geladen op basis van de `import`-regels. De code draait in de
browser via Pyodide.

## Expressietaal

Beschikbaar in `interactive`-, `interactive-table`- en `plot`-blokken.

| Soort | Ondersteund |
|-------|-------------|
| Operatoren | `+` `-` `*` `/` `%` `**`, vergelijkingen, `voorwaarde ? a : b` |
| Constanten | `pi`, `e` |
| Functies | `abs` `ceil` `floor` `round` `sqrt` `exp` `log` `log2` `log10` `sin` `cos` `tan` `pow` `min` `max` |
| Variabelen | Andere velden in hetzelfde blok |

Verder is er niets bereikbaar: de evaluator maakt een boom van de expressie en
loopt die na, dus inhoud uit een document komt nooit bij `eval`, `Function` of
de DOM.

## Projectindeling

```text
docs/                     Markdown-bronnen
src/
  components/             Sidebar, ThemeToggle, MarkdownContent, CodeBlock,
                          CodeGroup, InteractiveExample, InteractiveTable,
                          PlotChart, PythonRunner
  views/                  DocPage, NotFound
  router/index.js         Routes afgeleid uit docs/
  utils/docs.js           Bestanden vinden, zijbalkboom bouwen
  utils/markdown.js       markdown-it + KaTeX + highlight.js
  utils/links.js          .md-link -> route
  utils/expression.js     Afgeschermde expressie-evaluator
  utils/interactive.js    Lezers voor de codeblokken
  utils/stats.js          Kleinste kwadraten en asverdeling
  utils/python.js         Pyodide-koppeling
```
