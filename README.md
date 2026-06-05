# Currency Exchange (Scalpel plugin)

A personal currency cross-rate watchlist for Path of Exile 1 and 2, powered by poe.ninja data that Scalpel already maintains (via the ctx.prices capability). Add currency pairs and see their live bidirectional rate and 7-day trend at a glance. Requires Scalpel >= 0.9.13.

## Develop

```bash
npm install
npm test
npm run build   # -> dist/plugin.js + dist/manifest.json
```

Load the built dist/ folder via Scalpel's Settings -> Developer -> Load unpacked plugin.
