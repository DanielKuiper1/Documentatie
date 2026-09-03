# Machine learning documentatie

Deze site legt de basis van machine learning uit met werkende voorbeelden. Elke
grafiek is interactief, elke berekening draait in je browser: schuif aan de
parameters, sleep meetpunten en voer de Python-voorbeelden uit.

## Waar begin je?

Lees je voor het eerst mee, volg dan deze volgorde:

1. **[Grondbeginselen](./grondbeginselen/index.md)** — welke soorten machine
   learning er zijn, en hoe je bepaalt of je probleem regressie of classificatie
   is. Zonder dit onderscheid kies je verderop het verkeerde model én de
   verkeerde maatstaf.
2. **[Modellen](./modellen/index.md)** — hoe de modellen zelf werken. Lineaire
   regressie voor getallen, logistische regressie voor labels.
3. **[Metrics](./metrics/index.md)** — hoe je beoordeelt of het model deugt.

## Overzicht

| Onderdeel | Waarover |
|-----------|----------|
| [Soorten machine learning](./grondbeginselen/soorten-machine-learning.md) | Supervised, unsupervised en reinforcement learning |
| [Regressie of classificatie](./grondbeginselen/regressie-of-classificatie.md) | Het meetniveau van de target bepaalt alles |
| [Lineaire regressie](./modellen/lineaire-regressie.md) | Een rechte lijn door een puntenwolk |
| [Logistische regressie](./modellen/logistische-regressie.md) | Van een getal naar een kans en een label |
| [Ridge en lasso](./modellen/ridge-en-lasso.md) | Overfitting afremmen met een strafterm |
| [Loss-functies](./metrics/loss-functies.md) | MSE, RMSE en MAE |
| [R²](./metrics/r-kwadraat.md) | Is die fout veel of weinig? |
| [MSE of MAE?](./metrics/mse-of-mae.md) | Wat uitschieters met je keuze doen |
| [Classificatie-metrics](./metrics/classificatie-metrics.md) | Confusion matrix, precision, recall, F1, ROC-AUC |

## De rode draad

Bijna alles op deze site komt neer op dezelfde drie stappen, en het loont om die
volgorde in je hoofd te houden:

1. **Een model** legt een verband tussen kenmerken $x$ en een target $y$ vast in
   een handjevol parameters.
2. **Een loss-functie** zegt in één getal hoe slecht dat verband de data
   beschrijft. Trainen is niets anders dan dat getal zo klein mogelijk maken.
3. **Een metric** zegt achteraf hoe goed het resultaat is — op data die het
   model tijdens het trainen níét gezien heeft.

Loss en metric zijn niet hetzelfde. Je *traint* op wat wiskundig makkelijk te
minimaliseren is, en je *rapporteert* wat een mens kan lezen. Zie
[Welke metrics gebruik je?](./metrics/index.md#welke-metric-wanneer)
