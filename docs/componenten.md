# Componenten

Elk onderdeel dat je in een document kunt gebruiken, met de syntaxis erboven en
een werkend voorbeeld eronder. Alles draait in de browser; er is geen server.

## Markdown

Gewone Markdown werkt zoals je verwacht: **vet**, *cursief*, `code`, lijsten,
citaten, tabellen en scheidingslijnen. De volledige rondleiding staat op
[basis](./handleidingen/basis.md).

| Wat | Syntaxis |
|-----|----------|
| Vet | `**vet**` |
| Cursief | `*cursief*` |
| Code | `` `code` `` |
| Takenlijst | `- [x] klaar` |

## Interne links

Verwijs naar een ander document met een gewone relatieve link naar het
`.md`-bestand. Die wordt omgezet naar een route, zodat er niet opnieuw geladen
wordt.

```md
[Installatie](./aan-de-slag/installatie.md)
[Basis](../handleidingen/basis.md#lijsten)
[Vue](https://vuejs.org)
```

Volgnummers in bestandsnamen verdwijnen uit de URL: `installatie.md` wordt
`/aan-de-slag/installatie`. Externe links openen in een nieuw tabblad.

## Wiskunde

Tussen enkele dollartekens blijft wiskunde in de regel staan, tussen dubbele
wordt het een gecentreerd blok.

```md
De oppervlakte van een cirkel is $A = \pi r^2$.

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

De oppervlakte van een cirkel is $A = \pi r^2$.

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Een brede formule schuift binnen zijn eigen kader, niet over de hele pagina:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi} \qquad \sum_{i=1}^{n} i = \frac{n(n+1)}{2} \qquad \prod_{i=1}^{n} i = n! \qquad \varphi = \frac{1 + \sqrt{5}}{2}
$$

## Codeblokken

Een gewoon codeblok krijgt kleuren, regelnummers, een kopieerknop en schuift
horizontaal bij lange regels. De nummers staan in een eigen kolom die tijdens
het schuiven blijft staan en niet meekopieert: de kopieerknop levert precies
de broncode.

````md
```js
const resultaat = berekenIets()
console.log(resultaat)
```
````

```js
const items = [
  { naam: 'Toetsenbord', prijs: 89.99, aantal: 1 },
  { naam: 'Beeldscherm', prijs: 219.0, aantal: 2 }
]

