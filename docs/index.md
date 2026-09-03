# Lineaire regressie

Lineaire regressie is het eenvoudigste model uit machine learning en meteen het
model waar alle andere op voortbouwen: je legt een rechte lijn door een
puntenwolk en gebruikt die lijn om te voorspellen. Deze pagina behandelt wat het
model doet, welke varianten er zijn, hoe het getraind wordt, welke formules
daarbij horen, waar het sterk en zwak in is, en met welke maatstaven je het
beoordeelt.

Alle grafieken en berekeningen hieronder zijn interactief: schuif aan de
parameters, sleep meetpunten en voer de Python-voorbeelden uit.

## Machine learning in drie categorieën

Voordat we bij regressie zijn, eerst de plaats die het inneemt. Machine learning
wordt gewoonlijk in drie categorieën verdeeld, en het onderscheid zit in wat het
model tijdens het leren te zien krijgt.

| Categorie | Wat krijgt het model? | Wat leert het? | Voorbeelden |
|-----------|----------------------|----------------|-------------|
| **Supervised learning** | Kenmerken **en** het juiste antwoord (gelabelde data) | Het verband tussen invoer en antwoord | Lineaire regressie, beslisbomen, k-NN, neurale netwerken |
| **Unsupervised learning** | Alleen kenmerken, geen antwoorden | Structuur en groepen in de data | k-means, hiërarchisch clusteren, PCA |
| **Reinforcement learning** | Een omgeving die beloont of straft | Een strategie die de beloning maximaliseert | Spel-AI, robotbesturing, routeoptimalisatie |

Lineaire regressie hoort bij **supervised learning**: je hebt van elk voorbeeld
zowel de kenmerken $x$ als de bekende uitkomst $y$, en het model leert het
verband daartussen.

De vaktermen die daarbij horen:

- **Feature** (kenmerk, voorspeller, onafhankelijke variabele): de invoer $x$.
- **Target** (doelvariabele, afhankelijke variabele): wat je wilt voorspellen, $y$.
- **Observatie**: één rij in de dataset, dus één paar $(x, y)$.
- **Parameters**: de getallen die het model tijdens het trainen leert.

## Regressie of classificatie?

Binnen supervised learning bepaalt het **meetniveau van de target** welk soort
probleem je hebt. Niet het aantal kenmerken, niet de omvang van de dataset —
alleen de aard van wat je voorspelt.

| Meetniveau van de target | Soort variabele | Probleem | Voorbeeld |
|--------------------------|-----------------|----------|-----------|
| **Nominaal** | Categorieën zonder volgorde | Classificatie | Spam of geen spam; hond, kat of vogel |
| **Ordinaal** | Categorieën mét volgorde | Classificatie (soms ordinale regressie) | Slecht / matig / goed |
| **Interval** | Getallen, gelijke stappen, geen absoluut nulpunt | Regressie | Temperatuur in °C, jaartal |
| **Ratio** | Getallen met een absoluut nulpunt | Regressie | Prijs, gewicht, afstand, omzet |

Kortom: **is de target een getal waarmee je kunt rekenen, dan is het regressie;
is het een label, dan is het classificatie.**

Let op de valkuil: een target die er numeriek uitziet, hoeft dat niet te zijn.
Postcodes, rugnummers en klantnummers zijn getallen op papier, maar nominaal van
aard — het verschil tussen postcode 1000 en 2000 betekent niets. Zulke kolommen
horen niet als target in een regressie.

## Wat is lineaire regressie en wat gebeurt er?

Bij enkelvoudige lineaire regressie zoek je de rechte lijn die het beste bij de
meetpunten past:

$$
\hat{y} = \beta_0 + \beta_1 x
$$

Daarin is $\hat{y}$ (spreek uit: "y-dak") de **voorspelling**, $\beta_0$ het
**snijpunt met de y-as** (de voorspelling als $x = 0$) en $\beta_1$ de
**richtingscoëfficiënt** (hoeveel $\hat{y}$ verandert als $x$ met één omhoog
gaat).

Wat er tijdens het trainen gebeurt, is precies dit: het model zoekt de waarden
van $\beta_0$ en $\beta_1$ waarbij de lijn zo dicht mogelijk langs alle punten
loopt. "Zo dicht mogelijk" moet je meetbaar maken, en daar komen de
loss-functies verderop vandaan.

Sleep hieronder een punt, of tik op een lege plek om er een toe te voegen: de
lijn en de getallen volgen meteen.

