# Logistische regressie

Logistische regressie voorspelt **een kans**, en pas daarna een label. Ondanks
de naam is het een classificatiemodel — de "regressie" slaat op wat er vanbinnen
gebeurt, niet op wat eruit komt.

Het probleem dat het oplost: een rechte lijn kan waarden als $-3$ en $17$
voorspellen, en dat zijn geen kansen. De oplossing is de lijn door een functie
duwen die alles naar het interval $(0, 1)$ plet.

## De sigmoïde

$$
z = ax + b \qquad
p = \sigma(z) = \frac{1}{1 + e^{-z}}
$$

Twee stappen, en de eerste is letterlijk
[lineaire regressie](./lineaire-regressie.md). De tweede is de **sigmoïde**, met
drie eigenschappen die er precies toe doen:

- $\sigma(0) = 0{,}5$ — het omslagpunt ligt bij $z = 0$.
- $\sigma(z) \to 1$ voor grote $z$, $\to 0$ voor sterk negatieve $z$, zonder ze
  ooit te bereiken. Het model is dus nooit 100 % zeker.
- De curve is het steilst rond $z = 0$ en vlakt af aan de randen. Rond de grens
  is het model gevoelig, ver weg maakt extra bewijs weinig meer uit.

```plot
title: De sigmoïde
description: Schuif aan de helling en de verschuiving en kijk wat er met de S-vorm gebeurt.
x: -10..10 | label: z (de lineaire score)
y: -0.05..1.05 | label: kans p
a = 1 | label: Steilheid a, min: 0.1, max: 4, step: 0.1
b = 0 | label: Verschuiving b, min: -6, max: 6, step: 0.25
curve: 1 / (1 + exp(-(a * x + b))) | label: sigma(ax + b)
curve: 0.5 | label: Beslisdrempel 0,5
```

Een grotere $a$ maakt de overgang scherper — het model wordt beslister. In de
limiet $a \to \infty$ krijg je een harde stap: alles links van de grens 0, alles
rechts 1, zonder twijfelgebied.

## Van kans naar label

De kans is de uitvoer van het model. Het **label** krijg je pas door een drempel
toe te passen:

$$
\hat{y} = \begin{cases} 1 & \text{als } p \ge t \\ 0 & \text{anders}\end{cases}
$$

De standaarddrempel $t = 0{,}5$ is een conventie, geen wet. Verschuif hem en je
ruilt precision tegen recall — zie
[classificatie-metrics](../metrics/classificatie-metrics.md). Dat is precies
waarom je de kans bewaart: de drempel aanpassen kost geen hertraining.

```interactive
title: Kans, drempel en beslissing
description: Eén patient, twee kenmerken. Kijk hoe z, p en het uiteindelijke label samenhangen.
leeftijd = 55 | label: Leeftijd, min: 20, max: 90, step: 1
bloeddruk = 140 | label: Bovendruk, min: 90, max: 200, step: 1
drempel = 0.5 | label: Beslisdrempel t, min: 0.05, max: 0.95, step: 0.05
z = -12 + 0.08 * leeftijd + 0.05 * bloeddruk | label: Lineaire score z, decimals: 3
p = 1 / (1 + exp(-(-12 + 0.08 * leeftijd + 0.05 * bloeddruk))) | label: Kans op risico, decimals: 4
odds = exp(-12 + 0.08 * leeftijd + 0.05 * bloeddruk) | label: Odds, decimals: 3
label = (1 / (1 + exp(-(-12 + 0.08 * leeftijd + 0.05 * bloeddruk))) >= drempel) | label: Voorspeld label (1 = risico), decimals: 0
```

Zet de drempel op 0,2 en zie hoeveel eerder het model "risico" roept. Bij een
medische screening is dat vaak precies wat je wilt: liever een vals alarm dan een
gemiste diagnose.

## Wat de coëfficiënten betekenen

Bij lineaire regressie las je een coëfficiënt af als "zoveel euro per m²". Hier
kan dat niet, want het effect op $p$ is niet constant — het hangt af van waar op
de S-curve je zit.

Wat wél constant is, is het effect op de **log-odds**:

$$
\log \frac{p}{1-p} = ax + b
$$

De linkerkant heet de **logit**, en die is gewoon lineair in $x$. Daaruit volgt
de standaardinterpretatie: één eenheid $x$ erbij vermenigvuldigt de odds met
$e^{a}$.

| $a$ | $e^a$ | Betekenis van één eenheid $x$ erbij |
|-----|-------|--------------------------------------|
| 0,00 | 1,00 | geen effect |
| 0,10 | 1,11 | 11 % hogere odds |
| 0,69 | 2,00 | odds verdubbelen |
| −0,69 | 0,50 | odds halveren |

"Odds verdubbelen" is niet "kans verdubbelen". Van $p = 0{,}1$ (odds 0,11) gaat
verdubbelen naar odds 0,22, oftewel $p = 0{,}18$ — geen 0,2. Bij hoge kansen is
het verschil nog groter.

## De loss: log-loss

Waarom niet gewoon [MSE](../metrics/loss-functies.md) op de kansen? Twee redenen.
MSE in combinatie met de sigmoïde geeft een niet-convexe loss met lokale minima,
en MSE straft een zelfverzekerde fout veel te mild.