const totaal = items.reduce((som, item) => som + item.prijs * item.aantal, 0)
console.log(`Totaal: ${totaal.toFixed(2)}`)
```

## Codegroepen

Meerdere varianten van dezelfde stap in tabbladen. Elke `===`-regel begint een
tabblad: het label links, de taal achter de `|`. Pijltjestoetsen wisselen.

````md
```code-group
=== npm | bash
npm install
=== pnpm | bash
pnpm install
```
````

```code-group
=== npm | bash
npm install
npm run dev
=== pnpm | bash
pnpm install
pnpm dev
=== Docker | bash
docker run --rm -it -v "$(pwd)":/app -w /app node:20 sh -c "npm ci && npm run dev"
```

## Interactieve berekeningen

Een regel met een getal wordt een invoerveld met schuifregelaar; een regel met
een expressie wordt een resultaat dat meteen meerekent.

````md
```interactive
title: Samengestelde rente
principal = 1000 | label: Inleg, min: 0, max: 20000, step: 100, prefix: $
rate = 5 | label: Rente, min: 0, max: 20, step: 0.1, suffix: %
amount = principal * (1 + rate / 100) ** 10 | label: Eindbedrag, prefix: $
```
````

```interactive
title: Samengestelde rente
description: Verander een waarde en het eindbedrag verandert mee.
principal = 1000 | label: Inleg, min: 0, max: 20000, step: 100, prefix: $
rate = 5 | label: Rentepercentage, min: 0, max: 20, step: 0.1, suffix: %
years = 10 | label: Looptijd in jaren, min: 1, max: 40, step: 1
amount = principal * (1 + rate / 100) ** years | label: Eindbedrag, prefix: $, decimals: 2
interest = principal * (1 + rate / 100) ** years - principal | label: Waarvan rente, prefix: $, decimals: 2
```

| Optie | Voor | Betekenis |
|-------|------|-----------|
| `label` | beide | Tekst naast het veld of resultaat |
| `min`, `max`, `step` | invoer | Grenzen van veld en schuifregelaar |
| `slider: false` | invoer | Alleen een getalveld, geen schuifregelaar |
| `prefix`, `suffix` | beide | Tekst vóór en na de waarde |
| `decimals` | resultaat | Aantal decimalen (standaard `2`) |

## Interactieve tabellen

Een `*` achter een kolomnaam maakt hem bewerkbaar, `Naam = expressie` maakt hem
berekend. Klikken op een kop sorteert; het filterveld zoekt in alle kolommen.

````md
```interactive-table
| Artikel | Aantal* | Prijs* | Totaal = Aantal * Prijs (prefix: $) |
| Kabel | 3 | 12.50 |
```
````

```interactive-table
title: Orderregels
| Artikel | Aantal* (min: 0, max: 50, step: 1) | Prijs* (min: 0, max: 500, step: 0.5, slider: true) | Totaal = Aantal * Prijs (prefix: $) |
| Toetsenbord | 1 | 89.99 |
| Beeldscherm | 2 | 219.00 |
| Kabel | 3 | 12.50 |
```

Kolomnamen worden variabelen zonder leestekens: `Prijs per stuk` heet
`Prijsperstuk` in een expressie.

## Grafieken

Meetpunten uitzetten en er een lijn doorheen leggen. Met `editable: true` mogen
lezers punten slepen, toevoegen (tik op een lege plek) en verwijderen
(dubbelklik).

````md
```plot
x: 0..10 | label: Studie-uren
points: 1,52 2,58 3,61
fit: linear | label: Kleinste-kwadratenlijn
editable: true
readout: fit_r2 | label: R², decimals: 4
```
````

```plot
title: Examencijfer tegen studie-uren
x: 0..10 | label: Studie-uren
y: 40..100 | label: Examencijfer
points: 1,52 2,58 3,61 4,68 5,70 6,79 7,80 8,88 9,91
fit: linear | label: Kleinste-kwadratenlijn
editable: true
readout: fit_slope | label: Richtingscoëfficiënt, decimals: 3
readout: fit_r2 | label: R², decimals: 4
```

De volledige uitleg staat op
[lineaire regressie](./handleidingen/lineaire-regressie.md).

## Functiegrafieken

Zonder `points:` is hetzelfde blok een functieplotter. Een `curve:` is elke
expressie van `x`.

````md
```plot
x: -6..6 | label: x
curve: sin(x) | label: sin(x)
```
````

```plot
title: Twee functies
x: -6..6 | label: x
y: -2..2 | label: y
curve: sin(x) | label: sin(x)
curve: cos(x) | label: cos(x)
```

## Schuifregelaars en parameters

Zet een parameter in de grafiek en de curve beweegt terwijl de assen blijven
staan.

````md
```plot
x: -6..6
amplitude = 2 | label: Amplitude, min: 0.1, max: 4, step: 0.1
curve: amplitude * sin(frequentie * x)
```
````

```plot
title: amplitude · sin(frequentie · x + fase)
x: -6..6 | label: x
amplitude = 2 | label: Amplitude, min: 0.1, max: 4, step: 0.1
frequentie = 1 | label: Frequentie, min: 0.2, max: 3, step: 0.1
fase = 0 | label: Fase, min: -3.2, max: 3.2, step: 0.1
curve: amplitude * sin(frequentie * x + fase) | label: Golf
```

Dezelfde regelaars werken in `interactive`-blokken en in de kolommen van een
interactieve tabel.

## Interactieve Python

Een `python-run`-blok is aanpasbaar en draait in de browser via Pyodide
(WebAssembly). De runtime wordt pas bij de eerste klik op **Uitvoeren**
opgehaald, dus de pagina blijft licht.

````md
```python-run
totaal = sum(range(1, 101))
print("Som 1..100:", totaal)
```
````

```python-run
totaal = sum(range(1, 101))
print("Som 1..100:", totaal)

for n in range(1, 6):
    print(n, "kwadraat is", n ** 2)
```

> De eerste keer duurt het laden een paar seconden en er is internet nodig; daarna
> delen alle blokken op de pagina dezelfde runtime.

De editor kleurt de code terwijl je typt, toont regelnummers en is met de greep
rechtsonder kleiner of groter te slepen. De nummers schuiven mee, blijven altijd
zichtbaar en houden de editor niet onnodig groot. Kopiëren levert alleen de
code, zonder nummers.

### Tijdslimiet

Python draait in een **Web Worker**, los van de pagina. Daardoor blijft de site
reageren tijdens het rekenen, en kan een script dat niet stopt van buitenaf
worden afgebroken. Na acht seconden gebeurt dat automatisch:

```python-run
# Stopt vanzelf: "Uitvoering gestopt: tijdslimiet bereikt."
while True:
    pass