```plot
title: De best passende lijn
description: Studie-uren tegen examencijfer. De lijn wordt opnieuw berekend zodra de data verandert.
x: 0..10 | label: Studie-uren (x)
y: 40..100 | label: Examencijfer (y)
points: 1,52 2,58 3,61 4,68 5,70 6,79 7,80 8,88 9,91
fit: linear | label: Best passende lijn
editable: true
readout: fit_intercept | label: β₀ (snijpunt), decimals: 3
readout: fit_slope | label: β₁ (richtingscoëfficiënt), decimals: 3
readout: fit_r2 | label: R², decimals: 4
```

Het **residu** van een punt is het verschil tussen de werkelijke waarde en de
voorspelling:

$$
e_i = y_i - \hat{y}_i
$$

Die residuen zijn de grondstof van alles wat volgt: trainen betekent de residuen
zo klein mogelijk maken, en de metrics vatten samen hoe groot ze nog zijn.

## Welke varianten zijn er?

"Lineair" slaat op de parameters, niet op de vorm van de lijn. Een model blijft
lineair zolang de parameters er lineair in voorkomen — ook als je $x^2$ als
kenmerk gebruikt.

| Variant | Model | Wanneer |
|---------|-------|---------|
| **Enkelvoudig** (simple) | $\hat{y} = \beta_0 + \beta_1 x$ | Eén kenmerk |
| **Meervoudig** (multiple) | $\hat{y} = \beta_0 + \beta_1 x_1 + \dots + \beta_p x_p$ | Meerdere kenmerken |
| **Polynomiaal** | $\hat{y} = \beta_0 + \beta_1 x + \beta_2 x^2 + \dots$ | Kromme verbanden |
| **Ridge** (L2) | Kleinste kwadraten $+\ \lambda \sum \beta_j^2$ | Veel kenmerken, onderlinge samenhang |
| **Lasso** (L1) | Kleinste kwadraten $+\ \lambda \sum \lvert \beta_j \rvert$ | Kenmerken selecteren (zet coëfficiënten op nul) |
| **Elastic net** | Combinatie van L1 en L2 | Als je beide effecten wilt |

Bij ridge en lasso komt er een **strafterm** bij de kostenfunctie. Die duwt de
coëfficiënten richting nul, waardoor het model minder gevoelig wordt voor ruis
in de trainingsdata — dat heet regularisatie.

Hieronder zie je waarom de polynomiale variant "lineair" mag heten: je verandert
alleen de kenmerken, de parameters $a$, $b$ en $c$ blijven gewone factoren.

```plot
title: Polynomiaal model
x: -3..3 | label: x
y: -6..12 | label: ŷ
a = 1 | label: a (bij x²), min: -2, max: 2, step: 0.1
b = 0 | label: b (bij x), min: -4, max: 4, step: 0.1
c = 1 | label: c (constante), min: -4, max: 4, step: 0.5
curve: a * x ** 2 + b * x + c | label: a·x² + b·x + c
```

## Hoe wordt het model getraind?

Trainen is het zoeken naar de parameters met de laagste **kostenfunctie**. De
standaardkeuze is de gemiddelde kwadratische fout:

$$
J(\beta_0, \beta_1) = \frac{1}{n} \sum_{i=1}^{n} \bigl(y_i - (\beta_0 + \beta_1 x_i)\bigr)^2
$$

Er zijn twee manieren om het minimum te vinden.

### 1. De normaalvergelijking (kleinste kwadraten)

Voor lineaire regressie is er een gesloten formule: je kunt de beste parameters
direct uitrekenen, zonder te zoeken. Voor één kenmerk:

$$
\beta_1 = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n} (x_i - \bar{x})^2}
\qquad
\beta_0 = \bar{y} - \beta_1 \bar{x}
$$

Daarin zijn $\bar{x}$ en $\bar{y}$ de gemiddelden. De teller van $\beta_1$ is de
**covariantie** (lopen $x$ en $y$ samen op?), de noemer is de **spreiding** van
$x$. De formule voor $\beta_0$ zegt dat de lijn altijd door het zwaartepunt
$(\bar{x}, \bar{y})$ gaat.

Met meerdere kenmerken schrijf je hetzelfde in matrixvorm:

$$
\boldsymbol{\beta} = (X^{\mathsf{T}} X)^{-1} X^{\mathsf{T}} \mathbf{y}
$$

