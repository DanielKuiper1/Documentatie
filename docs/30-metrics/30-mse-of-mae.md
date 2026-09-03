# MSE of MAE?

[MSE en MAE](./loss-functies.md) meten allebei hoe ver een model ernaast zit,
maar ze zijn het oneens over wat "ernaast" waard is. MSE vindt één fout van 10
even erg als honderd fouten van 1; MAE vindt honderd fouten van 1 tien keer zo
erg.

Dat is geen wiskundig detail. Het is een uitspraak over jouw probleem: **schaalt
de schade met de fout, of met het kwadraat ervan?**

## De kern in één vergelijking

| Fout | MSE-bijdrage ($e^2$) | MAE-bijdrage ($\lvert e \rvert$) |
|------|----------------------|----------------------------------|
| 1 | 1 | 1 |
| 2 | 4 | 2 |
| 5 | 25 | 5 |
| 10 | 100 | 10 |
| 20 | 400 | 20 |

Bij MSE is één fout van 10 evenveel waard als **honderd** fouten van 1. Een model
dat op MSE traint, zal dus grif honderd kleine foutjes accepteren om die ene
grote te vermijden. Bij MAE is het een eerlijke ruil van tien tegen tien.

```interactive
title: Eén grote fout of veel kleine?
description: Vergelijk model A (n kleine fouten) met model B (één grote fout) onder beide maten.
n = 100 | label: Aantal kleine fouten (model A), min: 1, max: 200, step: 1
klein = 1 | label: Grootte kleine fout, min: 0.1, max: 5, step: 0.1
groot = 10 | label: Grootte grote fout (model B), min: 1, max: 40, step: 0.5
a_sse = n * klein ** 2 | label: Model A - som van kwadraten, decimals: 2
b_sse = groot ** 2 | label: Model B - som van kwadraten, decimals: 2
a_abs = n * klein | label: Model A - som absoluut, decimals: 2
b_abs = groot | label: Model B - som absoluut, decimals: 2
mse_kiest_b = (groot ** 2 < n * klein ** 2) | label: MSE verkiest model B (1 = ja), decimals: 0
mae_kiest_b = (groot < n * klein) | label: MAE verkiest model B (1 = ja), decimals: 0
```

Bij de standaardwaarden zijn beide maten het eens dat B beter is. Zet het aantal
kleine fouten op 150 en ze gaan uit elkaar lopen: MSE blijft B verkiezen, MAE
niet meer.

## Wat één uitschieter met je lijn doet

Het praktische verschil zie je het duidelijkst in de regressielijn zelf. Sleep
het rechterpunt ver omhoog en kijk hoe de kleinste-kwadratenlijn erachteraan
loopt.

```plot
title: Sleep de uitschieter en kijk wat de lijn doet
description: Alle punten liggen netjes op een lijn. Trek er één ver weg en zie hoe de kleinste-kwadratenlijn kantelt.
x: 0..11 | label: x
y: 0..60 | label: y
points: 1,5 2,9 3,14 4,19 5,24 6,29 7,34 8,39 9,44 10,50
editable: true
fit: true | label: Kleinste-kwadratenlijn (MSE)
readout: fit_slope | label: Helling, decimals: 3
readout: fit_intercept | label: Snijpunt, decimals: 3
readout: fit_r2 | label: R2, decimals: 4
```

Eén verplaatst punt op de tien kantelt de hele lijn en gooit R² onderuit. Een op
MAE getraind model zou nauwelijks bewegen — dat is precies wat "robuust"
betekent.

```python-run
import numpy as np

x = np.arange(1, 11, dtype=float)
y = 5 * x                        # exact lineair

def helling_mse(x, y):
    return np.polyfit(x, y, 1)[0]

def helling_mae(x, y):
    # geen formule: gewoon de beste helling zoeken op een raster
    hellingen = np.linspace(0, 12, 2401)
    kosten = [np.abs(y - (h * x + (np.median(y - h * x)))).mean() for h in hellingen]
    return hellingen[int(np.argmin(kosten))]

print(f"{'uitschieter':>12}  {'MSE-helling':>12}  {'MAE-helling':>12}")
for extra in [50, 100, 200, 400]:
    y2 = y.copy()
    y2[-1] = extra               # laatste punt ontspoort
    print(f"{extra:12.0f}  {helling_mse(x, y2):12.3f}  {helling_mae(x, y2):12.3f}")
```

De MSE-helling loopt weg met de uitschieter mee; de MAE-helling blijft rond de
echte waarde van 5 hangen. Bij een uitschieter van 400 is het MSE-model geen
beschrijving van je data meer, maar een compromis met één meetfout.

## Wanneer welke

### Kies MSE / RMSE als…

- **Grote fouten zijn onevenredig schadelijk.** Een voorraadvoorspelling die er
  1 % naast zit is ruis; 40 % naast is een lege winkel of een volle afschrijving.
- **De uitschieters zijn echt.** Als die ene dure villa gewoon bestaat, moet je
  model hem serieus nemen in plaats van wegpoetsen.
- **Je wilt het conditionele gemiddelde.** Voorspel je een totaal dat later
  opgeteld wordt — omzet, verbruik, capaciteit — dan is het gemiddelde het juiste
  doel, want gemiddelden tellen netjes op.
