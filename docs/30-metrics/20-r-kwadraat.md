# R²

Een RMSE van 12 — is dat goed? Die vraag kun je niet beantwoorden zonder te weten
hoeveel de target überhaupt varieert. R² beantwoordt hem wél, door je model te
vergelijken met het domste model dat er is: **altijd het gemiddelde voorspellen**.

$$
R^2 = 1 - \frac{\text{SS}_{\text{res}}}{\text{SS}_{\text{tot}}}
= 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}
$$

- $\text{SS}_{\text{res}}$ — de fout die jouw model overhoudt.
- $\text{SS}_{\text{tot}}$ — de fout van het gemiddelde-model. Dit is precies de
  variantie van $y$, maal $n$.

De breuk is dus "welk deel van de oorspronkelijke fout is nog over?". Eén min dat
is "welk deel heb ik weggewerkt".

## De schaal lezen

| R² | Betekenis |
|----|-----------|
| **1,0** | Perfect: elk punt ligt exact op de lijn |
| **0,7** | Het model verklaart 70 % van de variantie |
| **0,0** | Even goed als altijd het gemiddelde gokken |
| **negatief** | Slechter dan het gemiddelde gokken |

Dat laatste verrast mensen, maar volgt direct uit de formule: als je model méér
fout maakt dan het gemiddelde, wordt de breuk groter dan 1. Op de trainingsset
kan het niet gebeuren bij lineaire regressie met snijpunt; op de **testset** wel,
en dan weet je meteen dat er iets grondig mis is.

## Zelf zien wat R² doet

Sleep de punten in de grafiek. Trek ze naar de lijn en R² kruipt naar 1; smijt ze
door elkaar en R² zakt richting 0.

```plot
title: R2 als "hoeveel beter dan het gemiddelde"
description: Sleep punten om de spreiding te veranderen en kijk mee met R2 en de SSE.
x: 0..11 | label: x
y: 20..100 | label: y
points: 1,30 2,38 3,49 4,53 5,64 6,68 7,79 8,83 9,92 10,96
editable: true
fit: true | label: Kleinste-kwadratenlijn
readout: fit_r2 | label: R2, decimals: 4
readout: fit_sse | label: SS_res (fout van het model), decimals: 2
readout: fit_slope | label: Helling, decimals: 3
readout: fit_n | label: Aantal punten, decimals: 0
```

## De rekensom

```python-run
import numpy as np

y      = np.array([30, 38, 49, 53, 64, 68, 79, 83, 92, 96], dtype=float)
y_hat  = np.array([31, 38, 45, 52, 59, 66, 73, 80, 87, 94], dtype=float)

ss_res = ((y - y_hat) ** 2).sum()          # wat mijn model overhoudt
ss_tot = ((y - y.mean()) ** 2).sum()       # wat het gemiddelde overhoudt

r2 = 1 - ss_res / ss_tot

print(f"gemiddelde van y : {y.mean():.2f}")
print(f"SS_tot (baseline): {ss_tot:.2f}")
print(f"SS_res (model)   : {ss_res:.2f}")
print(f"R2               : {r2:.4f}")
print(f"\nHet model haalt {100 * r2:.1f}% van de fout van het gemiddelde weg.")
```

## R² stijgt altijd — en dat is het probleem

Voeg een willekeurige feature toe aan een lineair model, en R² gaat omhoog. Zelfs
als die feature pure ruis is. Het model kan die kolom immers een coëfficiënt van
nul geven en niets verliezen — dus in de praktijk vindt het altijd wel wat toevallig
signaal om te exploiteren.

```python-run
import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(42)
n = 40
y = rng.normal(0, 1, n)          # y is puur toeval

print("features   R2 op de trainingsdata")
for k in [1, 5, 10, 20, 35]:
    ruis = rng.normal(0, 1, (n, k))   # en de features ook
    model = LinearRegression().fit(ruis, y)
    print(f"{k:8d}   {model.score(ruis, y):.4f}")
```

Er zit geen enkel verband in deze data, en toch loopt R² richting 1. Dat is
overfitting in zijn zuiverste vorm: met genoeg parameters legt een model elke
puntenwolk uit.

Daarom bestaat **aangepaste R²**, die straft voor het aantal features $p$:

$$
R^2_{\text{adj}} = 1 - (1 - R^2)\,\frac{n - 1}{n - p - 1}
$$

