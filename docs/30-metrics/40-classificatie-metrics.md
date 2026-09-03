# Classificatie-metrics

Bij [regressie](./loss-functies.md) is fout een afstand. Bij classificatie is
fout een *soort*: je zei ja terwijl het nee was, of nee terwijl het ja was. Die
twee kosten zelden hetzelfde, en dat is de reden dat één getal hier nooit genoeg
is.

## De confusion matrix

Alles begint hier. Vier vakjes, en elke classificatie-metric is een breuk van
deze getallen.

| | **Voorspeld: positief** | **Voorspeld: negatief** |
|---|---|---|
| **Echt positief** | TP — terecht alarm | FN — gemist |
| **Echt negatief** | FP — vals alarm | TN — terecht met rust gelaten |

De namen lezen van achter naar voren: **F**alse **P**ositive = het model zei
positief, en dat was onjuist.

Welke klasse "positief" heet, kies je zelf, en die keuze bepaalt alles wat volgt.
Conventie: positief is het zeldzame, dure geval — de fraude, de tumor, de
storing. Niet het vaakst voorkomende.

## Waarom accuracy je voor de gek houdt

$$
\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}
$$

Bij een fraudepercentage van 1 % haalt het model "altijd nee" 99 % accuracy,
zonder ooit één fraudegeval te vinden. Het is het nutteloosste model dat er
bestaat en het verslaat vrijwel elk serieus model op deze metric.

```interactive
title: Accuracy bij zeldzame gevallen
description: Zet het percentage positieven laag en zie hoe goed "altijd nee" scoort.
totaal = 10000 | label: Aantal samples, min: 100, max: 100000, step: 100
percentage = 1 | label: Percentage echt positief, min: 0.1, max: 50, step: 0.1
positief = totaal * percentage / 100 | label: Aantal echte positieven, decimals: 0
accuracy_altijd_nee = (totaal - totaal * percentage / 100) / totaal | label: Accuracy van "altijd nee", decimals: 4
recall_altijd_nee = 0 | label: Recall van "altijd nee", decimals: 4
```

Accuracy is alleen bruikbaar bij ongeveer gelijk verdeelde klassen én wanneer
beide fouttypen even duur zijn. Dat is zeldzamer dan het lijkt.

## Precision en recall

Deze twee stellen verschillende vragen, en welke je belangrijker vindt hangt
volledig af van wat een fout kost.

$$
\text{Precision} = \frac{TP}{TP + FP}
\qquad
\text{Recall} = \frac{TP}{TP + FN}
$$

- **Precision** — *als het model alarm slaat, hoe vaak klopt dat?* De noemer is
  alles wat het model positief noemde. Lage precision = veel vals alarm.
- **Recall** — *van alles wat echt positief was, hoeveel vond ik?* De noemer is
  alles wat echt positief was. Lage recall = veel gemist.

Ezelsbruggetje: precision kijkt naar **jouw kolom**, recall naar **de echte rij**.

| Toepassing | Wat telt | Waarom |
|------------|----------|--------|
| Spamfilter | **Precision** | Een echte mail in de spammap is erger dan één spammetje in de inbox |
| Kankerscreening | **Recall** | Een gemiste diagnose is onvergelijkbaar veel duurder dan een extra controle |
| Fraudedetectie | **Beide** | Elk vals alarm kost onderzoekstijd, elk gemist geval kost geld |
| Zoekresultaten (top 10) | **Precision** | Niemand kijkt verder dan de eerste pagina |

## De afruil, met de hand

