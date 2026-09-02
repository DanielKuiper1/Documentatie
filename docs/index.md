# Documentatie

Een kale, volledig statische documentatiesite: Markdown erin, een site in
GitHub-stijl eruit. Elk bestand onder `docs/` wordt automatisch een route én een
item in de zijbalk. Er is geen routetabel en geen zijbalkconfiguratie.

## Wat staat hier

- [Installatie](./aan-de-slag/installatie.md) — de site lokaal draaien.
- [Configuratie](./aan-de-slag/configuratie.md) — de paar knoppen die er zijn.
- [Basis](./handleidingen/basis.md) — welke Markdown wordt ondersteund.
- [Geavanceerd](./handleidingen/geavanceerd.md) — interactieve voorbeelden en tabellen.
- [Lineaire regressie](./handleidingen/lineaire-regressie.md) — grafieken waarin je punten kunt slepen.
- [Componenten](./componenten.md) — alle componenten met voorbeelden.
- [Referentie](./referentie.md) — alle syntaxis op één pagina.

## Een voorproefje

Wiskunde staat gewoon in de zin — de oppervlakte van een cirkel is
$A = \pi r^2$ — en als blok:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Berekeningen rekenen live mee:

```interactive
title: Samengestelde rente
principal = 1000 | label: Inleg, min: 0, max: 20000, step: 100, prefix: $
rate = 5 | label: Rentepercentage, min: 0, max: 20, step: 0.1, suffix: %
years = 10 | label: Looptijd in jaren, min: 1, max: 40, step: 1
amount = principal * (1 + rate / 100) ** years | label: Eindbedrag, prefix: $, decimals: 2
```