- **Je hebt gladde gradiënten nodig.** MSE is overal differentieerbaar; dat
  maakt optimalisatie eenvoudiger en stabieler.

### Kies MAE als…

- **De uitschieters zijn meetfouten.** Een sensor die af en toe 999 rapporteert
  moet je model niet vormgeven.
- **Elke eenheid fout kost hetzelfde.** Een bezorgschatting die er 20 minuten
  naast zit, is precies twee keer zo vervelend als 10 minuten naast.
- **Je wilt de mediaan.** Bij scheve data (inkomens, wachttijden, schadeclaims)
  is de mediaan het eerlijkere "typische geval".
- **Je moet het uitleggen.** "We zitten er gemiddeld € 4.200 naast" is een zin
  die iedereen begrijpt.

### Twijfel je — neem Huber

Huber-loss is kwadratisch voor kleine fouten en lineair voor grote:

$$
L_\delta(e) = \begin{cases}
\tfrac{1}{2}e^2 & \text{als } \lvert e \rvert \le \delta \\[4pt]
\delta\left(\lvert e \rvert - \tfrac{1}{2}\delta\right) & \text{anders}
\end{cases}
$$

Je krijgt de gladde gradiënten van MSE rond het optimum én de robuustheid van MAE
in de staarten. De prijs is $\delta$: de grens waarboven een fout als uitschieter
telt, en die moet je zelf kiezen (of tunen).

```interactive
title: Huber tussen MSE en MAE in
description: Schuif de fout voorbij delta en kijk hoe Huber van kwadratisch naar lineair omschakelt.
e = 3 | label: Fout e, min: -20, max: 20, step: 0.5
delta = 5 | label: delta (knikpunt), min: 0.5, max: 15, step: 0.5
kwadratisch = 0.5 * e ** 2 | label: Halve kwadratische loss, decimals: 3
absoluut = abs(e) | label: Absolute loss, decimals: 3
huber = abs(e) <= delta ? 0.5 * e ** 2 : delta * (abs(e) - 0.5 * delta) | label: Huber-loss, decimals: 3
is_uitschieter = (abs(e) > delta) | label: Telt als uitschieter (1 = ja), decimals: 0
```

Zet de fout op 15 met $\delta = 5$: de kwadratische loss staat op 112,5, Huber op
een veel bescheidener waarde. De uitschieter telt mee, maar domineert niet.

## Een uitschieter is geen bug

De verleiding is om uitschieters weg te gooien tot je metrics er mooi uitzien.
Dat is meestal de verkeerde volgorde. Zoek eerst uit *waarom* het punt afwijkt:

| Oorzaak | Wat te doen |
|---------|-------------|
| Meetfout, typefout, kapotte sensor | Verwijderen of corrigeren — en documenteren |
| Andere eenheid (grammen tussen kilo's) | Omrekenen |
| Zeldzaam maar echt (een villa, een fraudegeval) | Behouden; dit is vaak juist het interessante deel |
| Een ontbrekende feature (dit huis heeft een zwembad) | Die feature toevoegen |

Alleen bij de eerste twee rijen mag je schrappen, en dan nog: schrijf op wat je
weggooide en waarom. Een dataset die stilletjes is opgeschoond is niet
reproduceerbaar.

## In de praktijk

Rapporteer ze allebei. Dat kost niets en de verhouding is gratis diagnostiek:

- **RMSE ≈ MAE** — de fouten zijn gelijkmatig verdeeld. Beide maten vertellen
  hetzelfde verhaal.
- **RMSE ≫ MAE** (verhouding > 2) — een handvol samples domineert. Zoek ze op
  voordat je iets over je model concludeert.

```python-run
import numpy as np

echt      = np.array([20, 22, 25, 24, 27, 30, 28, 33, 31, 95], dtype=float)
voorspeld = np.array([21, 23, 24, 25, 26, 29, 30, 32, 33, 35], dtype=float)

e = echt - voorspeld
rmse = np.sqrt(np.mean(e ** 2))
mae = np.mean(np.abs(e))

print(f"RMSE      = {rmse:.3f}")
print(f"MAE       = {mae:.3f}")
print(f"RMSE/MAE  = {rmse / mae:.3f}  -> boven 2: er zit een uitschieter in")

verdacht = np.argsort(np.abs(e))[::-1][:3]
print("\ngrootste fouten:")
for i in verdacht:
    print(f"  sample {i}: echt {echt[i]:.0f}, voorspeld {voorspeld[i]:.0f}, fout {e[i]:+.0f}")
```

## Onthoud

- MSE straft kwadratisch: één fout van 10 = honderd fouten van 1.
- MSE mikt op het gemiddelde, MAE op de mediaan. Kies wat je probleem vraagt.
- Zijn uitschieters echt → MSE. Zijn het meetfouten → MAE. Weet je het niet →
  Huber.
- Rapporteer beide; RMSE/MAE boven 2 is een aanwijzing, geen ramp.

Verder: [classificatie-metrics](./classificatie-metrics.md) — daar speelt
dezelfde afweging, maar dan tussen twee soorten fouten in plaats van twee
groottes.
