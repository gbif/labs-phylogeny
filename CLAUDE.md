# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GBIF labs experiment (`gbif/labs-phylogeny`): upload a phylogenetic tree, match its tip names to the GBIF backbone taxonomy, then explore where the selected clades occur on a map of GBIF occurrence data. Create React App (react-scripts 2.x, React 16, class components + Ant Design 4).

## Commands

The project runs on **Node 16** — use it (`nvm use 16`) rather than working around a newer runtime:

```bash
npm start   # dev server on :3000
npm run build
```

On Node 17+ webpack 4's md4 hashing fails (`error:0308010C:digital envelope routines::unsupported`); `NODE_OPTIONS=--openssl-legacy-provider` gets a build through, but Node 16 is what this toolchain targets.

`prestart`/`prebuild` run `copy:maplibre`, which copies maplibre out of `node_modules` into `public/vendor/maplibre/` (gitignored). Running `react-scripts` directly (`npx react-scripts start`) skips that step, so the map will be missing its library on a fresh checkout.

There are no tests — `npm test` is a stub that exits 1. `npm run build:locale` refers to `scripts/translations.js`, which does not exist in the repo. `test.html` is an unrelated standalone phylotree.js scratch page, not a test.

Deployment is a static SPA (`public/_redirects` rewrites everything to `index.html`).

## Architecture

### Three-step wizard

`src/Root.js` renders an antd `Steps` header plus routes, in this order:

1. `/phylogeny` — `components/InputData`: get a Newick string, either pasted/uploaded (`Upload/`) or fetched from Open Tree of Life (`OTL/`, via `gbif.org/api/otl/{ottid,newick}`). Parses it and extracts names.
2. `/match` — `components/Match`: resolves each name against `api.gbif.org/v1/species/match`, 10 concurrent requests via `async.eachLimit`, producing `matchedNames` (name → usageKey).
3. `/explore` — `components/Explore`: split-pane tree + map + legend.

State flows forward only; skipping to a later step without the earlier data renders an empty/error state.

### Shared state

`components/ContextProvider.js` holds all cross-step state in a plain React Context (`newick`, `rawTree`, `names`, `matchedNames`, `defaultMultiplier`, `searchTemplate`) with `setX` mutators, and mirrors the first four to `localStorage` (wrapped in try/catch because large trees blow the quota — a silent failure mode to keep in mind). Components read it via `withContext(mapContextToProps)(Component)`, a Redux-connect-style HOC. Note it also installs `window.gbifGetExplorerState()`, used to dump a shareable state blob from the console.

### Embedded / preloaded mode

`Root.js` accepts `?explore=<url-to-json>` and fetches a saved state object (`rawTree`, `matchedNames`, optional `defaultMultiplier`, `template`, `hideNavigation`), skipping steps 1–2 entirely. `public/legume.json` and `public/acaciaExample.json` are examples of that payload (both still carry a `mapKey`, left over from the Mapbox basemaps; it is ignored now). `hideNavigation: true` hides the wizard chrome so the explorer can be iframed into another site; `template` (also overridable with `?template=`) is a URL pattern containing `{query}` that the Legend uses to link a clade's `taxonKey=…&taxonKey=…` out to an external occurrence search.

### Newick parsing

`components/InputData/parser.js` is a hand-rolled tokenizer + parser, deliberately replacing `biojs-io-newick` (still a dependency, import commented out) because it needs to handle quoted labels containing `:`/`(`/`)`. Output is a nested `{name, branch_length, children}` object stored as `rawTree`.

### Tree enrichment (Explore.js)

`buildTree()` walks `rawTree` once and produces the structures the whole explore view depends on:

- `tree` — decorated nodes with `key` (`"<parentKey>-<index>"`, the canonical node identity everywhere), `title` (GBIF matched name, HTML-formatted, so rendered with `dangerouslySetInnerHTML`), `nodeIndex`, `leafIndex`, `firstLeaf`/`lastLeaf`, `childrenLength` (max root-to-tip distance in the subtree).
- `nodeIdMap` — key → node, used for search and selection lookups.
- `node2LeafTaxonKeys` — key → all GBIF usage keys beneath that node. This is what a map layer is made of.

