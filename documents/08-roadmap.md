# ISHAARA — Delivery Roadmap (v3)

> **Provenance note.** This roadmap was produced on **2026-09-29** from the same
> static analysis as the rest of `documents/` (see `00-index.md`). Backlog items are
> derived from the functional requirements in `02-functional-requirements.md`, the
> non-functional targets in `03-non-functional-requirements.md`, and the market
> findings in `01-market-analysis.md`. Timeline targets are `[TO BE VALIDATED]`
> where they depend on future estimates rather than shipped code.

## 1. Objective & horizon

Sign-language to text/speech translator (React Three Fiber app): a bi-directional
ISHAARA workspace that turns sign into speech from 543 on-device MediaPipe Holistic
landmarks, and drives a procedural 3D signing avatar from parsed text, with a
user-trainable NumPy/PyTorch model pipeline. This roadmap plans the next **5–6 weeks**
of incremental delivery in lockstep with the SDLC phases and traceability rules in
`07-sdlc-lifecycle.md` (Requirements → Design → Implement → Verify → Release/Operate → Improve).

Current shipped state: `https://ishaara-sign-language-translator.vercel.app` (production), source committed, v2 documentation set complete.

> ⚠️ Deployment URL drift: the root `README.md` still names an older Vercel host
> (`ishaara-sign-language-translator-ma.vercel.app`). PBI-06 reconciles the two.

## 2. Product backlog

Prioritised with MoSCoW. Items are phrased as outcomes (not tasks) and map to FR/NFR ids.

| ID | Item (outcome) | Source | Priority |
| --- | --- | --- | --- |
| PBI-01 | Every one of the 12 `components/` presentation modules renders inside the `#/app` workspace with no cross-route state leakage, verified as a walkthrough | FR-3 | Must |
| PBI-02 | Startup fails loudly with a named, actionable message when a referenced env var is absent, instead of silently falling through | FR-8 | Must |
| PBI-03 | A measured classification-accuracy figure exists for the shipped model, with the test set, the metric, and the commit SHA recorded | `01-market-analysis.md` §6 (placeholder model, no accuracy measurement) | Must |
| PBI-04 | Landmark/biometric capture has a written data-handling and retention policy, and an in-product consent step before the camera is opened | NFR-5.7, NFR-5.4 | Must |
| PBI-05 | Every push runs a green gate: type check, build, lint and dependency vulnerability scan | NFR-6.3 (no CI detected), NFR-5.3 (`[TO BE RUN]`) | Must |
| PBI-06 | The Gemini text-to-gloss path and the local grammar fallback are proven equivalent on a fixed phrase set, and the README's deploy URL matches production | FR-8, `README.md` vs. production | Should |
| PBI-07 | LCP and CLS are instrumented on the landing page and the interactive workspace, replacing `[TO BE MEASURED]` with real numbers | NFR-1.3, NFR-1.4 | Should |
| PBI-08 | The six form factors (landing, workspace, kiosk, meeting companion, model studio, extension) build and run from one codebase with a parity check in CI | `README.md` form-factor claim, FR-1 | Should |
| PBI-09 | Offline-first PWA claim holds up under a real offline test: service-worker cache-first path serves the workspace with the network disabled | `README.md` offline-first claim | Should |
| PBI-10 | The dataset captured by the recorder is versioned and re-trainable end-to-end (`train_collected.py` → `public/models/`), with a recorded repeat-run result | FR-3, `README.md` train loop | Could |
| PBI-11 | Automated test coverage over the gloss mapper, landmark normalization and sliding-window hooks is measured rather than assumed | NFR-6.1 (`[TO BE MEASURED]`) | Could |
| PBI-12 | Supervised sign-to-speech sessions with per-user retention limits, audit trail and consent revocation | NFR-5.7, market §2 institutional buyers | Won't (this horizon) |

## 3. Sprint plan

**Sprint cadence:** 1 week = 1 sprint; stand-up daily (15 min), sprint review + retrospective at the end of each sprint. Six sprints are planned against the 5–6 week horizon; Sprint 6 is the contingency/overflow slot and is cut first if the horizon is 5 weeks.

| Sprint | Goal | PBI delivered | Done/exit criteria | Phase (SDLC) |
| --- | --- | --- | --- | --- |
| Sprint 1 | A trustworthy baseline: the workspace is verified module-by-module and config errors are explicit | PBI-01, PBI-02 | all 12 components render in a recorded walkthrough; missing-env path throws a named error | Implement → Verify |
| Sprint 2 | Close the honesty gap in the market analysis — measure the model instead of claiming it | PBI-03, PBI-04 | accuracy figure + test set + commit SHA recorded in `03-non-functional-requirements.md`; consent step precedes camera access | Verify |
| Sprint 3 | Make every push provably green | PBI-05, PBI-06 | CI green on `main`; fallback-parity phrase set passes; README deploy URL matches production | Verify → Release |
| Sprint 4 | Performance and form-factor parity | PBI-07, PBI-08 | LCP/CLS numbers replace `[TO BE MEASURED]`; all six form factors build in CI | Verify |
| Sprint 5 | Offline and retraining claims proven | PBI-09, PBI-10 | workspace loads with the network disabled; one full record→train→deploy loop re-run and logged | Release & Operate |
| Sprint 6 (contingency) | Buffer, retro actions, next-horizon re-prioritisation | overflow from the above | zero open Musts; backlog re-ranked for the following horizon | Improve |

## 4. Ceremonies

- **Daily stand-up (15 min):** what shipped since yesterday, what's blocked, what's next — tied to the active sprint's PBI board.
- **Sprint review (30 min, end of sprint):** demo PBI outcomes against the sprint goal; update `05-use-cases.md` walkthrough where behavior changed.
- **Retrospective (30 min, end of sprint):** inspect + adapt; record one actionable improvement per sprint in git notes.
- **Backlog refinement (before sprint 1):** re-prioritise PBIs against latest market findings.

## 5. Burndown (planned)

Tracked as PBI points remaining per sprint. Planned trajectory below; the team records actuals at each sprint review. `[TO BE MEASURED]` until the first sprint completes.

| Sprint | Planned remaining points |
| --- | --- |
| Start | `[44]` |
| Sprint 1 | `[36]` |
| Sprint 2 | `[28]` |
| Sprint 3 | `[21]` |
| Sprint 4 | `[14]` |
| Sprint 5 | `[7]` |
| Sprint 6 (contingency) | 0 |
| Done (0) | 0 |

## 6. Rollout & deploy

- Build/deploy per `07-sdlc-lifecycle.md` §5 (release policy).
- Production: `https://ishaara-sign-language-translator.vercel.app`
- Health: a broken build blocks the next sprint's first commit; security findings are release blockers.

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| Requirements drift vs. implemented code | PBI↔FR↔use-case traceability check per change (`07-sdlc-lifecycle.md` §3) |
| Unmeasured NFRs treated as done | `[TO BE MEASURED]` targets stay visible until instrumented |
| Burndown actuals fall off plan | Over-plan cut scope in the retrospective, not mid-sprint |
| Claims ahead of code (market analysis §6 flags the model as a placeholder; §7 makes this a top risk) | PBI-03 ships a measured figure before any external claim is made; README copy stays aligned with the source tree |
| Biometric data handled without policy | PBI-04 is a Must in Sprint 2; no dataset leaves the device before it lands |
