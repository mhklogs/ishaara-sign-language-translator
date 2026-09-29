# ishaara-sign-language-translator — Market Analysis

> **Evidence base.** This document was researched on 2026-09-29 from vendor pricing pages,
> published analyst figures and the owner's market-review work (2026-09-26). No number
> here is invented. Where a figure could not be independently verified it is marked
> **[TO BE VALIDATED]**; verify it before the document is used in an investor or
> grant setting. Sources are listed in §8.

## 1. Product in one sentence

> ISHAARA — a bi-directional sign-language translator with a 3D signing avatar.

## 2. Problem statement

- **Who feels the problem:** Deaf/HoH users, institutions, accessibility programs.
- **What they do today instead:** manual processes, spreadsheets, rented SaaS — see §4.
- **Cost of the status quo:** measurable in lost revenue / manual labor overhead
  **[TO BE VALIDATED for this specific segment]**.

## 3. Market definition

| Field | Value |
| --- | --- |
| Category | Sign-language interpretation & translation |
| Geographic scope | Global (US, UK, BR, PK) |
| Target segment / persona | Deaf/HoH users, institutions, accessibility programs |
| Estimated total addressable market | Governments/corporates spend ~$4B/yr on sign interpretation (~$75/hr); only ~5% of demand met **[TO BE VALIDATED — cite a specific figure]** |
| Serviceable addressable market | Depends on distribution reach; **[TO BE VALIDATED]** |
| Beachhead segment | Deaf/HoH users, institutions, accessibility programs |

## 4. Demand signals

> Genuine, severe under-supply; large well-funded entrants

| Signal | Evidence | Status |
| --- | --- | --- |
| Category demand | Mature/validated category with well-funded entrants | Confirmed |
| Competitive floor | Incumbent pricing and free tiers are public and low | Confirmed (see §5) |
| Own sales/usage data | Not instrumented in this repo | **[TO BE MEASURED]** |

## 5. Competitive landscape

| Competitor | Entry price (2026) | Positioning | Weakness we can exploit |
| --- | --- | --- | --- |
| **Rylo (ex-Nagish)** | $101M+ raised, $500M val | Live interpretation, FCC-licensed | US-centric |
| **Signapse** | £2m+ seed + Series A | BSL+ASL via synthetic signing | Media/transport scope |
| **Hand Talk** | 2M+ downloads | Libras + ASL; acquired by Sorenson | Brazil-centric |

## 6. Differentiation

Grounded in what this build actually does (see `06-architecture.md`):

- **Distinctive capability in code:** Bi-directional translator with a 3D avatar. NOTE verified blocker: the local model is a placeholder and no accuracy measurement exists as of 2026-09. Do not present as working; pursue as an academic / grant project where the model and dataset are the deliverable.
- **Capability a competitor would need to replicate:** proxy of the build's core path.
- **Why defensible:** depth of vertical fit and delivery ownership, not a generic dashboard.

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Category commoditized / incumbent floor falling | Medium–High | Medium | Position on differentiation above, not price |
| Unverified market figures | High | High | Keep `[TO BE VALIDATED]` markers until sourced |
| Claims ahead of code (demo vs. shipped) | Medium | High | Keep README/copy aligned with the source tree |

## 8. Sources

Accessed 2026-09-29; vendor pricing changes — re-verify before any pricing decision.

- https://www.calcalistech.com/ctechnews/article/rjgulkbbgx
- https://signapse.ai
- https://handtalk.me/en
