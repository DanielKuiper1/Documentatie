# Lineaire regressie

Lineaire regressie legt een **rechte lijn door een puntenwolk**, zó dat de
verticale afstanden tot die lijn zo klein mogelijk zijn. Het is het eenvoudigste
regressiemodel dat er is, en tegelijk het model waarmee je de meeste andere
begrijpt.

$$
\hat{y} = a x + b
$$

Twee parameters, meer niet:

- **$a$, de helling** — hoeveel $y$ verandert als $x$ met één eenheid stijgt.
  Dit is de inhoudelijke conclusie van je model.
- **$b$, het snijpunt** — de voorspelling bij $x = 0$. Vaak betekenisloos op
  zichzelf (een huis van 0 m²), maar noodzakelijk om de lijn op de goede hoogte
  te leggen.

## Zelf de lijn leggen

Hieronder staan studie-uren tegen examencijfers. Schuif aan de helling en het
snijpunt en probeer de som van kwadratische fouten (SSE) zo klein mogelijk te
krijgen. De gestippelde lijn is de wiskundig optimale oplossing.

```plot
title: Studie-uren versus examencijfer
description: Sleep de punten om de data te veranderen, en schuif aan a en b om je eigen lijn te leggen.
x: 0..11 | label: Studie-uren
y: 30..100 | label: Examencijfer
points: 1,52 2,55 3,61 4,64 5,72 6,70 7,79 8,84 9,88 10,91
editable: true
fit: true | label: Kleinste-kwadratenlijn
a = 4 | label: Jouw helling a, min: -2, max: 10, step: 0.1
b = 48 | label: Jouw snijpunt b, min: 0, max: 90, step: 1
curve: a * x + b | label: Jouw lijn, residuals: true
readout: fit_slope | label: Beste helling, decimals: 3
readout: fit_intercept | label: Beste snijpunt, decimals: 3
readout: fit_r2 | label: R2 van de beste lijn, decimals: 4
readout: fit_sse | label: SSE van de beste lijn, decimals: 2
```

De verticale streepjes zijn de **residuen**: $e_i = y_i - \hat{y}_i$, het stukje
dat je lijn ernaast zit. Kleinste-kwadratenregressie minimaliseert de som van hun
kwadraten.

## Wat "beste lijn" precies betekent

De loss is de [som van kwadratische fouten](../metrics/loss-functies.md):

$$
\text{SSE}(a, b) = \sum_{i=1}^{n} \big(y_i - (a x_i + b)\big)^2
$$

Kwadrateren doet drie dingen tegelijk. Het maakt fouten omhoog en omlaag
gelijkwaardig, het maakt de functie glad genoeg om te differentiëren, en het
straft grote fouten onevenredig zwaar. Dat laatste is een keuze met gevolgen —
zie [MSE of MAE?](../metrics/mse-of-mae.md).

Omdat SSE een nette kwadratische functie van $a$ en $b$ is, is er precies één
minimum, en dat is gewoon op te lossen:

$$
a = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}
\qquad
b = \bar{y} - a\bar{x}
$$

Lineaire regressie hoeft dus niet iteratief getraind te worden. De formule geeft
het antwoord in één keer — een luxe die vrijwel geen ander model heeft.

Merk ook op wat de tweede formule zegt: de lijn gaat **altijd** door het punt
$(\bar{x}, \bar{y})$, het zwaartepunt van de data.

## Zelf uitrekenen

```python-run
import numpy as np

uren   = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
cijfer = np.array([52, 55, 61, 64, 72, 70, 79, 84, 88, 91], dtype=float)

# De formules van hierboven, letterlijk.
dx = uren - uren.mean()
dy = cijfer - cijfer.mean()

a = (dx * dy).sum() / (dx ** 2).sum()
b = cijfer.mean() - a * uren.mean()

voorspeld = a * uren + b
residuen = cijfer - voorspeld

print(f"helling  a = {a:.4f}  -> een uur extra geeft {a:.2f} punt")
print(f"snijpunt b = {b:.4f}")
print(f"SSE        = {(residuen ** 2).sum():.2f}")
print(f"RMSE       = {np.sqrt((residuen ** 2).mean()):.2f} punt")

plot(uren, cijfer, label="waarnemingen", fit=True,
     x_label="studie-uren", y_label="cijfer", title="Kleinste kwadraten")
```

In de praktijk gebruik je scikit-learn, dat exact hetzelfde uitrekent:

```code-group
=== scikit-learn | python
from sklearn.linear_model import LinearRegression

model = LinearRegression().fit(uren.reshape(-1, 1), cijfer)
print(model.coef_[0], model.intercept_)
=== numpy | python
# polyfit met graad 1 is dezelfde kleinste-kwadratenoplossing
a, b = np.polyfit(uren, cijfer, deg=1)
=== met de hand | python
dx = uren - uren.mean()
dy = cijfer - cijfer.mean()
a = (dx * dy).sum() / (dx ** 2).sum()
b = cijfer.mean() - a * uren.mean()
```

