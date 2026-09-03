# Modellen

Een model is een **familie van functies met knoppen eraan**. Je kiest de vorm —
een rechte lijn, een S-curve — en het trainen draait aan de knoppen tot de
voorspellingen zo dicht mogelijk bij de waarnemingen liggen.

Op deze site staan twee modellen centraal. Ze zijn de eenvoudigste van hun soort,
en juist daarom de beste plek om te begrijpen wat trainen eigenlijk is. Alles wat
je hier leert — parameters, loss, gradient descent, overfitting — geldt
onveranderd voor een neuraal netwerk met een miljoen parameters.

| Model | Voor | Voorspelt | Loss |
|-------|------|-----------|------|
| [Lineaire regressie](/modellen/lineaire-regressie.md) | Regressie | Een getal | [MSE](../metrics/loss-functies.md) |
| [Logistische regressie](/modellen/logistische-regressie.md) | Binaire classificatie | Een kans tussen 0 en 1 | Log-loss |
| [Ridge en lasso](/modellen/ridge-en-lasso.md) | Beide, bij veel features | Hetzelfde, maar met kleinere coëfficiënten | Loss + strafterm |

Weet je nog niet welke kolom van toepassing is, lees dan eerst
[regressie of classificatie](../grondbeginselen/regressie-of-classificatie.md).

## Wat elk model gemeen heeft

Beide modellen — en vrijwel elk supervised model — bestaan uit dezelfde drie
onderdelen:

1. **Een hypothese.** De vorm van de functie, met parameters erin. Voor beide
   modellen hier begint dat met dezelfde lineaire combinatie:
   $z = ax + b$.
2. **Een loss-functie.** Eén getal dat zegt hoe slecht de huidige parameters de
   data beschrijven.
3. **Een optimalisatiemethode.** De procedure die de parameters aanpast om die
   loss te verkleinen.

Het verschil tussen lineaire en logistische regressie zit alleen in stap 1 en 2:
logistische regressie duwt $z$ door een sigmoïde om er een kans van te maken, en
gebruikt daarom een andere loss. De machinerie eromheen is identiek.

[Ridge en lasso](/modellen/ridge-en-lasso.md) zijn geen derde model, maar een
ingreep in stap 2: ze plakken een strafterm achter de loss die grote parameters
duur maakt. Dat werkt daarom bij beide modellen hierboven, en bij vrijwel elk
ander model dat een loss minimaliseert.

## Gradient descent in het kort

De optimalisatiemethode is bij beide modellen (en bij vrijwel alles wat groter
is) **gradient descent**. Het idee: bereken de helling van de loss ten opzichte
van elke parameter, en zet een stapje bergafwaarts.

$$
\theta \leftarrow \theta - \eta \cdot \frac{\partial L}{\partial \theta}
$$

De **leersnelheid** $\eta$ bepaalt de stapgrootte, en is de hyperparameter die je
het vaakst verkeerd zult zetten. Te klein en het duurt eeuwig; te groot en je
schiet over het minimum heen en divergeert.

```interactive
title: Eén parameter, gradient descent met de hand
description: De loss is (w - 4)^2, met minimum bij w = 4. Kijk wat de leersnelheid doet met de eerste stap.
w = 0 | label: Startwaarde w, min: -10, max: 10, step: 0.5
eta = 0.1 | label: Leersnelheid, min: 0.01, max: 1.2, step: 0.01
gradient = 2 * (w - 4) | label: Helling dL/dw
stap = eta * 2 * (w - 4) | label: Stapgrootte
w_nieuw = w - eta * 2 * (w - 4) | label: w na één stap
loss_oud = (w - 4) ** 2 | label: Loss voor
loss_nieuw = (w - eta * 2 * (w - 4) - 4) ** 2 | label: Loss na
```

Zet de leersnelheid op 1,1 en kijk wat er met "Loss na" gebeurt: hoger dan
ervoor. Dat is divergentie, en in een echt model zie je het terug als een loss
die naar `NaN` loopt.

Bij $\eta = 0{,}5$ land je in één stap precies op het minimum — dat is toeval van
deze specifieke functie, niet iets om op te rekenen.

## Waarom deze twee eenvoudige modellen

Er zijn krachtigere modellen: random forests, gradient boosting, neurale
netwerken. Toch begin je hier, om drie redenen.

- **Ze zijn uitlegbaar.** Een coëfficiënt van 2,3 betekent letterlijk: één
  eenheid $x$ erbij geeft 2,3 eenheden $y$ erbij. Bij een random forest is er
  geen zin die dat vervangt.
- **Ze zijn een ondergrens.** Als een lineair model 80 % van de variantie
  verklaart, moet je complexe model daar substantieel overheen om het extra werk
  waard te zijn.
- **Ze falen zichtbaar.** Een lineair model op kromme data ziet er duidelijk
  verkeerd uit. Een neuraal netwerk op dezelfde data ziet er goed uit en is
  ondertussen aan het overfitten.

## Verder

Lees de twee modelpagina's, en ga daarna naar [Metrics](../metrics/index.md) —
want een getraind model zonder eerlijke beoordeling is nog geen resultaat.
