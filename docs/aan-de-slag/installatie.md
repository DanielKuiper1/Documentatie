# Installatie

## Vereisten

- Node.js 18 of nieuwer
- npm

## Installeren en draaien

```code-group
=== npm | bash
npm install
npm run dev
=== pnpm | bash
pnpm install
pnpm dev
=== yarn | bash
yarn
yarn dev
```

De ontwikkelserver toont een lokale URL. Open die en je kijkt naar de inhoud van
de map `docs/`.

## Een statische site bouwen

```bash
npm run build
npm run preview
```

`npm run build` schrijft een volledig statische bundel naar `dist/`. Er is geen
serveronderdeel: zet `dist/` op elke statische host.

> **Let op**
> De routering gebruikt de History API. Stel je host zo in dat onbekende paden
> terugvallen op `index.html` (`_redirects` bij Netlify, `try_files` bij nginx).

## Verder lezen

Ga door met de [configuratie](./configuratie.md), of spring meteen naar de
[basis](../handleidingen/basis.md).
