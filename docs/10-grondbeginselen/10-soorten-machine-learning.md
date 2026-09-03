# Soorten machine learning

Machine learning valt in drie families uiteen. Wat ze onderscheidt is niet het
algoritme maar de **soort feedback** die het leerproces krijgt: het juiste
antwoord, geen antwoord, of een beloning achteraf.

| Familie | Wat de data bevat | Wat het leert | Typisch voorbeeld |
|---------|-------------------|---------------|-------------------|
| **Supervised** | Features $x$ **én** het juiste antwoord $y$ | Een afbeelding $x \rightarrow y$ | Huisprijs voorspellen, spam herkennen |
| **Unsupervised** | Alleen features $x$ | Structuur in de data zelf | Klanten groeperen, ruis verwijderen |
| **Reinforcement** | Een omgeving die beloningen teruggeeft | Een strategie voor acties | Een game spelen, een robotarm sturen |

De rest van deze site gaat vrijwel volledig over **supervised learning** — dat is
waar regressie, classificatie, loss-functies en metrics thuishoren.

## Supervised learning

Je hebt een dataset waarin voor elke sample het juiste antwoord bekend is. Het
model probeert een functie te vinden die van $x$ naar $y$ komt, en de loss meet
hoe ver het ernaast zit.

$$
\hat{y} = f(x; \theta) \qquad \text{minimaliseer } L(y, \hat{y})
$$

Hier is $\theta$ de verzameling parameters die het model leert, en $\hat{y}$
(spreek uit: "y-dak") de voorspelling — nooit te verwarren met de echte $y$.

Supervised learning splitst weer in tweeën, en dat onderscheid is zo belangrijk
dat het [een eigen pagina](./regressie-of-classificatie.md) heeft:

- **Regressie** — $y$ is een getal op een schaal. Zie
  [lineaire regressie](../modellen/lineaire-regressie.md).
- **Classificatie** — $y$ is een categorie. Zie
  [logistische regressie](../modellen/logistische-regressie.md).

De prijs van supervised learning is het labelen. Tienduizend gelabelde foto's
kosten iemand weken; tienduizend ongelabelde foto's staan al op de server.

## Unsupervised learning

Er is geen $y$. Het model krijgt alleen $x$ en moet zelf structuur vinden. Omdat
er geen juist antwoord is, is er ook geen eenduidige metric — je beoordeelt het
resultaat op bruikbaarheid, niet op correctheid.

De twee hoofdtaken:

- **Clustering** — groepeer samples die op elkaar lijken. *k*-means is de
  bekendste: kies $k$ middelpunten, wijs elk punt toe aan het dichtstbijzijnde,
  verschuif de middelpunten naar het gemiddelde van hun groep, herhaal.
- **Dimensiereductie** — druk veel features samen in weinig, met zo min mogelijk
  informatieverlies. PCA zoekt de richtingen waarin de data het meest varieert.

```python-run
import numpy as np
from sklearn.cluster import KMeans

rng = np.random.default_rng(1)
# Drie wolkjes rond duidelijk verschillende middelpunten.
centra = np.array([[0, 0], [6, 6], [0, 7]])
punten = np.vstack([c + rng.normal(0, 1.0, (30, 2)) for c in centra])

model = KMeans(n_clusters=3, n_init=10, random_state=0).fit(punten)

for i, c in enumerate(model.cluster_centers_):
    aantal = int((model.labels_ == i).sum())
    print(f"cluster {i}: {aantal:2d} punten, midden ({c[0]:5.2f}, {c[1]:5.2f})")
```

Merk op dat de clusternummers willekeurig zijn: cluster 0 kan bij een volgende
run cluster 2 heten. Er is geen "juiste" nummering, want er waren nooit labels.

Het lastige aan *k*-means is dat je $k$ zelf moet kiezen. Vraag om vijf clusters
in data met drie natuurlijke groepen, en je krijgt er vijf — het algoritme heeft
geen manier om te zeggen dat het er te veel zijn.

## Reinforcement learning

Een **agent** neemt acties in een **omgeving** en krijgt daar een **beloning**
voor terug. Er is geen dataset met juiste antwoorden; er is alleen een
scorebord.

De kern is dat de beloning vertraagd en zeldzaam is. Een schaakzet is niet goed
of fout op het moment dat je hem doet — dat blijkt vijftig zetten later uit
winst of verlies. Het leerprobleem is die uitkomst terugverdelen over alle zetten
die eraan bijdroegen (*credit assignment*).

Daaruit volgt het centrale dilemma, **exploration versus exploitation**: doe je
de zet waarvan je weet dat hij redelijk werkt, of probeer je een onbekende die
misschien beter is? Alleen exploiteren betekent nooit iets beters vinden; alleen
exploreren betekent nooit iets verzilveren.

## Grensgevallen

De drie families zijn geen strikte hokjes.

- **Semi-supervised** — weinig gelabelde en veel ongelabelde data. Je traint op
  het gelabelde deel en gebruikt de rest om de structuur beter te leren kennen.
- **Self-supervised** — je verzint zelf labels uit de data. Verberg een woord in
  een zin en laat het model raden welk woord het was; dat is precies hoe grote
  taalmodellen getraind worden. Formeel is het supervised, maar zonder dat er
  ooit iemand labelde.

## Kiezen in de praktijk

1. **Heb ik labels?** Nee → unsupervised. Ja → supervised.
2. **Zijn er genoeg labels?** Een paar honderd is weinig; overweeg
   semi-supervised of eerst meer labelen.
3. **Is er een omgeving die reageert op mijn acties?** Ja, en de beloning komt
   pas achteraf → reinforcement learning.

Ga verder met [regressie of classificatie](./regressie-of-classificatie.md) om
supervised learning verder op te splitsen.
