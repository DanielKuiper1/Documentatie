# Regressie of classificatie

Binnen supervised learning bepaalt het **meetniveau van de target** alles wat
daarna komt: welk model je gebruikt, welke loss-functie zin heeft, en welke
getallen je uiteindelijk rapporteert. Kies je hier verkeerd, dan is de rest van
je pijplijn onherstelbaar scheef.

De vraag is simpel: **kun je zinvol optellen en aftrekken in je target?**

| | Regressie | Classificatie |
|---|---|---|
| Target $y$ | Een getal op een schaal | Een categorie uit een vaste lijst |
| Voorbeeld | Huisprijs, temperatuur, levensduur | Spam/geen spam, cijfer 0–9, ziektebeeld |
| "Ernaast zitten" betekent | Een afstand, in de eenheid van $y$ | Fout of goed — maar niet elke fout kost evenveel |
| Model | [Lineaire regressie](../modellen/lineaire-regressie.md) | [Logistische regressie](../modellen/logistische-regressie.md) |
| Loss | [MSE, MAE](../metrics/loss-functies.md) | Log-loss (cross-entropy) |
| Metric | [R²](../metrics/r-kwadraat.md), RMSE, MAE | [Precision, recall, F1, ROC-AUC](../metrics/classificatie-metrics.md) |

## De test: is het verschil betekenisvol?

Bij regressie is $\hat{y} - y$ een echt getal met een echte betekenis. Voorspel
je € 310.000 voor een huis van € 300.000, dan zit je € 10.000 mis — en twee keer
zo ver mis als bij € 5.000.

Bij classificatie bestaat dat verschil niet. Voorspel je "kat" waar "hond" moest
staan, dan is "hond min kat" betekenisloos. Je kunt alleen zeggen: fout.

Deze pagina's zijn onvermijdelijk verwarrend zolang je vasthoudt aan het idee
dat classificatie "regressie met hele getallen" is. Dat is het niet.

## De valkuil: getallen die geen getallen zijn

Labels worden vaak als getal opgeslagen, en dat verleidt tot regressie op iets
wat categorisch is.

| Voorbeeld | Ziet eruit als | Is eigenlijk | Waarom |
|-----------|----------------|--------------|--------|
| Postcode 1011, 1012 | Getal | Categorie | 1012 is niet "meer" dan 1011 |
| Klantsegment 1, 2, 3 | Getal | Categorie | Segment 2 ligt niet tussen 1 en 3 in |
| Sterrenbeoordeling 1–5 | Getal | Ordinaal | Volgorde klopt, afstand niet per se |
| Aantal bestellingen | Getal | Telling | Een echt getal — regressie mag |

De postcode-valkuil is de klassieker: train een lineair model op postcodes en het
model concludeert dat prijs geleidelijk stijgt met het postcodenummer. Dat is
geen inzicht, dat is een artefact van hoe iemand ooit nummers uitdeelde.

De oplossing is **one-hot encoding**: elke categorie wordt een eigen kolom met
een 0 of 1, zodat er geen volgorde in zit die er niet is.

```python-run
import pandas as pd

klanten = pd.DataFrame({
    "id": [1, 2, 3, 4],
    "stad": ["Amsterdam", "Utrecht", "Amsterdam", "Rotterdam"],
})

print("Verkeerd — een label-nummer suggereert een volgorde:")
print(klanten.assign(stad_nr=klanten["stad"].astype("category").cat.codes))

print("\nGoed — one-hot, elke stad een eigen kolom:")
table(pd.get_dummies(klanten, columns=["stad"], dtype=int))
```

## Ordinale targets: het grijze gebied

"Slecht / matig / goed / uitstekend" heeft wél een volgorde, maar geen bekende
afstanden. Is het gat tussen slecht en matig even groot als tussen goed en
uitstekend? Waarschijnlijk niet, en niemand weet hoeveel niet.

Er zijn drie werkbare keuzes:

1. **Behandel als classificatie.** Veilig, maar je gooit de volgorde weg: het
   model wordt niet extra gestraft voor "slecht" waar "uitstekend" moest staan.
2. **Behandel als regressie** op 1–4. Je wint de volgorde, maar legt gelijke
   afstanden op die je niet kunt onderbouwen.
3. **Ordinale regressie.** Modelleert drempels tussen opeenvolgende niveaus. Het
   juiste antwoord, en het meeste werk.

In de praktijk is optie 1 met een metric die afstand meeweegt (zoals *quadratic
weighted kappa*) vaak het beste compromis.

## Van regressie naar classificatie en terug

De grens is doorlaatbaar, maar in één richting veel veiliger dan de andere.

**Regressie → classificatie** door te binnen: "huis boven € 400.000, ja of nee?"
Dat mag, maar je gooit informatie weg. € 401.000 en € 900.000 vallen daarna in
hetzelfde hokje. Doe het alleen als de beslissing die erop volgt echt binair is.

**Classificatie → regressie** door labels als getal te trainen. Dit is bijna
altijd fout, om de reden hierboven: het model gaat orde en afstand aannemen die
er niet zijn.

De nuttige tussenvorm is dat een classificatiemodel intern een **kans**
voorspelt — een getal tussen 0 en 1 — en dat pas op het laatst afrondt naar een
label. Die kans is waardevoller dan het label, want je kunt de drempel
verschuiven zonder opnieuw te trainen. Dat is precies wat
[logistische regressie](../modellen/logistische-regressie.md) doet.

## Beslisboom

```
Wat is y?

├─ Een getal waarin optellen zinvol is (prijs, gewicht, duur, telling)
│  └─ REGRESSIE  → lineaire regressie, RMSE/MAE/R²
│
├─ Twee categorieën (ja/nee, fraude/geen fraude)
│  └─ BINAIRE CLASSIFICATIE → logistische regressie, precision/recall/ROC-AUC
│
├─ Meer dan twee categorieën, zonder volgorde
│  └─ MULTICLASS → softmax-regressie, accuracy + per-klasse F1
│
└─ Categorieën mét volgorde, zonder bekende afstand
   └─ ORDINAAL → classificatie met een afstandsgevoelige metric
```

## Onthoud

- Het meetniveau van $y$ bepaalt model, loss én metric — beslis het eerst.
- Een label dat als getal is opgeslagen, is nog steeds een label.
- Bewaar de kans zolang je kunt; rond pas af op het laatste moment.

Verder naar [Modellen](../modellen/index.md), waar beide takken hun eigen
werkpaard krijgen.
