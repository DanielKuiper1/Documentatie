# Ridge en lasso

[Kleinste kwadraten](./lineaire-regressie.md) heeft één doel: de fout op de
trainingsdata zo klein mogelijk maken. Met veel features is dat een probleem, niet
een deugd. Het model krijgt genoeg vrijheid om de ruis in je trainingsset uit het
hoofd te leren, en komt terug met enorme coëfficiënten die elkaar bijna opheffen.

**Regularisatie** lost dat op door de loss een tweede doel te geven: houd de
coëfficiënten klein. Je maakt de fit op de trainingsdata bewust iets slechter, in
ruil voor een model dat het op nieuwe data beter doet.

$$
L = \underbrace{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}_{\text{pas bij de data}}
  + \underbrace{\lambda \cdot \text{straf}(a)}_{\text{houd het simpel}}
$$

De twee varianten verschillen alleen in wat er in die strafterm staat.

| | Ridge ($L_2$) | Lasso ($L_1$) |
|---|---|---|
| Strafterm | $\lambda \sum a_j^2$ | $\lambda \sum \lvert a_j \rvert$ |
| Effect op coëfficiënten | Krimpt ze allemaal richting nul | Zet er een aantal exact op nul |
| Featureselectie | Nee | Ja, automatisch |
| Bij gecorreleerde features | Verdeelt het gewicht over alle | Kiest er willekeurig één uit |
| Oplossing | Formule, in één keer | Iteratief |
| `sklearn` | `Ridge(alpha=…)` | `Lasso(alpha=…)` |

Let op: het snijpunt $b$ wordt **niet** gestraft. Dat zou het model dwingen zijn
voorspellingen richting nul te trekken in plaats van richting het gemiddelde, en
dat is nergens goed voor.

## Waarom kleine coëfficiënten beter generaliseren

Een grote coëfficiënt betekent dat een kleine verandering in een feature een
grote verandering in de voorspelling geeft. Dat is precies wat je niet wilt als
die feature ook een beetje meetruis bevat: het model versterkt de ruis in plaats
van hem te dempen.

Het klassieke symptoom zijn coëfficiënten die elkaar opheffen. Twee sterk
gecorreleerde features krijgen $+8400$ en $-8350$; samen doen ze bijna niets,
maar elk apart is het model wild instabiel. Voeg één sample toe en de getallen
klappen om.

```python-run
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

rng = np.random.default_rng(4)
n = 30

x1 = rng.normal(0, 1, n)
x2 = x1 + rng.normal(0, 0.01, n)      # bijna identiek aan x1
X = np.column_stack([x1, x2])
y = 3 * x1 + rng.normal(0, 0.5, n)    # alleen x1 doet er echt toe

kq = LinearRegression().fit(X, y)
rg = Ridge(alpha=1.0).fit(X, y)

print("kleinste kwadraten:", np.round(kq.coef_, 2), " som:", round(kq.coef_.sum(), 3))
print("ridge (alpha=1)   :", np.round(rg.coef_, 2), " som:", round(rg.coef_.sum(), 3))
```

De som klopt in beide gevallen ongeveer (het echte effect is 3), maar kleinste
kwadraten verdeelt hem over twee absurde getallen. Ridge houdt ze klein en
netjes.

## Zelf aan lambda draaien

$\lambda$ (in scikit-learn heet hij `alpha`) regelt de sterkte van de straf, en
is de enige knop die je hebt.

- $\lambda = 0$ — geen straf, gewoon kleinste kwadraten.
- $\lambda$ klein — lichte krimp, model blijft flexibel.
- $\lambda$ groot — coëfficiënten worden naar nul geduwd.
- $\lambda \to \infty$ — alle coëfficiënten nul; het model voorspelt overal het
  gemiddelde.