Precision en recall bewegen tegengesteld zodra je aan de
[drempel](../modellen/logistische-regressie.md#van-kans-naar-label) draait. Sla
sneller alarm en je vindt meer (recall omhoog), maar met meer vals alarm
(precision omlaag).

```interactive
title: Confusion matrix, met de hand ingevuld
description: Verdeel 1000 samples over de vier vakjes en kijk wat elke metric doet.
tp = 80 | label: TP - terecht alarm, min: 0, max: 500, step: 1
fp = 20 | label: FP - vals alarm, min: 0, max: 500, step: 1
fn = 20 | label: FN - gemist, min: 0, max: 500, step: 1
tn = 880 | label: TN - terecht met rust, min: 0, max: 2000, step: 10
accuracy = (tp + tn) / (tp + tn + fp + fn) | label: Accuracy, decimals: 4
precision = tp / (tp + fp) | label: Precision, decimals: 4
recall = tp / (tp + fn) | label: Recall, decimals: 4
specificiteit = tn / (tn + fp) | label: Specificiteit (TN-rate), decimals: 4
f1 = 2 * tp / (2 * tp + fp + fn) | label: F1-score, decimals: 4
```

Zet FP op 200 en let op het verschil: accuracy zakt een beetje, precision stort
in. Dat is waarom je accuracy niet alleen rapporteert.

## F1: één getal, met een addertje

$$
F_1 = 2 \cdot \frac{\text{precision} \cdot \text{recall}}{\text{precision} + \text{recall}}
= \frac{2\,TP}{2\,TP + FP + FN}
$$

Dit is het **harmonisch** gemiddelde, niet het gewone. Het verschil is
essentieel: het harmonisch gemiddelde wordt naar beneden getrokken door de
laagste van de twee.

```interactive
title: Harmonisch versus gewoon gemiddelde
description: Zet recall op 1,0 en precision op 0,05 en vergelijk de twee gemiddelden.
precision = 0.9 | label: Precision, min: 0.01, max: 1, step: 0.01
recall = 0.6 | label: Recall, min: 0.01, max: 1, step: 0.01
gewoon = (precision + recall) / 2 | label: Gewoon gemiddelde, decimals: 4
f1 = 2 * precision * recall / (precision + recall) | label: F1 (harmonisch), decimals: 4
verschil = (precision + recall) / 2 - 2 * precision * recall / (precision + recall) | label: Verschil, decimals: 4
```

Precision 0,05 en recall 1,0 — het "altijd ja"-model — geeft een gewoon
gemiddelde van 0,525, wat middelmatig klinkt. F1 geeft 0,095, wat de waarheid is.

Waar F1 níét geschikt voor is: F1 negeert TN volledig. In een probleem waar het
correct met rust laten van negatieve gevallen ook waarde heeft, mist F1 die
helft van het verhaal.

## ROC-AUC: beoordelen zonder drempel

Precision, recall en F1 hangen allemaal af van één gekozen drempel. ROC-AUC niet
— die beoordeelt de **rangschikking** van het model over alle drempels tegelijk.

De ROC-curve zet, voor elke mogelijke drempel, de true-positive rate (= recall)
uit tegen de false-positive rate ($FP / (FP + TN)$). De oppervlakte eronder is de
AUC, met een prettige interpretatie:

> **AUC is de kans dat een willekeurig positief geval een hogere score krijgt dan
> een willekeurig negatief geval.**

| AUC | Betekenis |
|-----|-----------|
| 1,0 | Perfecte scheiding |
| 0,8 | Goed onderscheidend vermogen |
| 0,5 | Puur gokken — de diagonaal |
| < 0,5 | Systematisch verkeerd om; draai je labels om |

```python-run
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (confusion_matrix, precision_score, recall_score,
                             f1_score, roc_auc_score, roc_curve)

rng = np.random.default_rng(11)
# 5% positieven: een realistisch ongebalanceerd probleem.
n_neg, n_pos = 950, 50
x = np.concatenate([rng.normal(0, 1, n_neg), rng.normal(1.8, 1, n_pos)]).reshape(-1, 1)
y = np.concatenate([np.zeros(n_neg), np.ones(n_pos)])

model = LogisticRegression().fit(x, y)
kans = model.predict_proba(x)[:, 1]

print(f"{'drempel':>8} {'TP':>4} {'FP':>4} {'FN':>4} {'precision':>10} {'recall':>8} {'F1':>7}")
for t in [0.1, 0.2, 0.3, 0.5, 0.7]:
    pred = (kans >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, pred).ravel()
    print(f"{t:8.2f} {tp:4d} {fp:4d} {fn:4d} "
          f"{precision_score(y, pred, zero_division=0):10.3f} "
          f"{recall_score(y, pred):8.3f} {f1_score(y, pred):7.3f}")

print(f"\nROC-AUC (drempelvrij): {roc_auc_score(y, kans):.4f}")

fpr, tpr, _ = roc_curve(y, kans)
plot(fpr, tpr, label="ROC", x_label="false-positive rate",
     y_label="true-positive rate (recall)", title="ROC-curve")
```

Kijk hoe recall stijgt en precision daalt naarmate de drempel zakt. Dat is de
afruil, en er is geen drempel die beide maximaliseert — er is alleen de drempel
die past bij jouw kosten.

## Bij zeldzame positieven: PR-AUC

ROC-AUC heeft één zwakte, en die valt precies samen met het geval waarvoor je
hem het hardst nodig hebt. De false-positive rate heeft TN in de noemer, en bij
99 % negatieven is die noemer enorm. Duizend valse alarmen op 99.000 negatieven
verschuiven de FPR met 0,01 — de ROC-curve merkt er nauwelijks iets van, terwijl
je onderzoeksteam bedolven wordt.

Bij sterk ongebalanceerde data rapporteer je daarom de **precision-recall-curve**
en zijn oppervlakte (PR-AUC, ook *average precision*). Die gebruikt TN nergens en
blijft daardoor eerlijk. De basislijn is niet 0,5 maar het aandeel positieven —
bij 1 % positieven is een PR-AUC van 0,10 dus een tienvoudige verbetering, geen
slechte score.

## Meer dan twee klassen

Bij $k$ klassen krijg je een $k \times k$-matrix en per klasse een precision en
recall. Die middel je op één van drie manieren, en het verschil doet ertoe:

| Middeling | Hoe | Wanneer |
|-----------|-----|---------|
| **macro** | Gemiddelde van de per-klasse-scores | Elke klasse telt even zwaar — ook de zeldzame |
| **weighted** | Gewogen naar klassegrootte | Je wilt de algemene prestatie |
| **micro** | Alle TP/FP/FN eerst optellen | Gelijk aan accuracy bij enkelvoudige labels |

Macro is de eerlijkste bij ongebalanceerde klassen, omdat een klasse met 20
samples net zo hard meetelt als een met 2.000.

## Een drempel kiezen

De drempel is een **bedrijfsbeslissing**, geen modelparameter. Ken je de kosten,
dan reken je hem gewoon uit: kies de drempel die de verwachte totale kosten
minimaliseert.

```interactive
title: De optimale drempel volgt uit de kosten
description: Vul in wat een vals alarm en een gemiste zaak kosten, en kijk welke drempel goedkoper uitvalt.
kosten_fp = 50 | label: Kosten van een vals alarm, min: 0, max: 5000, step: 10
kosten_fn = 2000 | label: Kosten van een gemiste zaak, min: 0, max: 20000, step: 100
fp_laag = 400 | label: FP bij lage drempel, min: 0, max: 2000, step: 10
fn_laag = 5 | label: FN bij lage drempel, min: 0, max: 500, step: 1
fp_hoog = 30 | label: FP bij hoge drempel, min: 0, max: 2000, step: 10
fn_hoog = 60 | label: FN bij hoge drempel, min: 0, max: 500, step: 1
totaal_laag = fp_laag * kosten_fp + fn_laag * kosten_fn | label: Totale kosten lage drempel, decimals: 0
totaal_hoog = fp_hoog * kosten_fp + fn_hoog * kosten_fn | label: Totale kosten hoge drempel, decimals: 0
verschil = fp_laag * kosten_fp + fn_laag * kosten_fn - (fp_hoog * kosten_fp + fn_hoog * kosten_fn) | label: Verschil (negatief = laag wint), decimals: 0
```

Met een gemiste zaak op € 2.000 en vals alarm op € 50 wint de lage drempel
ruimschoots. Zet de kosten van vals alarm op € 500 en het kantelt. Dezelfde
model, andere beslissing — zonder één regel hertraining.

## Onthoud

- Begin altijd bij de confusion matrix; elke metric is er een breuk van.
- Accuracy is misleidend zodra de klassen ongelijk verdeeld zijn.
- Precision = klopt mijn alarm. Recall = vind ik alles. Kies op basis van kosten.
- F1 is harmonisch: de laagste van de twee domineert.
- ROC-AUC is drempelvrij; bij zeldzame positieven gebruik je PR-AUC.
- De drempel is een kostenafweging, geen technisch detail.

Terug naar [Metrics](./index.md), of naar
[logistische regressie](../modellen/logistische-regressie.md) voor het model dat
deze kansen produceert.