De juiste loss is **log-loss** (binaire cross-entropy):

$$
L = -\frac{1}{n}\sum_{i=1}^{n} \Big[ y_i \log(p_i) + (1 - y_i)\log(1 - p_i) \Big]
$$

Per sample telt maar één van de twee termen mee — de andere valt weg omdat $y_i$
0 of 1 is. Wat overblijft is $-\log(\text{kans die je aan het juiste antwoord
gaf})$.

Het gedrag aan de randen is de hele kern: geef je kans 0,01 aan het antwoord dat
juist blijkt, dan is je loss $-\log(0{,}01) \approx 4{,}6$. Bij kans 0,0001 is het
$9{,}2$. Zelfverzekerd en fout is dodelijk duur, en dat is precies de bedoeling.

```interactive
title: Log-loss voor één voorspelling
description: Het echte label is 1. Schuif de voorspelde kans richting nul en kijk hoe de straf ontploft.
p = 0.9 | label: Voorspelde kans op klasse 1, min: 0.001, max: 0.999, step: 0.001
logloss = -log(p) | label: Log-loss bij echt label 1, decimals: 4
logloss_0 = -log(1 - p) | label: Log-loss als het echte label 0 was, decimals: 4
mse = (1 - p) ** 2 | label: Ter vergelijking: MSE bij label 1, decimals: 4
```

Zet $p$ op 0,001: log-loss wordt bijna 7, terwijl MSE op een keurige 0,998 blijft
steken. MSE kan simpelweg niet erger straffen dan 1, hoe fout je ook zat.

## Zelf trainen

Er is geen formule zoals bij lineaire regressie — log-loss heeft geen gesloten
oplossing. Het model wordt iteratief getraind met
[gradient descent](./index.md#gradient-descent-in-het-kort).

```python-run
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss

rng = np.random.default_rng(7)
# Twee groepen studie-uren: gezakt rond 3 uur, geslaagd rond 7 uur.
uren = np.concatenate([rng.normal(3, 1.2, 40), rng.normal(7, 1.2, 40)])
geslaagd = np.concatenate([np.zeros(40), np.ones(40)])

model = LogisticRegression().fit(uren.reshape(-1, 1), geslaagd)
a, b = model.coef_[0][0], model.intercept_[0]

print(f"a = {a:.4f}   b = {b:.4f}")
print(f"odds-ratio per extra uur: {np.exp(a):.2f}x")
print(f"omslagpunt (p = 0,5) bij {-b / a:.2f} studie-uren")
print(f"log-loss op de trainingsdata: {log_loss(geslaagd, model.predict_proba(uren.reshape(-1, 1))):.4f}")

raster = np.linspace(0, 11, 120)
kans = model.predict_proba(raster.reshape(-1, 1))[:, 1]
plot(raster, kans, label="P(geslaagd)", x_label="studie-uren",
     y_label="kans", title="Getrainde logistische curve")
```

Het omslagpunt $-b/a$ is de plek waar $z = 0$ en dus $p = 0{,}5$ — de
**beslisgrens**. Bij één feature is dat een punt, bij twee een rechte lijn, bij
meer een hypervlak. Altijd recht: logistische regressie kan van zichzelf geen
kromme grens trekken.

## Meer dan twee klassen

Bij $k$ klassen vervang je de sigmoïde door de **softmax**, die $k$ scores
omzet in $k$ kansen die samen 1 zijn:

$$
p_j = \frac{e^{z_j}}{\sum_{m=1}^{k} e^{z_m}}
$$

Voor $k = 2$ is softmax precies gelijk aan de sigmoïde; het is dus geen ander
model, maar dezelfde vorm algemener opgeschreven. In scikit-learn krijg je dit
vanzelf zodra je target meer dan twee waarden heeft.

## Wanneer het niet werkt

- **De klassen zijn niet lineair scheidbaar.** Een groep die als een ring om een
  andere heen ligt, krijg je met een rechte grens nooit gescheiden. Voeg
  features toe ($x^2$, producten van features) of gebruik een ander model.
- **Perfect scheidbare data.** Klinkt goed, is een probleem: de coëfficiënten
  lopen naar oneindig omdat steiler altijd een lagere loss geeft.
  [Regularisatie](./ridge-en-lasso.md) — in scikit-learn standaard aan — voorkomt
  dit.
- **Sterk ongebalanceerde klassen.** Bij 1 % positieven wordt "altijd nee" al 99 %
  accuracy. Kijk naar precision en recall, nooit naar accuracy alleen — zie
  [classificatie-metrics](../metrics/classificatie-metrics.md).

## Onthoud

- Lineaire score → sigmoïde → kans → drempel → label. In die volgorde.
- Coëfficiënten zijn lineair in de log-odds, niet in de kans; $e^a$ is de
  odds-ratio.
- Log-loss straft zelfverzekerde fouten onbegrensd zwaar. Dat is een feature.
- De beslisgrens is altijd recht.

Verder naar [classificatie-metrics](../metrics/classificatie-metrics.md) om het
resultaat te beoordelen.
