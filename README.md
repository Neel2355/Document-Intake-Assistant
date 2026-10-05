# Document Intake Assistant — Wenup LLM Engineering Technical Assessment

> **Conversational AI that turns natural language into structured legal documents — in real time.**

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-11%2F11_passing-brightgreen?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-passing-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Installation
bash
git clone https://github.com/Neel2355/Document-Intake-Assistant
cd Document-Intake-Assistant
npm install
Configuration

No configuration is required. Without an API key, the app uses its built-in simulation engine. It asks follow-up questions for missing fields, handles corrections, detects ambiguity, and deflects off-topic input.

To use a real LLM, create a .env.local file in the project root and add one key:

env
OPENAI_API_KEY=your_openai_key
# or
GEMINI_API_KEY=your_gemini_key

Restart the server after changing environment variables.
-----------------------------------------------------------------------------------------

Running the app

Development:

bash
npm run dev
-----------------------------------------------------------------------------------------

Open http://localhost:3000.
------------------------------------------------------------------------------------------

Production:

bash
npm run build
npm start
Running tests
bash
node --experimental-strip-types --test src/tests/intake.test.ts
----------------------------------------------------------------------------------------------------------

Linting
bash
npm run lint

## What This Is

A full-stack LLM intake assistant that conducts a natural-language conversation with a user and progressively builds a structured **Personal Wishes Document** — the kind used in estate planning. Every field extracted from the conversation is validated with a Zod schema, streamed live to a document preview pane, and fully auditable.

Built as a submission for the **Wenup Engineering Technical Assessment**, this implementation goes well beyond the brief — introducing production-grade architecture patterns, unique evaluation tooling, and a compliance-aware UI layer that most candidates skip entirely.

---

## What Makes This Different

### 🔁 Zod Self-Correction Loop
When the LLM returns malformed or schema-invalid JSON, the system doesn't crash — it feeds the exact Zod validation error paths back to the model as a structured correction prompt and retries automatically (up to 2×). This mirrors how production LLM pipelines handle model unreliability.

### 🧪 Built-in Evaluation Fixture Runner
A dedicated **"Test Fixtures" tab** lets you fire 5 pre-wired evaluation scenarios in one click:
- Batch multi-field intake in a single turn
- Ambiguity & contradiction detection
- Field correction and overwrite tracking
- Malformed JSON self-correction simulation
- Off-topic deflection guardrails

No external test harness needed — the evaluation suite is embedded in the UI itself.

### 📋 Correction Audit Trail
Every time a user corrects a previously stated fact ("actually, change my executor to…"), the system records a **field-level diff** — previous value vs. new value, with a timestamp. This is surfaced live in the Fixtures tab as a structured audit log. Most implementations simply overwrite state silently.

### 🧠 Context-Aware Simulation Engine
Works **without any paid API key**. The built-in simulation engine is context-aware: it detects what fields are still missing, generates appropriately targeted follow-up questions, handles corrections, detects ambiguity, and deflects off-topic input — all deterministically.

### ⚖️ Institutional-Grade Compliance Layer
- **Legal Health Checker** with real statutory citations (Wills Act 1837, Administration of Estates Act 1925)
- **Terms of Service & Privacy Policy modals** with full legal text
- **Fictional Document Notice** prominently rendered in every export
- **Legal Footer** with trust indicators and compliance links
- **Print-optimised** markdown export with proper heading hierarchy

### 📊 Structured Telemetry
Every API response emits a telemetry event with latency, token counts, model ID, extraction confidence, and retry count — visible in a live structured inspector panel (not a fake terminal).

### 📐 Typed End-to-End
- Zod schema is the **single source of truth** for the document shape — shared between the API route, the store, the UI, and the test suite
- 11 automated tests covering schema integrity, multi-field extraction, self-correction, field overwrite, and markdown disclaimer compliance — run via Node's native test runner with **zero extra test dependencies**

---

## Architecture

