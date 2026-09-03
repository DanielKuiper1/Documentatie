# Loss-functies

Een loss-functie perst alle fouten van een model in **één getal**. Dat is wat
trainen mogelijk maakt: je kunt niet duizend residuen tegelijk minimaliseren,
wel één som.

Elk model maakt bij elke sample een residu:

$$
e_i = y_i - \hat{y}_i
$$

Positief betekent dat het model te laag zat, negatief te hoog. Optellen mag niet
— dan heffen ze elkaar op en scoort een model dat systematisch de helft te hoog
en de helft te laag zit, perfect. Je moet het teken eerst weghalen, en *hoe* je
dat doet is de hele keuze tussen de loss-functies hieronder.

## De drie op een rij

| | Formule | Eenheid | Bij uitschieters |
|---|---------|---------|------------------|
| **MSE** | $\frac{1}{n}\sum e_i^2$ | Eenheid van $y$, gekwadrateerd | Zeer gevoelig |
| **RMSE** | $\sqrt{\text{MSE}}$ | Eenheid van $y$ | Zeer gevoelig |
| **MAE** | $\frac{1}{n}\sum \lvert e_i \rvert$ | Eenheid van $y$ | Robuust |

## MSE — mean squared error

$$
\text{MSE} = \frac{1}{n}\sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

Kwadrateren maakt alles positief én straft grote fouten onevenredig: twee keer
zo ver ernaast is vier keer zo duur. Voor het optimaliseren is dat een zegen —
de functie is overal glad en differentieerbaar, met precies één minimum bij
lineaire modellen.

De prijs is de eenheid. Voorspel je huisprijzen in euro's, dan is je MSE
uitgedrukt in *euro's in het kwadraat*. Een MSE van 144.000.000 zegt een mens
niets.

## RMSE

$$
\text{RMSE} = \sqrt{\text{MSE}}
$$

De wortel zet de eenheid terug op die van $y$. Een RMSE van 12.000 euro is
leesbaar: zo ongeveer zit dit model ernaast.

Omdat de wortel monotoon is, wijst het model met de laagste MSE altijd ook de
laagste RMSE aan. **Je traint dus op MSE en rapporteert RMSE** — dezelfde
rangorde, maar één ervan kun je uitleggen.

RMSE is geen "gemiddelde fout": door het kwadrateren ligt hij altijd op of boven
de MAE, en hij loopt sneller op naarmate de fouten ongelijker verdeeld zijn.

## MAE — mean absolute error

$$
\text{MAE} = \frac{1}{n}\sum_{i=1}^{n} \lvert y_i - \hat{y}_i \rvert
$$

De absolute waarde haalt het teken weg zonder te vergroten. Elke euro fout telt
even zwaar, of hij nu bij een klein of een groot residu hoort. Dat maakt MAE
letterlijk het gemiddelde bedrag waarmee je ernaast zit — de eerlijkste
samenvatting voor een niet-technische lezer.

Twee nadelen. De knik bij nul is niet differentieerbaar, wat sommige optimalisatie
lastiger maakt. En MAE geeft geen enkel extra gewicht aan een catastrofale fout,
wat soms precies verkeerd is.

## Zelf voelen wat het verschil is

Schuif de residuen en kijk hoe de drie getallen uit elkaar lopen. Het vierde
residu is de uitschieter.

```interactive
title: Vier residuen, drie loss-functies
description: Zet e4 op 20 en kijk wat er met MSE gebeurt, vergeleken met MAE.
e1 = 2 | label: Residu 1, min: -25, max: 25, step: 0.5
e2 = -3 | label: Residu 2, min: -25, max: 25, step: 0.5
e3 = 1 | label: Residu 3, min: -25, max: 25, step: 0.5
e4 = 4 | label: Residu 4 (de uitschieter), min: -25, max: 25, step: 0.5
mse = (e1 ** 2 + e2 ** 2 + e3 ** 2 + e4 ** 2) / 4 | label: MSE, decimals: 3
rmse = sqrt((e1 ** 2 + e2 ** 2 + e3 ** 2 + e4 ** 2) / 4) | label: RMSE, decimals: 3
mae = (abs(e1) + abs(e2) + abs(e3) + abs(e4)) / 4 | label: MAE, decimals: 3
verhouding = sqrt((e1 ** 2 + e2 ** 2 + e3 ** 2 + e4 ** 2) / 4) / ((abs(e1) + abs(e2) + abs(e3) + abs(e4)) / 4) | label: RMSE / MAE, decimals: 3
```

