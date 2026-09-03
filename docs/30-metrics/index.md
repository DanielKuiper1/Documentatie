# Metrics

Een getraind model komt met een getal terug. De vraag is wat dat getal waard is.
Een RMSE van 12 is uitstekend als je huisprijzen in duizenden euro's voorspelt en
rampzalig als je schoolcijfers voorspelt — de metric zegt niets zonder de context
van je target.

Op deze pagina's staat welke maatstaven er zijn, wat ze meten, en waar ze je om
de tuin leiden.

## In dit onderdeel

| Pagina | Waarover |
|--------|----------|
| [Loss-functies](/metrics/loss-functies.md) | MSE, RMSE en MAE: hoe je fout in één getal vangt |
| [R²](/metrics/r-kwadraat.md) | Is die fout veel of weinig, vergeleken met niets doen? |
| [MSE of MAE?](/metrics/mse-of-mae.md) | Wat uitschieters met je keuze doen |
| [Classificatie-metrics](/metrics/classificatie-metrics.md) | Confusion matrix, precision, recall, F1, ROC-AUC |

## Loss en metric zijn niet hetzelfde

Ze lijken op elkaar — allebei meten ze fout — maar ze hebben een verschillend
doel, en dat verschil verklaart waarom je vaak twee getallen bijhoudt.

| | Loss | Metric |
|---|------|--------|
| Waarvoor | Het model *trainen* | Het resultaat *beoordelen* |
| Wie leest het | Het optimalisatie-algoritme | Jij, je opdrachtgever |
| Eis | Differentieerbaar, liefst convex | Begrijpelijk, in een zinvolle eenheid |
| Berekend op | De trainingsset, elke iteratie | De testset, achteraf |
| Voorbeeld | MSE, log-loss | RMSE, R², F1, ROC-AUC |

Het duidelijkste voorbeeld is classificatie: je *traint* op log-loss (glad,
differentieerbaar) maar je *rapporteert* recall ("we vangen 87 % van de fraude").
Recall kun je niet minimaliseren met gradient descent — het is een trapfunctie
met helling nul — en log-loss kun je niet uitleggen in een vergadering.

## Welke metric wanneer

Kies eerst het type probleem
([regressie of classificatie](../grondbeginselen/regressie-of-classificatie.md)),
dan de vraag die je eigenlijk stelt.

### Regressie

| Je vraag | Metric | Waarom |
|----------|--------|--------|
| Hoeveel zit ik er gemiddeld naast? | [RMSE](/metrics/loss-functies.md#rmse) | In de eenheid van $y$, straft grote fouten zwaar |
| Hoeveel zit ik er *typisch* naast? | [MAE](/metrics/loss-functies.md#mae-mean-absolute-error) | De mediaanachtige fout, ongevoelig voor uitschieters |
| Is dit beter dan gewoon het gemiddelde gokken? | [R²](/metrics/r-kwadraat.md) | Schaalvrij, vergelijkbaar tussen datasets |
| Zit ik er procentueel naast? | MAPE | Als relatieve fout telt, niet absolute |

Rapporteer bij voorkeur RMSE *en* MAE. Staan ze ver uit elkaar, dan heb je
uitschieters — zie [MSE of MAE?](/metrics/mse-of-mae.md).

### Classificatie

| Je vraag | Metric | Waarom |
|----------|--------|--------|
| Hoe vaak heb ik gelijk? | Accuracy | Alleen bruikbaar bij gebalanceerde klassen |
| Als ik alarm sla, klopt het dan? | Precision | Kosten van vals alarm zijn hoog |
| Vang ik alles wat ik moet vangen? | Recall | Kosten van een gemiste zaak zijn hoog |
| Beide, in één getal | F1 | Harmonisch gemiddelde van precision en recall |
| Hoe goed rangschikt het model? | ROC-AUC | Onafhankelijk van de gekozen drempel |
| Idem, bij zeldzame positieven | PR-AUC | ROC-AUC is dan te optimistisch |

Alles hierover staat in
[classificatie-metrics](/metrics/classificatie-metrics.md).

## De valkuil: de testset opbranden

Elke keer dat je je testscore bekijkt en daarna je model aanpast, lekt er een
beetje informatie uit die testset je model in. Doe dat vijftig keer en je hebt de
testset net zo goed overfit als de trainingsset — je score is dan te optimistisch
zonder dat iets je waarschuwt.

De nette oplossing is drie sets:

| Set | Waarvoor | Hoe vaak kijken |
|-----|----------|-----------------|
| **Train** | Parameters leren | Continu |
| **Validatie** | Hyperparameters kiezen, modellen vergelijken | Zo vaak als nodig |
| **Test** | De eindscore | Eén keer, aan het eind |

Bij weinig data vervang je de validatieset door **kruisvalidatie**: splits de
trainingsdata in $k$ delen, train $k$ keer op $k-1$ delen en beoordeel op het
overgebleven deel. Je krijgt $k$ scores; het gemiddelde is je schatting en de
spreiding vertelt hoe stabiel die is.

```python-run
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 80).reshape(-1, 1)
y = 3 * x.ravel() + 5 + rng.normal(0, 4, 80)

scores = cross_val_score(LinearRegression(), x, y, cv=5, scoring="r2")

for i, s in enumerate(scores, 1):
    print(f"vouw {i}: R2 = {s:.4f}")
print(f"\ngemiddeld: {scores.mean():.4f}  (spreiding {scores.std():.4f})")
```

Een grote spreiding tussen de vouwen betekent dat je schatting onbetrouwbaar is —
meestal omdat de dataset te klein is voor het model dat je erop loslaat.

## Onthoud

- Één metric is nooit genoeg; rapporteer er twee die verschillende dingen meten.
- Een metric zonder vergelijkingspunt (een simpel basismodel) zegt niets.
- Beoordeel altijd op data die het model niet gezien heeft.