```
User Input → ChatPane.sendUserMessage()
  → POST /api/chat (last 5 messages + full currentState JSON)
  → buildMasterSystemPrompt(currentState)
  → [No key] runSimulatedEngine()   ← context-aware deterministic fallback
  → [API key] OpenAI/Gemini streaming + MAX_RETRIES=2 Zod self-correction
  → SSE stream: text_delta | tool_call | state_update | telemetry | done
  → useWishesStore.applyStatePatch()
      → triggerFieldHighlight()     ← subtle glow animation on changed fields
      → CorrectionRecord stored     ← field-level audit trail
→ LivePreviewPane re-renders (real-time)
→ TelemetryDrawer shows structured metrics
→ EvaluationFixtures tab shows correction audit trail
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | SSE streaming, API routes, RSC |
| Language | TypeScript (strict) | End-to-end type safety |
| Schema & Validation | Zod | Runtime validation + self-correction feedback |
| State | Zustand | Correction history, telemetry, readiness tracking |
| Styling | Tailwind CSS + CSS custom properties | Institutional design tokens |
| Icons | Bespoke SVG library (30+ icons) | Legal-themed, 1.5px stroke, no external dep |
| LLM | OpenAI / Gemini (optional) + built-in simulator | Works without an API key |
| Testing | Node native test runner (`--experimental-strip-types`) | Zero-dep, fast, CI-friendly |

---

## Schema (Single Source of Truth)

```typescript
PersonalWishesSchema = z.object({
  full_name:               z.string().nullable(),
  home_address:            z.string().nullable(),
  covers_worldwide_assets: z.boolean().nullable(),
  has_children:            z.boolean().nullable(),   // explicit boolean — separate from children[]
  children:                z.array(z.object({ name: z.string() })).nullable(),
  executor:                z.object({ name: z.string(), relationship: z.string() }).nullable(),
  specific_gifts:          z.array(z.string()).nullable(),
  additional_wishes:       z.string().nullable(),
})
```

---

## Running Locally

```bash
git clone https://github.com/Neel2355/Document-Intake-Assistant
cd Document-Intake-Assistant
npm install
npm run dev         # → http://localhost:3000
```

**Run the test suite (zero extra deps):**
```bash
node --experimental-strip-types --test src/tests/intake.test.ts
# ✔ 11/11 passing
```

**Production build:**
```bash
npm run build
# ✓ Compiled successfully — zero TypeScript errors
```

> **No `.env` required.** The built-in simulation engine runs everything locally.  
> Add `OPENAI_API_KEY` or `GEMINI_API_KEY` to unlock real LLM mode.

---

## Specification Compliance

| Wenup Requirement | Status |
|---|---|
| Conversational multi-turn intake | ✅ |
| Structured JSON tool-call extraction | ✅ |
| Zod schema validation with error paths | ✅ |
| Multi-field atomic extraction in one turn | ✅ |
| Field correction / overwrite handling | ✅ |
| Off-topic deflection | ✅ |
| Live document preview | ✅ |
| Markdown export with fictional disclaimer | ✅ |
| `has_children` boolean (separate from children array) | ✅ |
| Jane Smith slide 4 scenario preloaded | ✅ |
| Automated test suite | ✅ |
| Works without a paid API key | ✅ |

---

## Unique Features (Beyond the Brief)

| Feature | Description |
|---|---|
| 🔁 Zod Self-Correction | Validation error paths fed back to model for automatic retry |
| 🧪 Evaluation Fixture Runner | 5 one-click test scenarios embedded in the UI |
| 📋 Correction Audit Trail | Field-level diff log with timestamps |
| ⚖️ Legal Health Checker | Statutory citations, jurisdiction warnings |
| 📊 Telemetry Inspector | Per-request latency, tokens, retries, confidence |
| 🦴 Legal Skeleton Loader | Legal-document themed shimmer loading state |
| 🔒 Compliance Modals | Full ToS & Privacy Policy with legal text |
| 🖨️ Print-Optimised Export | Markdown with `@media print` CSS rules |
| 🧠 Simulation Engine | Context-aware fallback — no API key needed |
| 🎨 30+ Custom SVG Icons | Bespoke legal-themed icon library |

---

## License

MIT — built for the Wenup Engineering Technical Assessment.