Let op de laatste regel. **RMSE / MAE** is een gratis diagnose:

- Rond **1,0** — alle fouten zijn ongeveer even groot. Geen uitschieters.
- Rond **1,2 – 1,5** — normale spreiding, niets aan de hand.
- Boven **2** — een handvol samples domineert je hele foutmaat. Ga kijken welke.

Zet e4 op 20 en de verhouding schiet naar boven de 2, terwijl MAE nauwelijks
beweegt. Precies dat is de reden dat je beide rapporteert.

## Op een echt model

```python-run
import numpy as np

echt      = np.array([100, 120, 140, 160, 180, 200], dtype=float)
voorspeld = np.array([ 98, 125, 133, 168, 176, 240], dtype=float)

e = echt - voorspeld

mse  = np.mean(e ** 2)
rmse = np.sqrt(mse)
mae  = np.mean(np.abs(e))

print("residuen:", e)
print(f"\nMSE       = {mse:9.3f}   (eenheid van y in het kwadraat)")
print(f"RMSE      = {rmse:9.3f}   (eenheid van y)")
print(f"MAE       = {mae:9.3f}   (eenheid van y)")
print(f"RMSE/MAE  = {rmse / mae:9.3f}")

# Wat gebeurt er zonder de laatste, grootste fout?
zonder = e[:-1]
print(f"\nzonder de uitschieter: RMSE = {np.sqrt(np.mean(zonder ** 2)):.3f}, "
      f"MAE = {np.mean(np.abs(zonder)):.3f}")
```

Eén sample van 240 in plaats van 200 tilt de RMSE zichtbaar op. Dat is geen bug —
het is MSE die doet waarvoor hij is ontworpen.

## Waarom het minimum verschilt

Dit is het diepere verschil, en het verklaart alle andere.

- Minimaliseer je **MSE** met één constante, dan is het antwoord het
  **gemiddelde**.
- Minimaliseer je **MAE**, dan is het antwoord de **mediaan**.

```python-run
import numpy as np

data = np.array([10, 12, 11, 13, 95], dtype=float)   # één forse uitschieter

kandidaten = np.linspace(8, 100, 400)
mse = [(np.mean((data - c) ** 2)) for c in kandidaten]
mae = [(np.mean(np.abs(data - c))) for c in kandidaten]

print(f"gemiddelde = {data.mean():.2f}  -> minimaliseert MSE: "
      f"{kandidaten[int(np.argmin(mse))]:.2f}")
print(f"mediaan    = {np.median(data):.2f}  -> minimaliseert MAE: "
      f"{kandidaten[int(np.argmin(mae))]:.2f}")

plot(kandidaten, mae, label="MAE(c)", x_label="constante voorspelling c",
     y_label="loss", title="MAE wordt geminimaliseerd door de mediaan")
```

Een model dat op MSE traint, voorspelt dus in feite een conditioneel
*gemiddelde*; een model dat op MAE traint, een conditionele *mediaan*. Bij scheve
data zijn dat wezenlijk verschillende antwoorden — welke je wilt, staat in
[MSE of MAE?](./mse-of-mae.md).

## Ook nuttig om te kennen

- **MAPE** — $\frac{100}{n}\sum \lvert e_i / y_i \rvert$, de fout als percentage.
  Handig als 10 euro fout op een prijs van 50 erger is dan op 5.000. Onbruikbaar
  zodra $y$ nul of bijna nul kan zijn.
- **Huber-loss** — kwadratisch dicht bij nul, lineair daarbuiten. Combineert de
  gladheid van MSE met de robuustheid van MAE, ten koste van één extra
  hyperparameter (waar de knik ligt).
- **Log-loss** — de standaardloss voor classificatie, uitgelegd bij
  [logistische regressie](../modellen/logistische-regressie.md).

## Onthoud

- Train op MSE, rapporteer RMSE — zelfde rangorde, leesbare eenheid.
- Rapporteer er MAE naast; de verhouding RMSE/MAE verraadt uitschieters.
- MSE mikt op het gemiddelde, MAE op de mediaan. Dat is een keuze, geen detail.

Verder: [R²](./r-kwadraat.md) om te weten of je fout eigenlijk groot of klein is.
