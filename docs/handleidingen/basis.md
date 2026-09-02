# Basis

Alles op deze pagina is gewone Markdown.

## Tekst

Tekst kan **vet**, *cursief*, ***allebei***, ~~doorgestreept~~ of `code in de
regel` zijn. Links werken [intern](../referentie.md) en
[extern](https://vuejs.org).

## Lijsten

- Ongenummerd item
- Nog een item
  - Genest item
  - Nog een genest item

1. Eerste
2. Tweede
3. Derde

## Citaten

> Documentatie is een brief die je aan jezelf in de toekomst schrijft.

## Code

```js
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
console.log(`Totaal: ${total.toFixed(2)}`)
```

```python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

Lange regels schuiven horizontaal in plaats van af te breken:

```sh
docker run --rm -it -v "$(pwd)":/app -w /app node:20 sh -c "npm ci && npm run build && npm run preview -- --host"
```

## Tabellen

| Naam | Waarde | Omschrijving |
|------|-------:|--------------|
| A    |     10 | Voorbeeld A  |
| B    |     20 | Voorbeeld B  |
| C    |    300 | Voorbeeld C  |

## Afbeeldingen

![Een kleine plaatshouder](https://placehold.co/600x160/eeeeee/444444?text=Documentatie)

## Scheidingslijnen

---

Dat is de hele Markdown-oppervlakte. Voor interactieve inhoud, zie
[geavanceerd](./geavanceerd.md).