```

De worker wordt daarna weggegooid en bij de volgende klik opnieuw gestart, dus
je kunt meteen weer verder. Uitvoer wordt afgekapt na 2000 regels, zodat een
lus met veel `print` de pagina niet plat legt.

### Wat Python wel en niet kan

De code draait in WebAssembly, in een worker zonder DOM:

| Wel | Niet |
|-----|------|
| Rekenen, pakketten uit Pyodide gebruiken | Bij de bestanden op je computer |
| `print()`, `plot()` en `table()` | Bij `localStorage`, cookies of de pagina |
| Een eigen, tijdelijk bestandssysteem in het geheugen | Processen starten op de computer |
| Netwerk via de mogelijkheden van Pyodide | Willekeurige JavaScript in de pagina uitvoeren |

Alleen `plot()` en `table()` zijn extra toegevoegd, en dat zijn gewone
Python-functies die een lijstje vullen. Uitvoer wordt als tekst getoond, nooit
als HTML: een script kan dus geen knoppen of scripts in de pagina zetten.

## pandas

Importeer pandas gewoon; het pakket wordt automatisch bijgeladen zodra de
`import`-regel gezien wordt.

```python-run
import pandas as pd

df = pd.DataFrame({
    "jaar": [2020, 2021, 2022, 2023],
    "omzet": [120, 145, 190, 210],
})
df["groei"] = (df["omzet"].pct_change() * 100).round(1)

print(df.describe())
table(df, title="Omzet per jaar")
```

## Python naar grafieken en tabellen

Binnen een `python-run`-blok bestaan twee extra functies:

| Functie | Wat het doet |
|---------|--------------|
| `plot(x, y, label=..., fit=True, x_label=..., y_label=..., title=...)` | Tekent een grafiek met dezelfde component als `plot`-blokken |
| `table(data, title=...)` | Toont een DataFrame, een dict of een lijst met dicts als tabel |

```python-run
import pandas as pd

df = pd.DataFrame({
    "studie_uren": [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "cijfer": [52, 58, 61, 68, 70, 79, 80, 88, 91],
})

table(df, title="Meetgegevens")
plot(
    df["studie_uren"],
    df["cijfer"],
    fit=True,
    x_label="Studie-uren",
    y_label="Examencijfer",
    title="Regressie berekend in Python",
)
```

De teruggegeven grafiek is een gewone grafiekcomponent: legenda, aflezing bij
aanwijzen en de tabelweergave werken er allemaal in.

## Donkere modus

De schakelaar rechtsboven wisselt tussen licht en donker. De keuze staat in
`localStorage`; bij een eerste bezoek volgt de site de systeeminstelling, en de
stand wordt vóór het tekenen gezet, dus je ziet geen flits van het verkeerde
thema.

Alles hierboven is voor beide thema's apart ingesteld — tekst, randen,
codekleuren, wiskunde, tabellen, schuifregelaars en de grafieken. De
grafiekkleuren zijn geen omgeklapte lichte kleuren maar eigen stappen voor de
donkere achtergrond, gecontroleerd op contrast en op onderscheid voor
kleurenblinde lezers.

| Onderdeel | Licht | Donker |
|-----------|-------|--------|
| Meetpunten en fitlijn | `#2a78d6` | `#3987e5` |
| Tweede reeks | `#eb6834` | `#d95926` |
| Derde reeks | `#1baf7a` | `#199e70` |

Wil je een eigen kleur gebruiken in een component, gebruik dan een
CSS-variabele die in beide thema's gedefinieerd is, zoals de componenten
hierboven doen.

## Indeling en schuiven

De site bestaat uit drie kolommen: **zijbalk | inhoud | op deze pagina**.
Alleen de middelste kolom schuift met de pagina mee. De zijbalk en de
inhoudsopgave blijven staan en krijgen pas een eigen schuifbalk als hun lijst
langer is dan het scherm. De pagina zelf schuift nooit, dus de navigatiebalk
kan niet wegglijden.

Beide zijkolommen zijn los van elkaar in te klappen; de vrijgekomen breedte
gaat naar de tekst. De stand wordt onthouden.

## Navigatie

- De **zijbalk** volgt de mappen in `docs/`. Klik op een maprij om hem open of
  dicht te klappen; de hele rij is de knop. De stand blijft bewaard.
- Met de knop links in de kop klap je de zijbalk helemaal weg; de tekst gebruikt
  dan de vrijgekomen ruimte.
- **Op deze pagina** rechts volgt de kopjes van H1 tot H4, springt per niveau in
  en markeert het kopje waar je bent. Ook die kolom is in te klappen.
- Beide kolommen blijven staan tijdens het scrollen en schuiven zelfstandig als
  hun inhoud langer is dan het scherm.
- Op mobiel wordt de zijbalk een lade achter de menuknop en staat "Op deze
  pagina" ingeklapt boven de tekst.

## Een eigen component toevoegen

1. Maak een component in `src/components/`.
2. Koppel een naam aan een bloktype in `COMPONENT_FENCES` in
   `src/utils/markdown.js`.
3. Render dat bloktype in `src/components/MarkdownContent.vue`.

Meer over de opbouw staat op [referentie](./referentie.md).
