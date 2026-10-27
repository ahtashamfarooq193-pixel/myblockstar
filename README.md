# Blockstar homepage concept

A React, Vite, and Tailwind CSS homepage redesign. Original homepage copy,
brand logo, illustrations, leadership portraits, favicon, and font families
are preserved. The original section markup lives in `src/sections/` so its
copy can be reviewed independently from the redesign styling.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

## Build

```powershell
npm.cmd run build
npm.cmd run preview
```

## Interaction

- Logo smoothly returns to the top; reload starts at the hero.
- Homepage navigation scrolls to the relevant section.
- Existing external destinations remain linked to the original website.
- Metrics count up once when they enter the viewport.
- Selected elements reveal as the visitor scrolls.
- Reduced-motion preferences disable reveals and counters.
- The mobile navigation supports keyboard and Escape controls.
- The language selector retains the original Google Translate mechanism.
- The investor form validates locally and explicitly reports that the preview
  has not sent a request. Its contact link opens an email to JET.

## Assets and copy

Reference: https://myblockstar.com/

Original asset URLs are recorded in `reference-assets.json`. Fonts are hosted
locally. The architectural hero illustration is custom SVG artwork and is
illustrative; it does not depict a verified portfolio property.

The homepage's investment and token figures are reproduced as supplied copy,
including its launch date. They have not been independently verified.

## Browser verification

With the dev server running on port 5173:

```powershell
node verify-homepage.mjs
```

This checks desktop/mobile overflow, image loading, navigation, reload,
the form preview, browser errors, and reduced-motion rendering. It writes
desktop and mobile screenshots into the ignored `screenshots/` directory.
