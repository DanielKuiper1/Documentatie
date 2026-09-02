# Algebra

Wiskunde wordt met KaTeX in de browser gezet, dus het blijft onderdeel van de
statische build.

## Wiskunde in de zin

De oppervlakte van een cirkel is $A = \pi r^2$, en de gulden snede is
$\varphi = \frac{1 + \sqrt{5}}{2} \approx 1{,}618$.

## De abc-formule

Voor $ax^2 + bx + c = 0$ met $a \neq 0$ geldt:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

De discriminant $\Delta = b^2 - 4ac$ bepaalt hoeveel reële oplossingen er zijn:

| $\Delta$ | Oplossingen |
|-----------|-------------|
| $\Delta > 0$ | Twee verschillende reële oplossingen |
| $\Delta = 0$ | Eén samenvallende reële oplossing |
| $\Delta < 0$ | Twee complex toegevoegde oplossingen |

Probeer het:

```interactive
title: Oplossingen van een vierkantsvergelijking
a = 1 | label: a, min: -10, max: 10, step: 0.5
b = -3 | label: b, min: -20, max: 20, step: 0.5
c = 2 | label: c, min: -20, max: 20, step: 0.5
discriminant = b ** 2 - 4 * a * c | label: Discriminant Δ, decimals: 2
root1 = (0 - b + sqrt(max(b ** 2 - 4 * a * c, 0))) / (2 * a) | label: Oplossing 1, decimals: 4
root2 = (0 - b - sqrt(max(b ** 2 - 4 * a * c, 0))) / (2 * a) | label: Oplossing 2, decimals: 4
```

> Oplossingen hebben alleen betekenis als $\Delta \geq 0$; de evaluator begrenst
> de wortel, zodat het veld nooit `NaN` toont.

De parabool erbij, met dezelfde coëfficiënten:

```plot
title: y = ax² + bx + c
x: -6..6 | label: x
y: -20..20 | label: y
a = 1 | label: a, min: -3, max: 3, step: 0.1
b = -3 | label: b, min: -10, max: 10, step: 0.5
c = 2 | label: c, min: -10, max: 10, step: 0.5
curve: a * x ** 2 + b * x + c | label: ax² + bx + c
```

## Sommen en producten

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
\qquad
\prod_{i=1}^{n} i = n!
$$

## Matrices

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}^{-1}
=
\frac{1}{ad - bc}
\begin{bmatrix}
d & -b \\
-c & a
\end{bmatrix}
$$

Zie ook [analyse](./analyse.md).