Deze *kan* dalen als je een nutteloze feature toevoegt, en is daarmee de juiste
maat om modellen met verschillend aantal features te vergelijken. De structurele
oplossing voor hetzelfde probleem is
[ridge of lasso](../modellen/ridge-en-lasso.md): die straffen complexiteit al
tijdens het trainen, in plaats van hem achteraf te verrekenen.

```interactive
title: R2 versus aangepaste R2
description: Voeg features toe zonder dat R2 stijgt, en kijk wat de aangepaste variant doet.
r2 = 0.8 | label: R2, min: 0, max: 0.999, step: 0.001
n = 50 | label: Aantal samples n, min: 10, max: 500, step: 5
p = 5 | label: Aantal features p, min: 1, max: 40, step: 1
r2_adj = 1 - (1 - r2) * (n - 1) / (n - p - 1) | label: Aangepaste R2, decimals: 4
verschil = r2 - (1 - (1 - r2) * (n - 1) / (n - p - 1)) | label: Straf voor complexiteit, decimals: 4
```

Zet $n = 50$ en schuif $p$ van 5 naar 40: dezelfde R² van 0,8 wordt een
aangepaste R² die dramatisch inzakt. Bij weinig data zijn veel features gewoon te
duur.

## Waar R² je misleidt

**Hoge R² betekent niet dat het model klopt.** Het beroemdste tegenvoorbeeld is
Anscombe's kwartet: vier datasets met identieke gemiddelden, identieke lijnen en
identieke R² van 0,67 — waarvan er maar één een echt lineair verband is.

```python-run
import numpy as np

x1 = np.array([10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5], dtype=float)
y1 = np.array([8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68])
y2 = np.array([9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74])

x4 = np.array([8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], dtype=float)
y4 = np.array([6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89])

def r2(x, y):
    a, b = np.polyfit(x, y, 1)
    res = ((y - (a * x + b)) ** 2).sum()
    tot = ((y - y.mean()) ** 2).sum()
    return a, b, 1 - res / tot

for naam, x, y in [("I  (lineair)", x1, y1), ("II (krom)", x1, y2), ("IV (1 punt)", x4, y4)]:
    a, b, score = r2(x, y)
    print(f"{naam:14s} a={a:.3f}  b={b:.3f}  R2={score:.4f}")

plot(x1, y2, label="dataset II", fit=True, x_label="x", y_label="y",
     title="Perfect kromme data, R2 = 0,67")
```

Drie totaal verschillende datasets, dezelfde lijn, dezelfde R². Dataset IV is de
ergste: daar bepaalt één enkel punt de hele helling.

De les: **R² vervangt de plot niet.** Kijk altijd naar je data en naar de
[residuenplot](../modellen/lineaire-regressie.md#de-aannames-en-hoe-ze-breken).

## Andere valkuilen

- **R² is niet vergelijkbaar tussen datasets.** Een R² van 0,3 op menselijk
  gedrag is goed; 0,9 op een natuurkundemeting is teleurstellend. De maat hangt
  af van hoeveel ruis er intrinsiek in het domein zit.
- **R² zegt niets over causaliteit.** Zonneschijn verklaart ijsverkoop en
  verdrinkingen even goed; dat maakt ijs niet gevaarlijk.
- **Zonder snijpunt verandert de definitie.** Sommige bibliotheken rekenen R²
  dan tegen nul in plaats van tegen het gemiddelde, wat absurd hoge waarden
  oplevert. Wees achterdochtig bij een R² van 0,99 in een model zonder intercept.
- **Alleen zinvol bij regressie.** Voor classificatie gebruik je
  [precision, recall en ROC-AUC](./classificatie-metrics.md).

## Onthoud

- R² = het deel van de variantie dat je model wegneemt ten opzichte van het
  gemiddelde.
- Negatief op de testset = slechter dan niets doen. Ga terug naar de tekentafel.
- Gewone R² stijgt altijd bij meer features; gebruik de aangepaste variant om te
  vergelijken.
- Een hoge R² is geen bewijs dat het model klopt. Kijk naar de plot.

Verder: [MSE of MAE?](./mse-of-mae.md) over hoe uitschieters — dezelfde die R²
onderuithalen — je keuze van loss beïnvloeden.
