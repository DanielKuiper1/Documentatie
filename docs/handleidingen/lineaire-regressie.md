# Lineaire regressie

Het `plot`-blok tekent een grafiek vanuit Markdown. Het kan meetpunten
uitzetten, er een kleinste-kwadratenlijn doorheen leggen en curves tonen die
aan schuifregelaars hangen — allemaal opnieuw berekend in de browser.

## Een lijn door de meetpunten

Sleep een punt, tik op een lege plek om er een toe te voegen, of dubbelklik om
er een te verwijderen. De lijn en alle getallen eronder volgen meteen.

```plot
title: Examencijfer tegen studie-uren
description: Kleinste kwadraten, opnieuw berekend bij elke wijziging.
x: 0..10 | label: Studie-uren
y: 40..100 | label: Examencijfer
points: 1,52 2,58 3,61 4,68 5,70 6,79 7,80 8,88 9,91
fit: linear | label: Kleinste-kwadratenlijn
editable: true
readout: fit_slope | label: Richtingscoëfficiënt, decimals: 3
readout: fit_intercept | label: Snijpunt met de y-as, decimals: 3
readout: fit_r2 | label: R², decimals: 4
```

De lijn minimaliseert de som van de kwadratische afwijkingen,

$$
\text{SSE} = \sum_{i=1}^{n} \bigl(y_i - (mx_i + b)\bigr)^2
$$

met als oplossing

$$
m = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}
\qquad
b = \bar{y} - m\bar{x}
$$

## Zelf een lijn leggen

Probeer nu de kleinste kwadraten te verslaan. De stippellijnen zijn de
afwijkingen van *jouw* lijn, en de twee kwadratische fouten laten zien hoe dicht
je erbij zit — het getal van de berekende lijn is het laagste dat een rechte
lijn kan halen.

```plot
title: Kun jij de kleinste kwadraten verslaan?
x: 0..10 | label: Studie-uren
y: 40..100 | label: Examencijfer
points: 1,52 2,58 3,61 4,68 5,70 6,79 7,80 8,88 9,91
fit: linear | label: Kleinste-kwadratenlijn
slope = 3 | label: Jouw richtingscoëfficiënt (m), min: 0, max: 10, step: 0.05
intercept = 55 | label: Jouw snijpunt (b), min: 30, max: 80, step: 0.5
curve: slope * x + intercept | label: Jouw lijn, residuals: true
readout: slope - fit_slope | label: Afwijking richtingscoëfficiënt, decimals: 3
readout: intercept - fit_intercept | label: Afwijking snijpunt, decimals: 3
```

## Niet alleen rechte lijnen

Een curve is elke expressie van `x` en de schuifregelaars, dus hetzelfde blok
dekt ook veeltermen en niet-lineaire modellen.

```plot
title: Kwadratisch tegen lineair
x: -1..6 | label: x
points: 0,1.1 1,1.9 2,4.2 3,9.1 4,15.8 5,25.3
fit: linear | label: Lineaire fit
a = 1 | label: a (x²), min: -2, max: 3, step: 0.05
b = 0 | label: b (x), min: -5, max: 5, step: 0.1
c = 1 | label: c, min: -5, max: 5, step: 0.5
curve: a * x ** 2 + b * x + c | label: a·x² + b·x + c, residuals: true
```

## Syntaxis

| Regel | Betekenis |
|-------|-----------|
| `title:` / `description:` | Tekst boven de grafiek |
| `x:` / `y:` | Bereik `min..max` (optioneel) en `\| label:` voor de astitel |
| `points:` | Paren `x,y` gescheiden door spaties; mag over meerdere regels |
| `fit: linear` | Teken de kleinste-kwadratenlijn door de punten |
| `editable: true` | Lezers mogen punten slepen, toevoegen en verwijderen |
| `naam = 3` | Een schuifregelaar, met `min` / `max` / `step` |
| `curve:` | Expressie van `x` en de regelaars; `residuals: true` tekent stippellijnen |
| `readout:` | Een getal onder de grafiek |

De berekende lijn stelt `fit_slope`, `fit_intercept`, `fit_r2`, `fit_r`,
`fit_sse`, `fit_n`, `fit_meanx` en `fit_meany` beschikbaar aan elke `curve:` en
`readout:` in hetzelfde blok. Het aantal curves is beperkt tot twee, zodat het
kleurenpalet kleurenblind-veilig blijft; elke grafiek heeft bovendien een
legenda, een tabelweergave en aflezing bij aanwijzen.

Zie [geavanceerd](./geavanceerd.md) voor de andere interactieve blokken.
