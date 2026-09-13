# ISHAARA — Frontends for Proposal Screenshots

All product frontends live as **separate, standalone, double-clickable HTML files**
under `frontends/<name>/index.html`. Open any of them in Chrome and take screenshots
directly — no server or internet required (Google Fonts load if online; the UI still
renders without them).

## The frontends

| Folder | What it shows | Use case |
| --- | --- | --- |
| `frontends/landing/` | Marketing landing page (hero, features, use cases, how-it-works, CTA) | Project homepage / intro slide |
| `frontends/workspace/` | Full translator workspace — live camera, recorder, 3D signer, gloss panels | Core product / demo |
| `frontends/kiosk/` | Counter & help-desk assistant with visitor sign panel + staff reply | Public service counters (NADRA, banks, help desks) |
| `frontends/meeting/` | Live meeting companion — caption stream + signing relay + call controls | Zoom/Teams meetings, FYP reviews |
| `frontends/modelstudio/` | Dataset & training console — captured vocabulary, accuracy curve, model packaging | The "how do you train it" slide |
| `frontends/extensionpreview/` | Browser extension overlaid on a mock news article (floating "Sign it" + side panel) | Browser extension demo |

## Rebuild them

```bash
npm run build:frontends      # rebuilds every folder under frontends/
npm run build:all            # main app + extension + all frontends
```

The Vercel deployment (`vercel.json`) runs the frontends build again into
`dist/frontends/`, so each one is also live at
`https://<your-site>.vercel.app/frontends/<name>/index.html`.

## How it works

- **Source** for each frontend: `src/frontends/<name>/main.tsx` + `index.html`.
- **Build config**: `scripts/vite.frontend.config.ts` (one Vite build per entry,
  `vite-plugin-singlefile` inlines JS + CSS so each output is one `.html`).
- **Launcher**: `scripts/build-frontends.mjs` loops the entries and writes to
  `frontends/<name>/`.
- `frontends/` is git-ignored (generated). The tracked source is `src/frontends/`.

## Screenshot tips

- Use a 1440×900 or 1920×1080 window; the layouts are responsive but designed wide.
- `landing`, `workspace`, `kiosk`, `meeting`, `extensionpreview` include the live
  3D `SignAvatar` (WebGL) — give the page ~1 second to render before capturing.
- The avatar animates continuously, so screenshots show it mid-sign.

## Next stage (planned)

- Language model work: replace the pure-numpy MLP with a temporal model (GRU/CTC)
  for continuous signing, add real Urdu/English text→gloss grammar, and wire voice.
- `modelstudio` is the intended home for those training controls.