Selecting a node adds an entry to `state.selected` keyed by node key, with a color from a fixed 12-color pool (`getColor`/`dropColor` recycle colors; random fallback when exhausted), plus `visibleTaxonKeys` capped at the first 200 taxon keys (larger clades warn and are truncated). `Match.js` separately caps trees at `NAME_LIST_LIMIT` (30000) tips.

### Rendering the tree (`Explore/Tree/trees/BalancedTree`)

The tree renderer is the performance-critical part. `TreeWrapper.js` selects the implementation — `BalancedTree` is live, `antTree.js` (antd `Tree`) is the older alternative kept for reference.

`BalancedTree.js` renders nested `<ol>/<li>` where each node's height is `size * elementHeight` (`size` = leaf count) and horizontal indent is `branch_length * multiplier`, so branch lengths are to scale. It virtualizes by pruning: `getVisibleNodes()` rebuilds a subtree containing only nodes within a scroll window before each render, and subtrees under 10px collapse to a placeholder. Font-size buttons (hotkeys 1–4) change `elementHeight`; below `visibleNamesThreshold` (10px) labels are dropped and highlighting switches from a right border to a full background. Styling lives in `styles2.js` (react-jss) and `tree.css`; `simple2.json` is the fallback sample tree.

### Map (`Explore/Map.js`)

Raw `maplibre-gl` (not react-leaflet, despite the dependency), imperatively managed: each selected clade becomes one vector layer sourced from GBIF's ad-hoc MVT tile API (`api.gbif.org/v2/map/occurrence/adhoc/{z}/{x}/{y}.mvt`) with the taxon keys appended as `&taxonKey=` params, drawn as circles in the clade's legend color. On any change to `selected` it removes and re-adds every layer. Basemaps are GBIF's own raster tiles (`tile.gbif.org`, styles `gbif-classic|light|dark|natural`) — no API key anywhere in the app.

Three things about this file are load-bearing and easy to undo by accident:

- **maplibre is not bundled.** `index.html` loads it with a `<script>` tag from `public/vendor/maplibre/` and `Map.js` reads `window.maplibregl`. react-scripts 2 runs babel over `node_modules` (`babel-preset-react-app/dependencies`), and that transpile miscompiles maplibre v2: in the circle painter it renames the array being iterated and the destructured `terrainData` to the same identifier, so drawing any circle layer throws `Cannot read properties of undefined`, and separately the bundled web worker — built by stringifying functions with `Function.prototype.toString()` — comes out broken, leaving tiles stuck in `loading` forever. Importing `maplibre-gl` normally brings both bugs back.
- **`styleReady`.** maplibre throws if a layer is added before the style is loaded. The flag is set in the `style.load` handler; `addLayers`/`removeLayers` no-op until then. `map.isStyleLoaded()` is not a substitute — it stays false during `style.load` until the sources finish too.
- **`setStyle(..., { diff: false })`.** Switching basemaps drops the occurrence layers. With a diff-able style change maplibre applies it in place and never fires `style.load`, so the layers would never come back; the forced reload keeps re-adding them in one place. `style.load` also resets the view to `[0,0]`/zoom 0, so changing basemap zooms back out — pre-existing behaviour, not a side effect of the maplibre swap.

`Legend.js` (react-sortable-hoc) controls layer order — the drag order sets `sortIndex`, which `Map.getLayersAsArray` sorts by so parent clades draw behind children — plus per-layer color, visibility, and zoom-to-node.

## Conventions

- Class components with `withContext` for anything touching shared state; hooks only inside the newer tree/legend components.
- Node identity is the `key` string built in `buildTree`; `leafIndex` is the index used for scrolling and DOM ids (`gb-tree-node-<leafIndex>`).
- GBIF-formatted names arrive as HTML and are rendered with `dangerouslySetInnerHTML` throughout — keep that in mind when touching name rendering.
- Branches: `master` is the main branch; `maplibre` (current) carries the move off Mapbox, and `phylotree`/`traits` are other experiments.
