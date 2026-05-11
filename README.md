# Loot Pinata

A right-click loot generator for [Owlbear Rodeo](https://www.owlbear.rodeo/). Defeat a monster, right-click the token, roll loot.

## Install

Once GitHub Pages is live, the install URL will be:

```
https://ttrpg-wiki.github.io/Loot-Pinata/manifest.json
```

In Owlbear Rodeo: open the Extensions panel → "Add Extension" → paste the URL.

## Supported systems

- **D&D 5e** — DMG Individual Treasure tables by CR
- **Pathfinder 2e** — Treasure-by-Level (levels 1–20)
- **Shadowdark** — Tier-based treasure with magic items from the Core Rulebook
- **OSE / B/X** — All 21 classic Treasure Types (A through V)
- **Custom** — Upload your own JSON loot tables, or browse community submissions

## Community Tables

Anyone can contribute a loot table — see [CONTRIBUTING.md](CONTRIBUTING.md). PR a JSON file into `public/community-tables/`, and once merged it appears in every install of the extension under "Browse community."

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/src/loot-display.html` to work on the panel directly, or paste `http://localhost:5173/manifest.json` into a local Owlbear Rodeo instance.

## Deploy

Pushing to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds with Vite and publishes to the `gh-pages` branch. Enable GitHub Pages in repo settings → Pages → set source to `gh-pages` branch.