```python-run
# Kleinste kwadraten, rechtstreeks uitgerekend.
x = [1, 2, 3, 4, 5, 6, 7, 8, 9]
y = [52, 58, 61, 68, 70, 79, 80, 88, 91]

def fit(x, y):
    n = len(x)
    gem_x = sum(x) / n
    gem_y = sum(y) / n
    teller = sum((a - gem_x) * (b - gem_y) for a, b in zip(x, y))
    noemer = sum((a - gem_x) ** 2 for a in x)
    b1 = teller / noemer
    b0 = gem_y - b1 * gem_x
    return b0, b1

b0, b1 = fit(x, y)
print("beta_0 =", round(b0, 4))
print("beta_1 =", round(b1, 4))
print("Voorspelling bij 5 uur:", round(b0 + b1 * 5, 2))
```

### 2. Gradient descent

Bij grote datasets of modellen zonder gesloten formule zoek je het minimum
stapsgewijs. Je begint met willekeurige parameters en loopt telkens een stukje
tegen de helling in. De afgeleiden van $J$ zijn:

$$
\frac{\partial J}{\partial \beta_0} = -\frac{2}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)
\qquad
\frac{\partial J}{\partial \beta_1} = -\frac{2}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)\, x_i
$$

En de bijwerkregel, met leersnelheid $\alpha$:

$$
\beta_j \leftarrow \beta_j - \alpha \frac{\partial J}{\partial \beta_j}
$$

```python-run
# Dezelfde oplossing, nu stap voor stap gezocht.
x = [1, 2, 3, 4, 5, 6, 7, 8, 9]
y = [52, 58, 61, 68, 70, 79, 80, 88, 91]

def gradient_descent(x, y, alpha=0.01, stappen=20000):
    b0 = 0.0
    b1 = 0.0
    n = len(x)
    for _ in range(stappen):
        fouten = [(b0 + b1 * a) - b for a, b in zip(x, y)]
        b0 -= alpha * (2 / n) * sum(fouten)
        b1 -= alpha * (2 / n) * sum(f * a for f, a in zip(fouten, x))
    return b0, b1

def kleinste_kwadraten(x, y):
    n = len(x)
    gem_x, gem_y = sum(x) / n, sum(y) / n
    teller = sum((a - gem_x) * (b - gem_y) for a, b in zip(x, y))
    noemer = sum((a - gem_x) ** 2 for a in x)
    b1 = teller / noemer
    return gem_y - b1 * gem_x, b1

gd = gradient_descent(x, y)
kk = kleinste_kwadraten(x, y)

print("gradient descent  : beta_0 =", round(gd[0], 4), " beta_1 =", round(gd[1], 4))
print("kleinste kwadraten: beta_0 =", round(kk[0], 4), " beta_1 =", round(kk[1], 4))
print("verschil          :", round(abs(gd[0] - kk[0]), 8), round(abs(gd[1] - kk[1]), 8))
```

Beide methoden komen bij dezelfde lijn uit. De leersnelheid $\alpha$ bepaalt
daarbij alles: te klein en het duurt eindeloos, te groot en de stappen schieten
over het minimum heen.

Probeer zelf een lijn te vinden die beter past dan de berekende. De stippellijnen
zijn jouw residuen; de kwadratische fout eronder is precies wat het trainen
minimaliseert.

```plot
title: Zoek zelf het minimum
x: 0..10 | label: Studie-uren
y: 40..100 | label: Examencijfer
points: 1,52 2,58 3,61 4,68 5,70 6,79 7,80 8,88 9,91
fit: linear | label: Kleinste-kwadratenlijn
slope = 3 | label: Jouw β₁, min: 0, max: 10, step: 0.05
intercept = 55 | label: Jouw β₀, min: 30, max: 80, step: 0.5
curve: slope * x + intercept | label: Jouw lijn, residuals: true
```

## Loss-functies

Een **loss-functie** meet de fout van één voorspelling; de **kostenfunctie** is
het gemiddelde daarvan over de hele dataset. In de praktijk worden de termen door
elkaar gebruikt. Deze drie kom je bij regressie het vaakst tegen.

### MSE — Mean Squared Error

$$
\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

Het gemiddelde van de gekwadrateerde residuen. Kwadrateren doet twee dingen: het
maakt negatieve en positieve fouten even zwaar, en het laat grote fouten
onevenredig hard meetellen. De eenheid is die van $y$ **in het kwadraat**, wat
de waarde lastig te interpreteren maakt: bij euro's krijg je euro².

