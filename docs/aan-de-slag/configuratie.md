# Configuratie

Er valt bewust weinig te configureren.

## Een pagina toevoegen

Maak een `.md`-bestand ergens onder `docs/`. Dat is de hele procedure.

```text
docs/handleidingen/uitrollen.md   ->   /handleidingen/uitrollen
docs/referentie.md                ->   /referentie
docs/index.md                        ->   /
docs/handleidingen/index.md       ->   /handleidingen
```

De titel komt uit het eerste `#`-kopje; ontbreekt dat, dan wordt de
bestandsnaam gebruikt.

## Volgorde

Standaard staan mappen bovenaan en daarna de pagina's, allebei op alfabet. Wil
je een eigen volgorde, zet dan een getal vóór de naam. Dat is optioneel: het
volgnummer bepaalt alleen de plek in de zijbalk en verdwijnt uit de URL en de
titel.

```text
docs/aan-de-slag/installatie.md      ->   /aan-de-slag/installatie
docs/10-aan-de-slag/installatie.md   ->   /aan-de-slag/installatie
```

## Bestanden en mappen

| Pad | Waarvoor |
|-----|----------|
| `docs/` | De Markdown-bronnen, het enige dat je bewerkt |
| `src/utils/docs.js` | Vindt bestanden, bouwt routes en de zijbalkboom |
| `src/utils/markdown.js` | Markdown → blokken (HTML, code, interactief) |
| `src/utils/expression.js` | De afgeschermde expressie-evaluator |
| `src/utils/python.js` | Pyodide-koppeling voor Python-blokken |
| `tailwind.config.js` | Thema-instellingen; donkere modus via `class` |

## Thema

De schakelaar voor licht en donker staat in de kop. De keuze wordt bewaard in
`localStorage` onder `theme`; bij een eerste bezoek volgt de site de
systeeminstelling.
