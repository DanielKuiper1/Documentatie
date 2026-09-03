# Handleiding: de documentatiesite gebruiken

Dit document staat bewust **buiten** `docs/`. Het is geen pagina op de site maar
de handleiding erachter: hoe je pagina's toevoegt, welke componenten er zijn,
welke opties ze kennen en hoe alles onder de motorkap in elkaar zit.

De site zelf staat in `docs/`. Alles wat je daar in Markdown schrijft, wordt
automatisch een pagina.

---

## Inhoud

1. [In het kort](#in-het-kort)
2. [Pagina's toevoegen en routes](#paginas-toevoegen-en-routes)
3. [Gewone Markdown](#gewone-markdown)
4. [Links tussen documenten](#links-tussen-documenten)
5. [Wiskunde met KaTeX](#wiskunde-met-katex)
6. [Codeblokken](#codeblokken)
7. [Codegroepen](#codegroepen)
8. [Interactieve berekeningen](#interactieve-berekeningen)
9. [Interactieve tabellen](#interactieve-tabellen)
10. [Grafieken](#grafieken)
11. [Python uitvoeren](#python-uitvoeren)
12. [De expressietaal](#de-expressietaal)
13. [Hoe het systeem werkt](#hoe-het-systeem-werkt)
14. [Een eigen component toevoegen](#een-eigen-component-toevoegen)
15. [Ontwikkelen, testen en uitrollen](#ontwikkelen-testen-en-uitrollen)

---

## In het kort

```bash
npm install      # eenmalig
npm run dev      # ontwikkelserver
npm run build    # statische bundel in dist/
npm run preview  # de gebouwde bundel bekijken
npm test         # controles op parsers, links, wiskunde en rekenwerk
```

Een pagina toevoegen is één handeling: maak een `.md`-bestand onder `docs/`.
Er is geen routetabel, geen zijbalkconfiguratie en geen registratielijst.

Alle interactieve blokken hieronder zijn **codeblokken met een eigen naam**. Je
schrijft ze zoals gewone code, maar in plaats van gekleurde tekst krijg je een
werkend component:

````md
```plot
x: -6..6
curve: sin(x)
```
````

---

## Pagina's toevoegen en routes

De mappenstructuur van `docs/` bepaalt de URL's. Meer hoef je niet te doen.

```text
docs/
├── index.md                 →  /
├── referentie.md            →  /referentie
└── handleidingen/
    ├── index.md             →  /handleidingen
    └── uitrollen.md         →  /handleidingen/uitrollen
```

**Regels**

- Elk `.md`-bestand wordt een route.
- `index.md` is de route van de map waarin het staat.
- De **titel** is het eerste `#`-kopje. Ontbreekt dat, dan wordt de bestandsnaam
  gebruikt, opgeschoond (`aan-de-slag` → `Aan de slag`).
- De zijbalk gebruikt precies dezelfde titels en volgt dezelfde structuur.

**Volgorde in de zijbalk**

Standaard staan mappen bovenaan en daarna de pagina's, allebei op alfabet. Wil je
een eigen volgorde, zet dan een getal vóór de naam. Dat volgnummer is optioneel
en verdwijnt uit de URL:

```text
docs/10-aan-de-slag/20-installatie.md   →  /aan-de-slag/installatie
```

---

## Gewone Markdown

Alles wat je van Markdown verwacht werkt: koppen, **vet**, *cursief*,
`code`, lijsten, citaten, tabellen, afbeeldingen en scheidingslijnen.

Extra's:

| Wat | Syntaxis |
|-----|----------|
| Takenlijst | `- [x] klaar` / `- [ ] open` |
| Doorhalen | `~~doorgestreept~~` |
| Automatische link | Kale URL's worden vanzelf een link |

Koppen (H1 tot en met H4) krijgen automatisch een anker en verschijnen in **Op
deze pagina** rechts, ingesprongen per niveau.

---

## Links tussen documenten

Verwijs naar het **bestand**, niet naar de URL. De link wordt omgezet naar een
route, zodat er geen volledige paginalading plaatsvindt:

```md
[Installatie](./aan-de-slag/installatie.md)
[Basis](../handleidingen/basis.md#lijsten)
[Vue](https://vuejs.org)
```

- Relatieve `.md`-links worden routes.
- Volgnummers (`10-`) worden er automatisch afgehaald.
- Een `#anker` blijft behouden.
- Externe links (met `https://`) blijven extern en openen in een nieuw tabblad.

`npm test` controleert of elke interne link op een bestaand document uitkomt.

---

## Wiskunde met KaTeX

Tussen enkele dollartekens blijft de formule in de regel staan, tussen dubbele
wordt het een gecentreerd blok:

```md
De oppervlakte van een cirkel is $A = \pi r^2$.

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

Een te brede formule schuift binnen zijn eigen kader; de pagina zelf schuift
nooit mee.

> **Belangrijk bij onderhoud**
> De KaTeX die de HTML maakt en de KaTeX-CSS moeten **dezelfde versie** zijn.
> Lopen ze uiteen, dan werken de grootteklassen niet meer en vallen exponenten,
> breuken en wortels uit hun plek. `katex` staat daarom vastgezet op de versie
> die de Markdown-plug-in gebruikt. Werk ze samen bij, nooit los.

---

## Codeblokken

Een gewoon codeblok met een taal erachter:

````md
```js
const resultaat = berekenIets()
```
````

Je krijgt automatisch:

- syntaxiskleuring,
- regelnummers in een eigen kolom die blijft staan tijdens horizontaal schuiven,
- een kopieerknop die **alleen de code** kopieert, zonder regelnummers,
- horizontaal schuiven bij lange regels.

Ondersteund zijn alle talen van `highlight.js/lib/common` (js, ts, python, bash,
json, css, html, sql, yaml, markdown, diff, java, go, rust, php, …). Daarbovenop
zijn deze aliassen ingesteld: `vue` en `svelte` → xml, `jsx` → javascript, `tsx`
→ typescript, `zsh`/`console` → bash, `jsonc` → json. `text` en `txt` geven
bewust ongekleurde tekst.

---

## Codegroepen

Meerdere varianten van dezelfde stap in tabbladen. Elke `===`-regel begint een
tabblad: het label links, de taal achter de `|`.

````md
```code-group
=== npm | bash
npm install
=== pnpm | bash
pnpm install
=== Docker | bash
docker run --rm -it node:20
```
````

Pijltjestoetsen wisselen van tabblad; de kopieerknop pakt het zichtbare tabblad.

---

## Interactieve berekeningen

Het blok `interactive` maakt van een paar regels een rekenmachientje.

````md
```interactive
title: Samengestelde rente
description: Optionele zin onder de kop.
inleg = 1000 | label: Inleg, min: 0, max: 20000, step: 100, prefix: $
rente = 5 | label: Rentepercentage, min: 0, max: 20, step: 0.1, suffix: %
jaren = 10 | label: Looptijd, min: 1, max: 40, step: 1
eindbedrag = inleg * (1 + rente / 100) ** jaren | label: Eindbedrag, prefix: $, decimals: 2
```
````

**De regel is simpel:** staat er rechts van het `=` een **getal**, dan wordt het
een invoerveld met schuifregelaar. Staat er een **expressie**, dan wordt het een
resultaat dat meteen meerekent.

| Optie | Voor | Betekenis |
|-------|------|-----------|
| `label` | beide | Tekst naast het veld of resultaat |
| `min`, `max`, `step` | invoer | Grenzen van veld en schuifregelaar |
| `slider: false` | invoer | Alleen een getalveld, geen schuifregelaar |
| `prefix`, `suffix` | beide | Tekst vóór en na de waarde |
| `decimals` | resultaat | Aantal decimalen (standaard `2`) |

De invoervelden hebben eigen plus- en minknoppen (de ingebouwde pijltjes van de
browser zijn uitgezet: die verschijnen pas bij hover en zijn op een telefoon
onbruikbaar). `prefix` en `suffix` hebben een vaste plek in het veld, zodat alle
getallen onder elkaar uitlijnen.

---

## Interactieve tabellen

````md
```interactive-table
title: Orderregels
filter: true
sort: true
| Artikel | Aantal* (min: 0, max: 50, step: 1) | Prijs* (min: 0, max: 500, slider: true) | Totaal = Aantal * Prijs (prefix: $) |
| Toetsenbord | 1 | 89.99 |
| Beeldscherm | 2 | 219.00 |
```
````

**Kolomsoorten**

| Kop | Soort |
|-----|-------|
| `Artikel` | Vaste tekstkolom |
| `Aantal*` | Bewerkbare getalkolom |
| `Totaal = Aantal * Prijs` | Berekende kolom |

- Opties staan tussen haakjes achter de kop: `Aantal* (min: 0, max: 50)`.
- Berekende kolommen mogen op elkaar voortbouwen.
- Klikken op een kop sorteert; het filterveld zoekt in alle kolommen.
- `filter: false` of `sort: false` zet die functies uit.
- Kolomnamen worden variabelen **zonder leestekens**: `Prijs per stuk` heet
  `Prijsperstuk` in een expressie.

Op smalle schermen schuift de tabel binnen zijn eigen kader; de pagina blijft
staan.

---

## Grafieken

Eén blok, drie toepassingen: meetpunten, een functieplotter, of allebei.

### Meetpunten met een fitlijn

````md
```plot
title: Examencijfer tegen studie-uren
x: 0..10 | label: Studie-uren
y: 40..100 | label: Examencijfer
points: 1,52 2,58 3,61 4,68
fit: linear | label: Kleinste-kwadratenlijn
editable: true
readout: fit_r2 | label: R², decimals: 4
```
````

Met `editable: true` mag de lezer punten **slepen**, toevoegen (tik op een lege
plek) en verwijderen (dubbelklik).

### Functies

````md
```plot
x: -6..6 | label: x
y: -2..2 | label: y
curve: sin(x) | label: sin(x)
curve: cos(x) | label: cos(x)
```
````

### Parameters

````md
```plot
amplitude = 2 | label: Amplitude, min: 0.1, max: 4, step: 0.1
curve: amplitude * sin(x) | label: Golf
```
````

**Alle regels op een rij**

| Regel | Betekenis |
|-------|-----------|
| `title:` / `description:` | Tekst boven de grafiek |
| `x:` / `y:` | Bereik `min..max` (optioneel) en `\| label:` voor de astitel |
| `points:` | Paren `x,y` gescheiden door spaties; mag over meerdere regels |
| `fit: linear` | Kleinste-kwadratenlijn door de punten |
| `editable: true` | Punten mogen gesleept, toegevoegd en verwijderd worden |
| `naam = 3` | Schuifregelaar, met `min` / `max` / `step` |
| `curve:` | Expressie van `x` en de regelaars; `residuals: true` tekent stippellijnen |
| `readout:` | Een getal onder de grafiek |

**Beschikbaar in `curve:` en `readout:` na `fit: linear`:** `fit_slope`,
`fit_intercept`, `fit_r2`, `fit_r`, `fit_sse`, `fit_n`, `fit_meanx`,
`fit_meany`.

**Gedrag dat je krijgt zonder er iets voor te doen**

- De hoogte staat vast en de breedte volgt de kolom: schuiven aan een parameter
  geeft nooit een sprong in de pagina.
- De y-as wordt bepaald door het **hele bereik** van elke schuifregelaar, niet
  door de huidige stand. Daardoor beweegt de curve terwijl de assen stilstaan.
- Maximaal twee eigen curves, zodat het kleurenpalet kleurenblind-veilig blijft.
- **Gegevens tonen** verschijnt alleen bij echte meetpunten, niet bij een
  functiegrafiek.
- **Herstellen** verschijnt alleen als er iets te herstellen valt (regelaars of
  bewerkbare punten).

---

## Python uitvoeren

Een `python-run`-blok is aanpasbaar en draait in de browser via Pyodide
(WebAssembly).

````md
```python-run
import pandas as pd

df = pd.DataFrame({"jaar": [2021, 2022], "omzet": [10, 14]})
table(df, title="Omzet")
plot(df["jaar"], df["omzet"], fit=True)
```
````

**Twee ingebouwde functies**

| Functie | Wat het doet |
|---------|--------------|
| `plot(x, y=None, label=…, fit=False, x_label=…, y_label=…, title=…)` | Tekent een grafiek met dezelfde component als een `plot`-blok |
| `table(data, title=…)` | Toont een pandas DataFrame, een dict of een lijst met dicts |

Ontbrekende waarden (`NaN`, `None`, `NaT`, `pd.NA`) worden een streepje `—`; ze
laten `table()` niet crashen. Punten met een ontbrekende waarde vallen uit
`plot()` weg.

**Pakketten** worden automatisch bijgeladen zodra de `import`-regel gezien wordt:
`pandas`, `numpy`, `matplotlib`, `scipy`, `sympy`, `statsmodels`,
`scikit-learn`.

**De editor** kleurt de code terwijl je typt, toont regelnummers, is met de greep
rechtsonder kleiner te slepen, en kopieert zonder nummers. **Herstellen**
verschijnt pas zodra je iets wijzigt.

### Tijdslimiet

Python draait in een **Web Worker**, los van de pagina. De site blijft daardoor
reageren tijdens het rekenen, en een script dat niet stopt kan van buitenaf
worden afgebroken:

```python
while True:
    pass
# → "Uitvoering gestopt: tijdslimiet bereikt (8 seconden)."
```

Na een tijdslimiet wordt de worker weggegooid en bij de volgende klik opnieuw
gestart. Uitvoer wordt afgekapt na 2000 regels, zodat een lus met veel `print`
de pagina niet plat legt. De limiet staat in `src/utils/python.js`
(`DEFAULT_TIMEOUT`).

### Wat Python wel en niet kan

De code draait in WebAssembly, in een worker zonder DOM:

| Wel | Niet |
|-----|------|
| Rekenen, pakketten uit Pyodide gebruiken | Bij de bestanden op je computer |
| `print()`, `plot()` en `table()` | Bij `localStorage`, cookies of de pagina |
| Een eigen bestandssysteem in het geheugen | Processen starten op de computer |
| Netwerk via de mogelijkheden van Pyodide | Willekeurige JavaScript uitvoeren |

Uitvoer wordt als **tekst** getoond, nooit als HTML: een script kan dus geen
knoppen of scripts in de pagina zetten.

---

## De expressietaal

`interactive`, `interactive-table` en `plot` delen dezelfde kleine
expressie-evaluator.

| Soort | Ondersteund |
|-------|-------------|
| Operatoren | `+` `-` `*` `/` `%` `**`, vergelijkingen, `voorwaarde ? a : b` |
| Constanten | `pi`, `e` |
| Functies | `abs` `ceil` `floor` `round` `sqrt` `exp` `log` `log2` `log10` `sin` `cos` `tan` `pow` `min` `max` |
| Variabelen | Andere velden in hetzelfde blok |

Verder is er **niets** bereikbaar. De evaluator maakt een boom van de expressie
en loopt die na; inhoud uit een document komt nooit bij `eval`, `Function` of de
DOM. Een onbekende naam of ongeldige expressie levert een streepje op, geen
foutmelding op de pagina.

---

## Hoe het systeem werkt

### Indeling

Drie kolommen: **zijbalk | inhoud | op deze pagina**. Alleen de middelste kolom
schuift met de pagina mee. De zijbalk en de inhoudsopgave staan er los naast en
krijgen pas een eigen schuifbalk als hun lijst langer is dan het scherm. De
pagina zelf schuift nooit (`overflow: clip`), zodat de navigatiebalk niet kan
wegglijden. Beide zijkolommen zijn los van elkaar in te klappen; de vrijgekomen
breedte gaat naar de tekst. Op mobiel wordt de zijbalk een lade achter de
menuknop en staat de inhoudsopgave ingeklapt boven de tekst.

### Van Markdown naar componenten

De kern zit in `src/utils/markdown.js`. Markdown wordt **niet** één HTML-string,
maar een lijst **blokken**:

```text
[ { type: 'html',  html: '<p>…</p>' },
  { type: 'code',  language: 'js', code: '…' },
  { type: 'plot',  source: '…' } ]
```

`MarkdownContent.vue` rendert gewone prosa met `v-html` en maakt van de andere
blokken echte Vue-componenten. Daardoor is de Vue-runtimecompiler niet nodig en
wordt documentinhoud nooit als code uitgevoerd.

### Bestandsoverzicht

```text
docs/                       Markdown-bronnen (de site)
COMPONENTEN.md              Dit document
smoke.mjs                   Controles (npm test)

src/
  App.vue                   Applicatieschil: kop, kolommen, mobiele lade
  main.js                   Opstart
  style.css                 Thema, prosa-opmaak, schuifbalken, invoervelden

  router/index.js           Routes uit docs/, basis uit BASE_URL

  views/
    DocPage.vue             Eén document
    NotFound.vue            Onbekende route

  components/
    Sidebar.vue             Navigatie uit de mappenstructuur
    SidebarFolder.vue       Eén map, inklapbaar (hele rij is de knop)
    TableOfContents.vue     "Op deze pagina", als kolom of ingeklapt
    ThemeToggle.vue         Licht/donker
    MarkdownContent.vue     Blokken → componenten
    CodeBlock.vue           Codeblok met regelnummers
    CodeGroup.vue           Tabbladen met code
    InteractiveExample.vue  ```interactive
    InteractiveTable.vue    ```interactive-table
    PlotChart.vue           ```plot
    PythonRunner.vue        ```python-run
    NumberField.vue         Getalveld met eigen plus/min

  utils/
    docs.js                 Bestanden vinden, routes en zijbalkboom
    markdown.js             markdown-it + KaTeX + highlight.js → blokken
    links.js                .md-link → route
    expression.js           Afgeschermde expressie-evaluator
    interactive.js          Lezers voor de blokken
    stats.js                Kleinste kwadraten, asverdeling
    python.js               Worker aansturen, tijdslimiet bewaken
    python.worker.js        Pyodide zelf (aparte thread)
```

### Thema

Licht/donker gebruikt Tailwinds `class`-strategie. De keuze staat in
`localStorage`; bij een eerste bezoek volgt de site de systeeminstelling. De
stand wordt gezet vóór het tekenen, dus er is geen flits van het verkeerde thema.
Grafiekkleuren zijn geen omgeklapte lichte kleuren maar eigen stappen voor de
donkere achtergrond, gecontroleerd op contrast en op onderscheid voor
kleurenblinde lezers.

---

## Een eigen component toevoegen

Drie stappen:

1. **Maak het component** in `src/components/MijnBlok.vue`. Het krijgt de inhoud
   van het codeblok binnen als `source`:

   ```vue
   <script setup>
   defineProps({ source: { type: String, required: true } })
   </script>
   ```

2. **Koppel de bloknaam aan een bloktype** in `src/utils/markdown.js`:

   ```js
   const COMPONENT_FENCES = {
     interactive: 'interactive',
     'interactive-table': 'interactive-table',
     plot: 'plot',
     'code-group': 'code-group',
     'python-run': 'python',
     'mijn-blok': 'mijn-blok'   // nieuw
   }
   ```

3. **Render het bloktype** in `src/components/MarkdownContent.vue`:

   ```vue
   <MijnBlok v-else-if="block.type === 'mijn-blok'" :source="block.source" />
   ```

Daarna werkt dit in elk document:

````md
```mijn-blok
wat je maar wilt
```
````

**Richtlijnen**

- Zet `doc-block not-prose` op de buitenste `div`; dan houdt het component zijn
  eigen randen en ruimte, los van de prosa-opmaak.
- Gebruik de bestaande klassen `doc-button`, `doc-button-primary`, `doc-field`,
  `doc-range` en `doc-scroll-x`, dan klopt het thema vanzelf.
- Reken met `compile()` uit `utils/expression.js` in plaats van `eval`.
- Zorg dat breed materiaal binnen zijn eigen kader schuift (`doc-scroll-x`), niet
  de pagina.

---

## Ontwikkelen, testen en uitrollen

### Testen

`npm test` draait `smoke.mjs`: de expressie-evaluator, het omzetten van links,
de kopjeshiërarchie, de regressiewiskunde, de syntaxiskleuring, én álle
documenten in `docs/` (elk interactief blok wordt gelezen en elke expressie
gecompileerd, elke interne link moet bestaan).

Draai dit na elke wijziging aan `docs/` — een typefout in een `plot`- of
`interactive`-blok valt er meteen door.

### Uitrollen

`npm run build` schrijft een volledig statische bundel naar `dist/`. Er is geen
serveronderdeel.

Twee dingen om op te letten:

1. **De basis-URL.** Staat de site niet in de root van het domein, zet dan `base`
   in `vite.config.js` (bijvoorbeeld `'/documentatie/'`). De router leest
   dezelfde waarde via `import.meta.env.BASE_URL`; laat je dat los lopen, dan
   valt de startpagina buiten alle routes en zie je "pagina niet gevonden".

2. **Terugvallen op `index.html`.** De routering gebruikt de History API. Stel de
   host zo in dat onbekende paden terugvallen op `index.html` (`_redirects` bij
   Netlify, `try_files` bij nginx). Bij GitHub Pages regelt de workflow in
   `.github/workflows/` dit.

### Internet

De site werkt zonder internetverbinding, met één uitzondering: **Python**. De
Pyodide-runtime wordt bij de eerste klik op **Uitvoeren** van een CDN gehaald.
Alle andere onderdelen — wiskunde, grafieken, tabellen, berekeningen — draaien
volledig lokaal.
