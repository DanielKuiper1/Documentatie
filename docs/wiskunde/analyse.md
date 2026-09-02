# Analyse

## Afgeleiden

De afgeleide van $f$ in $x$ is de limiet

$$
f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}
$$

Veelgebruikte regels:

| Functie | Afgeleide |
|---------|-----------|
| $x^n$ | $n x^{n-1}$ |
| $e^x$ | $e^x$ |
| $\ln x$ | $\dfrac{1}{x}$ |
| $\sin x$ | $\cos x$ |

## Integralen

$$
\int_a^b f(x)\,dx = F(b) - F(a)
$$

en de Gauss-integraal,

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## Numeriek differentiëren

Een centrale differentie benadert $f'(x)$ voor $f(x) = x^3$:

```interactive
title: Centrale differentie voor f(x) = x³
x = 2 | label: x, min: -5, max: 5, step: 0.1
h = 0.1 | label: Stapgrootte h, min: 0.0001, max: 1, step: 0.0001
approximation = ((x + h) ** 3 - (x - h) ** 3) / (2 * h) | label: Benadering, decimals: 6
exact = 3 * x ** 2 | label: Exacte afgeleide, decimals: 6
error = abs(((x + h) ** 3 - (x - h) ** 3) / (2 * h) - 3 * x ** 2) | label: Absolute fout, decimals: 8
```

Dezelfde twee naast elkaar in een grafiek. Schuif aan $h$: de assen blijven
staan, alleen de lijn beweegt.

```plot
title: Exacte afgeleide tegen centrale differentie
x: -3..3 | label: x
y: -5..30 | label: waarde
h = 0.5 | label: Stapgrootte h, min: 0.01, max: 1.5, step: 0.01
curve: 3 * x ** 2 | label: Exacte afgeleide 3x²
curve: ((x + h) ** 3 - (x - h) ** 3) / (2 * h) | label: Centrale differentie
```

## Een reeks die convergeert

$$
e = \sum_{n=0}^{\infty} \frac{1}{n!}
$$

```interactive-table
title: Termen van 1/n!
| n | Term* | Aandeel in e = Term / e * 100 (suffix: %, decimals: 2) |
| 0 | 1 |
| 1 | 1 |
| 2 | 0.5 |
| 3 | 0.166667 |
| 4 | 0.041667 |
| 5 | 0.008333 |
```

Terug naar [algebra](./algebra.md).