```python-run
y      = [52, 58, 61, 68, 70]
y_hat  = [54.3, 59.1, 63.9, 68.7, 73.5]

def mse(y, y_hat):
    n = len(y)
    return sum((a - b) ** 2 for a, b in zip(y, y_hat)) / n

print("MSE =", round(mse(y, y_hat), 4))
```

### RMSE — Root Mean Squared Error

$$
\text{RMSE} = \sqrt{\text{MSE}} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2}
$$

De wortel uit de MSE. Daarmee sta je weer in de eenheid van $y$ zelf: een RMSE
van 3,1 bij examencijfers betekent "de voorspelling zit er gemiddeld ongeveer
3,1 punt naast". Omdat de wortel monotoon is, geeft RMSE dezelfde rangorde van
modellen als MSE — hij is alleen beter af te lezen.

```python-run
y      = [52, 58, 61, 68, 70]
y_hat  = [54.3, 59.1, 63.9, 68.7, 73.5]

def mse(y, y_hat):
    return sum((a - b) ** 2 for a, b in zip(y, y_hat)) / len(y)

def rmse(y, y_hat):
    return mse(y, y_hat) ** 0.5

print("MSE  =", round(mse(y, y_hat), 4))
print("RMSE =", round(rmse(y, y_hat), 4))
```

### MAE — Mean Absolute Error

$$
\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} \lvert y_i - \hat{y}_i \rvert
$$

Het gemiddelde van de absolute residuen. Elke fout telt naar rato van zijn
grootte: een fout van 10 weegt precies tien keer zo zwaar als een fout van 1.
Ook MAE staat in de eenheid van $y$.

```python-run
y      = [52, 58, 61, 68, 70]
y_hat  = [54.3, 59.1, 63.9, 68.7, 73.5]

def mae(y, y_hat):
    n = len(y)
    return sum(abs(a - b) for a, b in zip(y, y_hat)) / n

print("MAE =", round(mae(y, y_hat), 4))
```

### De drie naast elkaar

Verander hieronder de voorspellingen en kijk hoe de straf per punt uitpakt.

```interactive-table
title: Residuen en hun bijdrage
| Punt | Werkelijk* (min: 0, max: 100) | Voorspeld* (min: 0, max: 100, step: 0.5) | Residu = Werkelijk - Voorspeld (decimals: 2) | Absoluut = abs(Werkelijk - Voorspeld) (decimals: 2) | Kwadratisch = (Werkelijk - Voorspeld) ** 2 (decimals: 2) |
| 1 | 52 | 54.3 |
| 2 | 58 | 59.1 |
| 3 | 61 | 63.9 |
| 4 | 68 | 68.7 |
| 5 | 70 | 73.5 |
```

## R² — de determinatiecoëfficiënt

MSE, RMSE en MAE zeggen hoe groot de fout is, maar niet of dat veel of weinig
is: 3,1 punt fout is goed bij examencijfers en rampzalig bij een cijfer tussen 0
en 1. R² lost dat op door je model te vergelijken met het **domste redelijke
model**: altijd het gemiddelde voorspellen.

$$
R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}
= 1 - \frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{n} (y_i - \bar{y})^2}
$$

- $SS_{\text{res}}$ is de resterende fout van jouw model.
- $SS_{\text{tot}}$ is de fout van het gemiddelde-model, oftewel de totale
  spreiding in $y$.

Hoe lees je de uitkomst?

| R² | Betekenis |
|----|-----------|
| $1$ | Perfect: elk punt ligt exact op de lijn |
| $0{,}75$ | Het model verklaart 75% van de spreiding in $y$ |
| $0$ | Even goed als altijd het gemiddelde voorspellen |
| $< 0$ | Slechter dan het gemiddelde voorspellen |

Dat R² negatief kan worden verrast veel mensen. Het is geen kwadraat van iets in
deze vorm, maar één min een verhouding — en die verhouding mag groter dan 1 zijn.

```python-run
y     = [52, 58, 61, 68, 70]
y_hat = [54.3, 59.1, 63.9, 68.7, 73.5]

def r2(y, y_hat):
    gemiddelde = sum(y) / len(y)
    ss_res = sum((a - b) ** 2 for a, b in zip(y, y_hat))
    ss_tot = sum((a - gemiddelde) ** 2 for a in y)
    return 1 - ss_res / ss_tot

print("R^2 =", round(r2(y, y_hat), 4))

# Het gemiddelde-model als vergelijking: R^2 is dan per definitie 0.
gem = [sum(y) / len(y)] * len(y)
print("R^2 van het gemiddelde-model =", round(r2(y, gem), 4))
```

