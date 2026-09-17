# ISHAARA 🫱 — Bi-Directional Sign Language Translator

**ISHAARA** turns sign language into speech and speech into sign — live, on-device, with zero GPU and zero cloud dependency. It is the first open-source bi-directional translator built for **Pakistani Sign Language (PSL)** and **Indian Sign Language (ISL)**, with English + Urdu + Hindi text/speech support.

> Bidirectional · PSL & ISL · On-device model · User-trainable · 3D avatar · Chrome extension

---

## What it does

- **Sign → Speech**: A webcam tracks **543 holistic landmarks** (MediaPipe Holistic) and your personal on-device model classifies the gesture into gloss, which is spoken aloud via browser TTS.
- **Speech → Sign**: Type or speak a phrase — the engine parses it into grammatical **Sign Gloss** (SVO → SOV) and drives a procedural 3D avatar that signs back in real time.
- **User-trainable**: Record 8–12 webcam takes per sign, export them as JSON, train a tiny classifier on CPU (`train_collected.py`, NumPy only), and deploy it straight back into the browser.
- **Dual View**: Render Sign-to-Speech and Speech-to-Sign simultaneously in a split-screen workspace.

## Features

- **On-device ML** — sliding-window inference (24 frames × 543 landmarks) inside a Web Worker. No TensorFlow.js, no GPU, no uploads.
- **BigMLP / GRU classifiers** — two model architectures trained with pure NumPy or PyTorch, exported as plain JSON weights.
- **Gemini 2.5 Flash NLP** — high-fidelity text-to-gloss grammar parsing with an automatic **local fallback** when no API key is set or the network is unavailable.
- **Procedural 3D avatar** — a full humanoid built from code (no external `.glb`/`.fbx` files) with WebGL, animated signing gestures.
- **Graceful degradation** — camera denied/absent and mic denied/unsupported produce clear in-panel guidance instead of silent failures; text input always works.
- **South Asian focus** — PSL, ISL, English, Urdu, and Hindi with shoulder-width landmark normalization (distance- and body-size agnostic).
- **Six form factors from one codebase** — landing page, workspace, kiosk mode, meeting companion, model studio, and browser extension.
- **Offline-first PWA** — single-file builds served by a cache-first service worker.
- **Presentation-ready** — a lock mode freezes controls during live demos.

## Quickstart

```bash
npm install
npm run dev          # Start the Vite dev server
```

Then open the workspace at `http://localhost:5173/#/app` (the landing page is at `/`).

### Build

| Command | Output |
| --- | --- |
| `npm run build` | Single-file production build → `dist/index.html` |
| `npm run build:frontends` | 6 standalone demo HTML files → `dist/frontends/` |
| `npm run build:extension` | Chrome MV3 extension → `extension/dist/` |
| `npm run build:all` | Everything above |

### Train a custom model

```bash
python train_collected.py      # NumPy-only, CPU, seconds
python train_pipeline.py       # PyTorch (GPU optional)
```

The exported weights file goes into `public/models/` and is picked up by the workspace's Web Worker automatically.

## Environment variables

Create a `.env` file in the repo root (optional — everything works without it, via local fallback):

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | No | Google AI Studio key for Gemini 2.5 Flash text-to-gloss parsing. Omit or set to `your_actual_gemini_api_key_here` to use the built-in local grammar fallback. |

> ⚠️ `.env` is git-ignored. Never commit API keys.

## Deploying

Live demo is deployed to Vercel (`ishaara-sign-language-translator-ma.vercel.app`). The deploy command is:

```bash
npm run build && node scripts/build-frontends.mjs --out=dist/frontends
```

The root `index.html` is served at the site, and the interactive workspace is at `/#/app`.

## Project structure

```
src/
  App.tsx             # Main translator workspace
  pages/Landing.tsx   # Marketing / landing page
  components/         # Avatar, camera, mic, recorder, glossary, HUD
  hooks/              # MediaPipe, sliding window, TFLite worker, speech-to-sign, dataset
  workers/            # On-device inference Web Worker
  data/samples.ts     # Starter gloss vocabulary + engine metrics
  utils/              # Gloss mapper, landmark normalization, styling helpers
extension/            # Chrome MV3 extension (select text → signed on any page)
scripts/              # Frontend builders, icon generator, parity tests
supabase/             # Subscriptions / auth schema
train_collected.py    # NumPy training pipeline
train_pipeline.py     # PyTorch training pipeline
```

## Use cases

Hospitals, banks/NADRA counters, classrooms, government offices, online meetings, emergency helplines, news broadcasts, and everyday conversation between deaf and hearing people.

## Team

Hassaan Abdullah (23-ARID-896) · Khubaib Ul Hassan (23-ARID-902) — Final Year Project, September 2026.

Built for accessibility, owned by the community. 🫶