```interactive
title: Wat lambda met een coefficient doet
description: Ridge krimpt naar nul toe maar komt er nooit; lasso zet hem er hard op nul. b is de waarde die kleinste kwadraten zou geven.
b = 4 | label: Coefficient zonder straf, min: -10, max: 10, step: 0.25
lambda = 1 | label: Lambda (strafsterkte), min: 0, max: 10, step: 0.1
ridge = b / (1 + lambda) | label: Ridge-schatting, decimals: 4
lasso = abs(b) <= lambda ? 0 : (b > 0 ? b - lambda : b + lambda) | label: Lasso-schatting, decimals: 4
krimp_ridge = b - b / (1 + lambda) | label: Ridge krimpt met, decimals: 4
lasso_is_nul = (abs(b) <= lambda) | label: Lasso zet hem op nul (1 = ja), decimals: 0
```

Dit zijn de exacte formules voor het geval dat je features onderling
ongecorreleerd zijn:

$$
a^{\text{ridge}} = \frac{a^{\text{kq}}}{1 + \lambda}
\qquad
a^{\text{lasso}} = \operatorname{sign}(a^{\text{kq}}) \cdot \max\big(\lvert a^{\text{kq}} \rvert - \lambda,\ 0\big)
$$

Daar zit het hele verschil in. Ridge **deelt** — een grote coëfficiënt blijft
relatief groot, en niets wordt ooit exact nul. Lasso **trekt af** — alles onder
$\lambda$ valt weg, en klein wordt nul.

## Het verschil in coëfficiëntpaden

Zet de coëfficiënten uit tegen $\lambda$ en het onderscheid wordt zichtbaar.

```python-run
import numpy as np
from sklearn.linear_model import Ridge, Lasso
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(9)
n = 60
X = rng.normal(0, 1, (n, 6))
# Alleen de eerste drie features doen er echt toe.
y = 4 * X[:, 0] + 2 * X[:, 1] - 3 * X[:, 2] + rng.normal(0, 1, n)
Xs = StandardScaler().fit_transform(X)

alphas = np.logspace(-2, 1.2, 25)

print("LASSO — aantal coefficienten dat exact nul is:")
for a in [0.01, 0.1, 0.3, 1.0, 3.0]:
    m = Lasso(alpha=a, max_iter=10000).fit(Xs, y)
    nul = int((m.coef_ == 0).sum())
    print(f"  alpha={a:5.2f}  nul: {nul}/6   {np.round(m.coef_, 2)}")

print("\nRIDGE — aantal coefficienten dat exact nul is:")
for a in [0.01, 0.1, 0.3, 1.0, 3.0]:
    m = Ridge(alpha=a).fit(Xs, y)
    nul = int((m.coef_ == 0).sum())
    print(f"  alpha={a:5.2f}  nul: {nul}/6   {np.round(m.coef_, 2)}")

pad = [Lasso(alpha=a, max_iter=10000).fit(Xs, y).coef_[3] for a in alphas]
plot(alphas, pad, label="lasso-coefficient van een nutteloze feature",
     x_label="alpha", y_label="coefficient",
     title="Lasso duwt een nutteloze feature naar exact nul")
```

Ridge komt nooit op nul uit, hoe groot `alpha` ook wordt — de coëfficiënten
kruipen er alleen steeds dichter naartoe. Lasso schakelt features hard uit, en
dat maakt hem tot een selectiemethode: welke kolommen overblijven, is zelf een
antwoord.

## Waarom lasso wél nul geeft en ridge niet

De meetkundige verklaring is de moeite waard, want ze verklaart alles hierboven.

Regularisatie komt erop neer dat je de beste fit zoekt *binnen* een gebied rond
de oorsprong. De vorm van dat gebied volgt uit de strafterm:

- $\sum a_j^2 \le c$ is een **cirkel** (bol in meer dimensies) — glad, zonder
  hoeken.
- $\sum \lvert a_j \rvert \le c$ is een **ruit** — met scherpe punten precies op
  de assen.

