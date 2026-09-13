# ISHAARA — Pricing & Pitch One-Pager

> **Project:** ISHAARA — Bi-Directional Sign Language Translator (PSL · ISL · on-device)
> **Team:** Hassaan Abdullah · Khubaib Ul Hassan
> **Stage:** Working prototype / pilot-ready (FYP capstone with deployed live demo)

---

## 1. Buyers (who pays)

| # | Buyer | Budget source | Motivation |
|---|-------|---------------|------------|
| 1 | NGO / school for the deaf | Grants, donor/CSR funds | Real inclusion tool, cheap, on-device |
| 2 | Bank / hospital / government counter | CSR / accessibility mandate | Compliance + disabled-access goals + public image |
| 3 | Government (counter/kiosk rollout) | Exchequer / tender | National accessibility policy (PSL) |
| 4 | Tech company (acquire baseline) | R&D | Want a bilingual sign-translation baseline to build on |

---

## 2. Offerings & pricing

### A. Code / IP sale — outright (demo, as-is)
- **USD 500 – 2,000** · PKR 150k – 600k
- Full source: React/TS web app, Chrome extension, model trainer, 6 standalone frontends, deployment (Vercel).
- Includes: source + README + docs (`docs/`) + 1 demo video + 1 handover call.

### B. Pilot deployment — the recommended first sale (USD 5k – 20k)
One institution, one language (PSL or ISL), ~4–6 weeks:
- Custom vocabulary (train on their signs), kiosk/desk setup, staff training, one case-study report.
- **USD 5k – 20k** · often 50% upfront / 50% on delivery.
- Deliverable: live deployment + measured improvement story the buyer can report to funders.

### C. Per-site kiosk license (SaaS-lite)
- **USD 100 – 300 /site/month** · PKR 30k – 90k
- Counter kiosk + staff dashboard + updates. Common model for banks and NADRA-style desks.

### D. Institution SaaS
- **USD 100 – 500 /institution/month**, or per-seat:
- Schools/universities: **USD 2 – 5 /student/month**, **USD 5 – 25 /seat/month** for staff/professionals.

### E. Government / enterprise tender
- **USD 50k – 500k+** projects. Requires: registered company, statement of work, support SLA.
- Recommended move: partner with an established IT firm (they win tenders, you deliver the product).

---

## 3. Why it sells (differentiators)

- **On-device privacy** — no cloud, no upload, no GPU. Healthcare/bank/govt compliance story.
- **Bi-directional** — sign → speech *and* speech → sign via 3D avatar.
- **South Asian languages first** — PSL & ISL, where competitors are English-only.
- **Zero hardware** — works on a plain webcam + browser (kiosk-ready).
- **Trainable by the institution** — records its own vocabulary, no ML expertise needed.

---

## 4. Negotiation anchors

| Objection | Answer |
|-----------|--------|
| "It's just a prototype" | Yes — that's why a pilot is cheap. The value is the case study + the custom model you keep. |
| "Open-source competitors" | Open-source without this deployment+training+support layer is a hobby repo. We sell working outcomes. |
| "Can it do [our language/vocab]?" | Yes — recording pipeline + trainer let us tune to any sign vocabulary in days. |
| "Why not cloud APIs?" | Cloud sign models leak user gesture data and fail offline in government/poor-network settings. |

---

## 5. 30-second pitch

> "ISHAARA turns sign language into speech and speech into sign, live, on a
> webcam, and it runs completely on-device. Where government counters today
> serve deaf citizens through a paper sheet, we install a kiosk that signs and
> speaks in PSL. It records your own staff's vocabulary, trains on CPU in
> seconds, and never uploads a frame. We'll deploy a 4-week pilot for one
> school/counter; you leave with a working service and a funded-report-ready
> case study."

---

## 6. Current state — honest readiness

| Area | Ready | Gap to product |
|------|-------|----------------|
| Web app + extension + kiosk UI | ✅ demo-ready | Responsive polish, theming |
| On-device training + inference | ✅ works | Small vocab (MLP) |
| Sign recognition quality | ⚠️ baseline | Temporal model (GRU/CTC), 100+ signs, multi-signer |
| Speech → sign (avatar) | ✅ demo | Real STT/TTS + grammar coverage |
| PSL vs ISL | ⚠️ PSL-first | Separate datasets per language |
| Support & compliance | ❌ | Contract, SLA, deployment docs |

**Recommended roadmap before chasing enterprise:** temporal (GRU/CTC) model →
voice (STT/TTS) → 1 public pilot → publish case study → price from Section 2.

---

*Pricing is a starting guide; adjust by buyer, scope, and geography.*