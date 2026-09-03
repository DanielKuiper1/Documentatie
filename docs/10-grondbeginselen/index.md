# Grondbeginselen

Voordat je een model kiest, moet je twee vragen kunnen beantwoorden: *wat voor
soort leerprobleem is dit?* en *wat voor soort target voorspel ik?* De eerste
vraag bepaalt of je überhaupt gelabelde data nodig hebt, de tweede bepaalt welk
model en welke metric zinnig zijn.

Beide vragen beantwoord je vóór je één regel code schrijft. Sla je ze over, dan
merk je dat pas als je een R² van 0,02 op een classificatieprobleem zit te
verklaren.

## In dit onderdeel

| Pagina | Waarover |
|--------|----------|
| [Soorten machine learning](/grondbeginselen/soorten-machine-learning.md) | Supervised, unsupervised en reinforcement learning |
| [Regressie of classificatie](/grondbeginselen/regressie-of-classificatie.md) | Het meetniveau van de target bepaalt alles |

## De woordenlijst

Deze termen komen op elke pagina terug. Ze staan hier zodat je ze één keer hoeft
te leren.

| Term | Betekenis |
|------|-----------|
| **Feature** ($x$) | Een kenmerk dat je als invoer gebruikt: leeftijd, oppervlakte, aantal studie-uren. |
| **Target** ($y$) | Wat je wilt voorspellen. Ook wel *label* (classificatie) of *responsvariabele* (regressie). |
| **Sample** | Eén rij: één huis, één patiënt, één student — met al zijn features en zijn target. |
| **Parameter** | Een getal dat het model tijdens het trainen zelf leert, zoals de helling $a$ van een lijn. |
| **Hyperparameter** | Een getal dat jij vooraf instelt, zoals de leersnelheid of de drempelwaarde. |
| **Loss** | Hoe slecht het model op dít moment is. Trainen = loss minimaliseren. |
| **Metric** | Hoe goed het resultaat achteraf is, in een eenheid die een mens begrijpt. |
| **Trainingsset** | De data waarop het model zijn parameters leert. |
| **Testset** | Data die het model nooit gezien heeft, gebruikt om eerlijk te beoordelen. |

## Waarom je altijd splitst

Een model dat de trainingsdata uit zijn hoofd leert, scoort daar perfect en op
nieuwe data waardeloos. Dat heet **overfitting**, en je ziet het alleen als je
een deel van de data apart houdt.

De standaardsplitsing is 80 % trainen, 20 % testen — en je kijkt pas naar de
testset als je klaar bent. Kijk je er tussendoor naar en pas je je model daarop
aan, dan is die testset stilletjes onderdeel van je training geworden en meet je
opnieuw jezelf.

```python-run
import numpy as np
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
x = np.arange(100).reshape(-1, 1)
y = 3 * x.ravel() + rng.normal(0, 10, 100)

x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.2, random_state=42
)

print("trainen:", len(x_train), "samples")
print("testen: ", len(x_test), "samples")
```

`random_state` zet de toevalsgenerator vast, zodat dezelfde code morgen dezelfde
splitsing geeft. Zonder die regel is elk resultaat dat je rapporteert
onreproduceerbaar.

## Hoe verder

Weet je eenmaal welk type probleem je hebt, ga dan naar
[Modellen](../modellen/index.md) om te zien hoe de modellen zelf werken, en
daarna naar [Metrics](../metrics/index.md) om te beoordelen of het deugt.