## Wanneer MSE en wanneer MAE?

Het verschil zit volledig in hoe de twee met **uitschieters** omgaan. Kwadrateren
laat de straf kwadratisch groeien, de absolute waarde laat hem lineair groeien.

```plot
title: Straf per residu
description: Bij een residu van 1 zijn ze gelijk; daarna loopt de kwadratische straf hard weg.
x: -6..6 | label: Residu (y − ŷ)
y: 0..36 | label: Bijdrage aan de fout
curve: x ** 2 | label: Kwadratisch (MSE)
curve: abs(x) | label: Absoluut (MAE)
```

```interactive
title: Hoeveel zwaarder telt één uitschieter?
residu = 5 | label: Residu, min: 0, max: 20, step: 0.5
mae_bijdrage = residu | label: Bijdrage aan MAE, decimals: 2
mse_bijdrage = residu ** 2 | label: Bijdrage aan MSE, decimals: 2
factor = residu | label: MSE telt zwaarder met een factor, decimals: 2
```

### Drie datasets

Neem drie datasets met precies dezelfde onderliggende relatie. Alleen het laatste
punt verschilt:

- **Dataset a** — netjes op de lijn.
- **Dataset b** — overal wat ruis, geen uitschieters.
- **Dataset c** — als a, maar met één meetfout: het laatste punt zit er ver naast.

```python-run
# Dezelfde relatie y = 2x + 1, drie keer met andere afwijkingen.
x = [1, 2, 3, 4, 5, 6, 7, 8]

a = [3, 5, 7, 9, 11, 13, 15, 17]              # exact op de lijn
b = [3.4, 4.6, 7.3, 8.8, 11.2, 12.7, 15.4, 16.6]  # overal wat ruis
c = [3, 5, 7, 9, 11, 13, 15, 32]              # een uitschieter aan het eind

def voorspel(x):
    return [2 * a + 1 for a in x]

def mse(y, y_hat):
    return sum((p - q) ** 2 for p, q in zip(y, y_hat)) / len(y)

def mae(y, y_hat):
    return sum(abs(p - q) for p, q in zip(y, y_hat)) / len(y)

def r2(y, y_hat):
    gem = sum(y) / len(y)
    return 1 - sum((p - q) ** 2 for p, q in zip(y, y_hat)) / sum((p - gem) ** 2 for p in y)

y_hat = voorspel(x)
rijen = []
for naam, y in [("a (exact)", a), ("b (ruis)", b), ("c (uitschieter)", c)]:
    rijen.append({
        "dataset": naam,
        "MSE": round(mse(y, y_hat), 2),
        "RMSE": round(mse(y, y_hat) ** 0.5, 2),
        "MAE": round(mae(y, y_hat), 2),
        "R2": round(r2(y, y_hat), 3),
    })

table(rijen, title="Dezelfde lijn, drie datasets")
```

Kijk naar de verhoudingen tussen b en c. In dataset b liggen alle punten er een
beetje naast; in dataset c ligt alles perfect op de lijn op één punt na. De MAE
van c is *lager* dan die van b — gemiddeld zit het model er immers minder vaak
naast. De MSE van c is juist vele malen hoger, want dat ene residu van 15 wordt
225.

Dat verschil is het hele verhaal:

| | MSE / RMSE | MAE |
|---|-----------|-----|
| **Uitschieters** | Tellen zwaar mee | Tellen naar rato mee |
| **Afgeleide** | Overal glad, prettig voor gradient descent | Knik bij nul |
| **Optimaliseert richting** | Het **gemiddelde** | De **mediaan** |
| **Eenheid** | MSE: y², RMSE: y | y |
| **Kies dit als** | Grote fouten écht erger zijn (remweg, dosering, constructie) | Uitschieters meetfouten zijn en je een robuust model wilt |

Vuistregel: **zijn grote fouten onevenredig schadelijk, gebruik dan MSE of RMSE.
Zijn uitschieters vooral vervuiling in je data, gebruik dan MAE.**

Zie ook hoe hard één punt de lijn zelf meetrekt: sleep in de grafiek hieronder
het rechtse punt naar boven en kijk wat er met de kleinste-kwadratenlijn gebeurt.