De oplossing ligt waar de ellipsen van de kleinste-kwadratenfout dat gebied voor
het eerst raken. Bij een cirkel kan dat overal op de rand; bij een ruit is de
kans groot dat het net op een punt gebeurt — en een punt van de ruit ligt op een
as, oftewel: een coëfficiënt is nul.

Dat is ook waarom lasso geen formule heeft en ridge wel. De absolute waarde heeft
een knik bij nul en is daar niet differentieerbaar, dus lasso moet iteratief
opgelost worden (coordinate descent).

## Standaardiseren is verplicht

Dit is de fout die iedereen één keer maakt. De strafterm telt coëfficiënten bij
elkaar op, en de grootte van een coëfficiënt hangt af van de **eenheid** van zijn
feature.

Meet je oppervlakte in m² dan is de coëfficiënt misschien 2.500. Meet je hem in
hectare, dan is dezelfde relatie een coëfficiënt van 25.000.000 — en die wordt
tienduizend keer zo hard gestraft, zonder dat er iets aan het model veranderde.

```python-run
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(2)
n = 50
opp_m2 = rng.uniform(50, 200, n)
kamers = rng.integers(1, 7, n).astype(float)
y = 2500 * opp_m2 + 9000 * kamers + rng.normal(0, 20000, n)

X = np.column_stack([opp_m2, kamers])

zonder = Ridge(alpha=10).fit(X, y)
met = make_pipeline(StandardScaler(), Ridge(alpha=10)).fit(X, y)

print("zonder standaardiseren:", np.round(zonder.coef_, 1))
print("met standaardiseren   :", np.round(met[-1].coef_, 1))
print("\nNa standaardiseren zijn de coefficienten vergelijkbaar:")
print("beide in 'euro per standaarddeviatie', dus de straf is eerlijk.")
```

Gebruik altijd een `Pipeline` met `StandardScaler`, nooit een losse scaler op je
hele dataset — anders lekt informatie uit de testset je training in. De pipeline
past de schaler alleen op de trainingsvouw toe, ook binnen kruisvalidatie.

## Lambda kiezen

