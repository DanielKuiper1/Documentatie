# Geavanceerd

Twee soorten codeblokken maken van een document iets waar je aan kunt draaien.
Beide rekenen volledig in de browser, met een kleine afgeschermde evaluator —
nooit `eval()`.

## Interactieve voorbeelden

Regels die een getal toekennen worden invoervelden; regels die een expressie
toekennen worden live resultaten.

```interactive
title: Maandlast van een lening
principal = 25000 | label: Leenbedrag, min: 1000, max: 100000, step: 500, prefix: $
rate = 6.5 | label: Rente per jaar, min: 0.1, max: 20, step: 0.1, suffix: %
years = 5 | label: Looptijd in jaren, min: 1, max: 30, step: 1
monthly = principal * (rate / 1200) / (1 - (1 + rate / 1200) ** (0 - years * 12)) | label: Maandlast, prefix: $
total = principal * (rate / 1200) / (1 - (1 + rate / 1200) ** (0 - years * 12)) * years * 12 | label: Totaal terugbetaald, prefix: $
```

Expressies mogen `+ - * / % **` gebruiken, vergelijkingen, `a ? b : c`,
haakjes, de constanten `pi` en `e`, en de functies `abs ceil floor round sqrt
exp log log2 log10 sin cos tan pow min max`.

```interactive
title: Worpafstand
speed = 20 | label: Beginsnelheid, min: 1, max: 60, step: 1, suffix: m/s
angle = 45 | label: Hoek, min: 1, max: 89, step: 1, suffix: °
range = speed ** 2 * sin(2 * angle * pi / 180) / 9.81 | label: Afstand, suffix:  m
height = speed ** 2 * sin(angle * pi / 180) ** 2 / (2 * 9.81) | label: Hoogste punt, suffix:  m
```

## Interactieve tabellen

Zet een `*` achter een kolomnaam om hem bewerkbaar te maken, of schrijf
`Naam = expressie` om hem te laten rekenen. Klik op een kop om te sorteren en
gebruik het filterveld om rijen te zoeken.

```interactive-table
title: Orderregels
| Artikel | Aantal* (min: 0, max: 50, step: 1) | Prijs* (min: 0, max: 500, step: 0.5) | Totaal = Aantal * Prijs (prefix: $) |
| Toetsenbord | 1 | 89.99 |
| Beeldscherm | 2 | 219.00 |
| Kabel | 3 | 12.50 |
| Bureaumat | 1 | 34.95 |
```

Berekende kolommen mogen op elkaar voortbouwen, en schuifregelaars zet je per
kolom aan:

```interactive-table
title: Marge per product
| Product | Kostprijs* (max: 200) | Prijs* (max: 400, slider: true) | Marge = Prijs - Kostprijs (prefix: $) | Percentage = (Prijs - Kostprijs) / Prijs * 100 (suffix: %, decimals: 1) |
| Alfa | 40 | 100 |
| Beta | 120 | 180 |
| Gamma | 15 | 60 |
```

## Grafieken

Het `plot`-blok tekent een grafiek met schuifregelaars en kan er een
kleinste-kwadratenlijn doorheen leggen. Daar is een eigen pagina voor:
[lineaire regressie](./lineaire-regressie.md).

```plot
title: Een curve met een knop
x: -6..6 | label: x
amplitude = 2 | label: Amplitude, min: 0.1, max: 4, step: 0.1
frequency = 1 | label: Frequentie, min: 0.2, max: 3, step: 0.1
curve: amplitude * sin(frequency * x) | label: amplitude · sin(frequentie · x)
```

## Zelf componenten toevoegen

`src/components/MarkdownContent.vue` koppelt bloktypes aan Vue-componenten, en
`COMPONENT_FENCES` in `src/utils/markdown.js` koppelt de naam van een codeblok
aan een bloktype. Een nieuw type — een kaart, een quiz — is die twee
aanpassingen plus een component.

Een volledig overzicht met voorbeelden staat op
[componenten](../componenten.md).