```plot
title: Eén uitschieter trekt de hele lijn scheef
x: 0..9 | label: x
y: 0..35 | label: y
points: 1,3 2,5 3,7 4,9 5,11 6,13 7,15 8,17
fit: linear | label: Kleinste-kwadratenlijn
editable: true
readout: fit_slope | label: β₁, decimals: 3
readout: fit_r2 | label: R², decimals: 4
```

## Sterke en zwakke punten

### Sterk

- **Begrijpelijk.** Elke coëfficiënt heeft een betekenis in woorden: "één uur
  extra studeren levert gemiddeld 4,8 punt op". Bij een neuraal netwerk kun je
  dat niet zeggen.
- **Snel.** De gesloten formule geeft het exacte antwoord in één berekening; er
  is geen iteratief trainen nodig.
- **Weinig data nodig.** Werkt al met een handvol observaties, waar complexere
  modellen dan meteen overfitten.
- **Geen hyperparameters.** Bij gewone kleinste kwadraten valt er niets af te
  stellen — het antwoord ligt vast.
- **Een eerlijke ondergrens.** Als een ingewikkeld model niet beter is dan
  lineaire regressie, weet je dat de complexiteit niets oplevert.

### Zwak

- **Alleen rechte verbanden.** Een kromme relatie mist het model volledig, tenzij
  je zelf kenmerken toevoegt zoals $x^2$.
- **Gevoelig voor uitschieters.** Door het kwadrateren trekt één foute meting de
  lijn scheef, zoals hierboven te zien.
- **Multicollineariteit.** Sterk samenhangende kenmerken maken de coëfficiënten
  onbetrouwbaar en wisselvallig, ook al blijft de voorspelling redelijk.
- **Aannames.** De klassieke onderbouwing gaat uit van onafhankelijke residuen
  met constante spreiding (homoscedasticiteit) en een normale verdeling.
- **Extrapolatie is gevaarlijk.** Buiten het bereik van je trainingsdata trekt de
  lijn vrolijk door, ook waar dat nergens op slaat.

## Welke metrics gebruik je?

| Metric | Formule | Eenheid | Waarvoor |
|--------|---------|---------|----------|
| **MSE** | $\frac{1}{n}\sum (y_i - \hat{y}_i)^2$ | y² | Trainen (glad, goed af te leiden) |
| **RMSE** | $\sqrt{\text{MSE}}$ | y | Rapporteren van de foutgrootte |
| **MAE** | $\frac{1}{n}\sum \lvert y_i - \hat{y}_i \rvert$ | y | Rapporteren bij uitschieters |
| **R²** | $1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}$ | — | Vergelijken met het gemiddelde-model |

In de praktijk: **train** op MSE, **rapporteer** RMSE of MAE naast R². Bereken ze
altijd op data die het model tijdens het trainen níét gezien heeft — een model
beoordelen op zijn eigen trainingsdata vleit alleen maar.

```python-run
# Alle vier de maatstaven in één overzicht.
y     = [52, 58, 61, 68, 70, 79, 80, 88, 91]
y_hat = [54.3, 59.1, 63.9, 68.7, 73.5, 78.3, 83.1, 87.8, 92.6]

def mse(y, p):  return sum((a - b) ** 2 for a, b in zip(y, p)) / len(y)
def rmse(y, p): return mse(y, p) ** 0.5
def mae(y, p):  return sum(abs(a - b) for a, b in zip(y, p)) / len(y)

def r2(y, p):
    gem = sum(y) / len(y)
    return 1 - sum((a - b) ** 2 for a, b in zip(y, p)) / sum((a - gem) ** 2 for a in y)

table([
    {"metric": "MSE",  "waarde": round(mse(y, y_hat), 4),  "eenheid": "punt²"},
    {"metric": "RMSE", "waarde": round(rmse(y, y_hat), 4), "eenheid": "punt"},
    {"metric": "MAE",  "waarde": round(mae(y, y_hat), 4),  "eenheid": "punt"},
    {"metric": "R²",   "waarde": round(r2(y, y_hat), 4),   "eenheid": "—"},
], title="Beoordeling van het model")

plot(y, y_hat, x_label="Werkelijk", y_label="Voorspeld",
     title="Voorspeld tegen werkelijk", fit=True)
```

In die laatste grafiek zou een perfect model alle punten op de lijn $\hat{y} = y$
leggen. Hoe dichter de punten bij die diagonaal liggen, hoe beter.