Niet op gevoel, en niet op de trainingsscore — die wordt per definitie slechter
naarmate $\lambda$ groter is. Je kiest met
[kruisvalidatie](../metrics/index.md#de-valkuil-de-testset-opbranden).

```python-run
import numpy as np
from sklearn.linear_model import RidgeCV, LassoCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(5)
n, p = 60, 15
X = rng.normal(0, 1, (n, p))
# Slechts 3 van de 15 features doen er iets toe.
y = 5 * X[:, 0] - 3 * X[:, 1] + 2 * X[:, 2] + rng.normal(0, 1, n)

alphas = np.logspace(-3, 2, 60)

ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=alphas, cv=5)).fit(X, y)
lasso = make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5, max_iter=20000)).fit(X, y)

print(f"ridge: beste alpha = {ridge[-1].alpha_:.4f}")
print(f"lasso: beste alpha = {lasso[-1].alpha_:.4f}, "
      f"{int((lasso[-1].coef_ != 0).sum())}/{p} features behouden")
print(f"       behouden kolommen: {np.flatnonzero(lasso[-1].coef_)}")

for naam, m in [("ridge", ridge), ("lasso", lasso)]:
    s = cross_val_score(m, X, y, cv=5, scoring="r2")
    print(f"{naam}: R2 = {s.mean():.4f} (+/- {s.std():.4f})")
```

Lasso vindt hier de drie echte features terug uit vijftien. Dat is geen toeval —
het is precies waar hij voor gemaakt is.

## Elastic net: allebei tegelijk

Lasso heeft één vervelende eigenschap: bij een groep sterk gecorreleerde features
kiest hij er willekeurig één en zet de rest op nul. Welke, hangt af van de ruis —
train opnieuw op iets andere data en het is een andere kolom.

**Elastic net** combineert beide straftermen en lost dat op:

$$
L = \text{SSE} + \lambda \Big( \rho \sum \lvert a_j \rvert + \tfrac{1}{2}(1 - \rho) \sum a_j^2 \Big)
$$

De $L_1$-helft blijft features uitschakelen, de $L_2$-helft zorgt dat
gecorreleerde features samen in of samen uit gaan. In scikit-learn is $\rho$ de
parameter `l1_ratio`: 1,0 is pure lasso, 0,0 is pure ridge.

```interactive
title: Elastic net mengt de twee straffen
description: Zet l1_ratio op 1 voor pure lasso en op 0 voor pure ridge.
a = 3 | label: Coefficient a, min: -8, max: 8, step: 0.25
lambda = 2 | label: Lambda, min: 0, max: 10, step: 0.25
l1_ratio = 0.5 | label: l1_ratio (aandeel lasso), min: 0, max: 1, step: 0.05
straf_l1 = lambda * l1_ratio * abs(a) | label: L1-deel van de straf, decimals: 4
straf_l2 = lambda * (1 - l1_ratio) * 0.5 * a ** 2 | label: L2-deel van de straf, decimals: 4
straf_totaal = lambda * l1_ratio * abs(a) + lambda * (1 - l1_ratio) * 0.5 * a ** 2 | label: Totale straf, decimals: 4
```

## Ook bij classificatie

Regularisatie is niet iets van lineaire regressie alleen; dezelfde straftermen
zitten op [logistische regressie](./logistische-regressie.md). Daar is het zelfs
standaard aan in scikit-learn, om te voorkomen dat de coëfficiënten bij perfect
scheidbare data naar oneindig lopen.

Eén verwarrende conventie: bij `LogisticRegression` heet de parameter `C`, en dat
is de **inverse** strafsterkte. Kleine `C` betekent veel regularisatie, grote `C`
weinig — precies andersom dan `alpha` bij `Ridge` en `Lasso`.

```code-group
=== ridge | python
from sklearn.linear_model import Ridge
Ridge(alpha=1.0)          # groter alpha = meer straf
=== lasso | python
from sklearn.linear_model import Lasso
Lasso(alpha=0.1)          # groter alpha = meer straf
=== elastic net | python
from sklearn.linear_model import ElasticNet
ElasticNet(alpha=0.1, l1_ratio=0.5)
=== logistisch | python
from sklearn.linear_model import LogisticRegression
LogisticRegression(penalty="l2", C=1.0)   # KLEINER C = meer straf
```

## Wat kies je

| Situatie | Kies |
|----------|------|
| Veel features, je vermoedt dat de meeste ertoe doen | **Ridge** |
| Veel features, je vermoedt dat de meeste ruis zijn | **Lasso** |
| Meer features dan samples ($p > n$) | **Lasso** of **elastic net** |
| Groepen sterk gecorreleerde features | **Elastic net** |
| Je hebt een uitlegbaar, klein model nodig | **Lasso** |
| Weinig features, veel data | Geen — gewoon kleinste kwadraten |

Twijfel je: probeer beide met kruisvalidatie en kijk welke wint. Het kost drie
regels code, en de uitkomst is informatiever dan elk vuistregeltje.

## Onthoud

- Regularisatie ruilt een slechtere trainingsfit in voor betere generalisatie.
- Ridge deelt door $1 + \lambda$ — krimpt alles, nooit tot nul.
- Lasso trekt $\lambda$ af — zet kleine coëfficiënten op exact nul, en doet
  daarmee featureselectie.
- Standaardiseer altijd; anders straf je eenheden in plaats van complexiteit.
- $\lambda$ kies je met kruisvalidatie, nooit op de trainingsscore.
- Bij `LogisticRegression` is `C` omgekeerd aan `alpha`.

Verder: [R²](../metrics/r-kwadraat.md) laat zien waarom een ongeregulariseerd
model met veel features altijd te mooi lijkt op de trainingsdata.