## Meer dan één feature

Met meerdere kenmerken wordt de lijn een vlak, en daarna een hypervlak dat je
niet meer kunt tekenen. De formule verandert nauwelijks:

$$
\hat{y} = b + a_1 x_1 + a_2 x_2 + \dots + a_p x_p
$$

Elke $a_j$ is nu een **partieel effect**: hoeveel $y$ verandert als $x_j$ met één
stijgt *en alle andere features gelijk blijven*. Die laatste voorwaarde wordt
constant vergeten, en is precies waar interpretatie misgaat als features onderling
samenhangen.

```interactive
title: Huisprijs met drie kenmerken
description: Een lineair model is optelbaar: elk kenmerk levert zijn eigen bijdrage, los van de rest.
opp = 100 | label: Oppervlakte (m2), min: 20, max: 300, step: 5
kamers = 4 | label: Aantal kamers, min: 1, max: 10, step: 1
leeftijd = 20 | label: Leeftijd woning (jaar), min: 0, max: 120, step: 1
basis = 45000 | label: Basisprijs b, min: 0, max: 200000, step: 5000
bijdrage_opp = opp * 2500 | label: Bijdrage oppervlakte, prefix: EUR , decimals: 0
bijdrage_kamers = kamers * 9000 | label: Bijdrage kamers, prefix: EUR , decimals: 0
bijdrage_leeftijd = leeftijd * -800 | label: Bijdrage leeftijd, prefix: EUR , decimals: 0
prijs = basis + opp * 2500 + kamers * 9000 + leeftijd * -800 | label: Voorspelde prijs, prefix: EUR , decimals: 0
```

Let op de negatieve coëfficiënt bij leeftijd: elk jaar ouder kost € 800. Dat een
coëfficiënt negatief mag zijn is de reden dat je hem niet als "belang" moet
lezen — het is een richting én een grootte.

## De aannames, en hoe ze breken

Lineaire regressie werkt goed zolang vier dingen kloppen. Ze breken vaker dan je
denkt.

| Aanname | Wat er misgaat | Hoe je het ziet |
|---------|----------------|-----------------|
| **Lineariteit** | Het verband is krom | Residuen vormen een boog in plaats van een wolk |
| **Onafhankelijkheid** | Metingen hangen samen (tijdreeks!) | Residuen volgen elkaar op in golven |
| **Gelijke spreiding** | De fout groeit met $x$ | Residuenplot waaiert uit als een trechter |
| **Geen extreme uitschieters** | Eén punt trekt de hele lijn | Zie [MSE of MAE?](../metrics/mse-of-mae.md) |

De residuenplot is het diagnosemiddel voor alle vier: zet residuen tegen de
voorspelling uit, en je hoort een structuurloze wolk te zien. Zie je een patroon,
dan zit er informatie in de data die je model niet heeft opgepikt.

```python-run
import numpy as np

rng = np.random.default_rng(3)
x = np.linspace(0, 10, 60)
# Het echte verband is krom, maar we passen er een rechte lijn op.
y = 2 + 0.5 * x ** 2 + rng.normal(0, 2, x.size)

a, b = np.polyfit(x, y, deg=1)
residuen = y - (a * x + b)

plot(x, residuen, label="residuen", x_label="x", y_label="y - y-dak",
     title="Residuenplot: de boog verraadt een krom verband")
```

De boog in die plot is de diagnose. De oplossing is niet "meer data", maar een
model dat kromming aankan — bijvoorbeeld door $x^2$ als extra feature toe te
voegen. Dat mag: het model blijft *lineair in de parameters*, ook als het krom is
in $x$.

## Regularisatie in één alinea

Met veel features gaat kleinste kwadraten overfitten: het model geeft enorme
coëfficiënten die elkaar bijna opheffen. **Ridge** ($L_2$) en **lasso** ($L_1$)
tellen een straf voor grote coëfficiënten bij de loss op:

$$
L_{\text{ridge}} = \text{SSE} + \lambda \sum a_j^2
\qquad
L_{\text{lasso}} = \text{SSE} + \lambda \sum |a_j|
$$

Ridge krimpt alle coëfficiënten richting nul; lasso zet er een aantal exact op
nul en doet daarmee automatisch featureselectie. $\lambda$ kies je met
kruisvalidatie, niet op gevoel.

De volledige uitleg — waarom lasso wél nul geeft en ridge niet, waarom je moet
standaardiseren, en hoe je $\lambda$ kiest — staat in
[Ridge en lasso](./ridge-en-lasso.md).

## Onthoud

- Twee parameters, één analytische oplossing, geen iteratie nodig.
- De coëfficiënt is een partieel effect — "alle andere features gelijk".
- Kijk altijd naar de residuenplot; die vertelt je meer dan R² alleen.

Verder: [logistische regressie](./logistische-regressie.md) voor als $y$ een
label is, of [R²](../metrics/r-kwadraat.md) om te beoordelen of je lijn goed
genoeg is.
