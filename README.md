# Document Intake Assistant

A web application built for the **Wenup LLM Engineering Technical Assessment**. It runs a guided conversational interview (typed or dictated), stores the answers as validated structured state, and deterministically generates a draft **Personal Wishes Document** (a fictional estate-planning document) as a PDF and Markdown file.

> **FICTIONAL DOCUMENT - NOT LEGAL ADVICE.** All output is for assessment purposes only and is not a will or a legal instrument.

---

## Table of Contents

1. [Installation](#installation)
2. [Design Principles](#design-principles)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Notable Implementation Details](#notable-implementation-details)
6. [Voice Input](#voice-input)
7. [Data Model](#data-model)
8. [Question Planner](#question-planner)
9. [Validation Pipeline](#validation-pipeline)
10. [Tech Stack](#tech-stack)
11. [LLM Provider Configuration](#llm-provider-configuration)
12. [Testing and Evaluation](#testing-and-evaluation)
13. [Reviewer Walkthrough](#reviewer-walkthrough)
14. [Repository Structure](#repository-structure)

---

## Installation

### Prerequisites

- Node.js 20 or later
- Git
- Docker (optional)
- A Chromium-based browser (Chrome, Edge) or Safari for built-in voice input (optional)

### Local

```bash
git clone https://github.com/Neel2355/Document-Intake-Assistant
cd Document-Intake-Assistant
npm install
npm run dev
```

Open `http://localhost:3000`. No `.env` file is required.

### Docker

```bash
docker-compose up --build
```

### Production build

```bash
npm run build
npm start
```

---

## Design Principles

1. **The LLM extracts; it does not decide.** The model turns user text into candidate field values. It does not choose the next question, mutate state, or write the document.
2. **Structured state is the source of truth.** Chat history is evidence only. The document is rendered from validated state, never from the transcript.
3. **LLM output is untrusted.** Every extraction passes through schema, conflict, and business-rule validation before it is committed.
4. **Nothing changes silently.** Every change creates a new state version with an audit record. Contradictions of confirmed data require user confirmation.
5. **Document generation is deterministic.** The same state always produces the same document. No LLM call is made during generation.
6. **Voice is an input method, not a shortcut.** Dictated text is treated exactly like typed text and goes through the same validation pipeline. It is never sent automatically.

---

## Architecture

```
User input (typed text, or dictated speech -> editable transcript)
      |
      v
Extraction layer  (OpenAI / Gemini / built-in simulation engine)
      |  candidate fields + confidence + ambiguity flags
      v
Validation pipeline
  1. Schema validator          (Zod)
  2. Conflict detector         (vs. CONFIRMED fields)
  3. Business-rule validator   (required / conditional fields)
      |
      +-- no conflict --> State manager: commit new version (vN), write audit record
      |
      +-- conflict ----> Conflict card: [Keep existing] / [Use new]
      |
      v
Question planner  (deterministic dependency order)
      |
      v
UI: chat, state panel (inline edit), live preview, review page
      |
      v
Deterministic generation: PDF and Markdown (no LLM)
```

---

## Features

- **Multi-turn guided intake** with suggestion chips.
- **Voice input** with live interim text, a review-and-edit step before sending, and a server transcription fallback.
- **Multi-field extraction** in a single message (e.g. name, address, and children status together).
- **Deterministic question planner** with conditional skipping (children's names are skipped when `has_children` is false).
- **Field status tracking:** `UNKNOWN`, `PROPOSED`, `CONFIRMED`, `CORRECTED`, each with a confidence value.
- **Ambiguity handling:** hedged input ("I think Sarah...") is stored as `PROPOSED` and the assistant asks for confirmation.
- **Contradiction handling:** a contradiction of a confirmed field pauses the update and shows a resolution card.
- **Versioned state:** every committed change creates an immutable snapshot (v1, v2, ...).
- **Audit trail:** field, previous value, new value, timestamp, and source (chat, voice, manual edit, conflict resolution).
- **Inline manual editing** in the state panel, routed through the same validation pipeline.
- **Zod self-correction loop:** invalid model JSON is returned to the model with the exact validation error paths and retried (up to 2 times).
- **Off-topic deflection** that steers back to the interview.
- **Review and finalize page** with a required-fields checklist and a confirmation checkbox.
- **PDF export** with header, running "Page X of Y" footer, and a fictional-document disclaimer on every page. **Markdown export** is also available.
- **Telemetry panel:** latency, token counts, model ID, confidence, and retry count per request.
- **Works without an API key** using the built-in simulation engine.
- **Standalone evaluation harness** with JSON fixtures.
- **PII-masking logger** so names, addresses, and transcripts do not appear in logs.

---

## Notable Implementation Details

| Detail | What it does | Where to verify |
| --- | --- | --- |
| Zod self-correction loop | When model output fails schema validation, the exact error paths are sent back to the model and the call is retried (max 2) | `src/lib/llm/` and the "Malformed JSON" fixture |
| In-app fixture runner | Evaluation scenarios can be run from a UI tab without a separate harness | "Test Fixtures" tab |
| Streaming state updates | Responses stream over SSE; changed fields are highlighted in the live preview as they update | Chat pane and preview pane |
| Telemetry panel | Per-request latency, token counts, model ID, confidence, and retry count | Telemetry drawer |
| No-key mode | The simulation engine follows the same planner and validation pipeline as the real providers | Run with no `.env` |
| Typed end to end | One Zod schema is shared by the API route, store, UI, and tests | `src/lib/schema.ts` |
| Voice provider abstraction | Web Speech API is preferred; a server transcription route is used only when the browser lacks support and a key is configured | `src/lib/voice/` |

---

## Voice Input

Users can dictate answers instead of typing.

### Behaviour

- The microphone button toggles recording and shows a recording state (indicator, "Listening...", elapsed time).
- Interim text appears in the input box while the user speaks.
- When speech ends, the final text is placed in the input box for review. **It is not sent automatically**, so misheard names and addresses can be corrected first.
- Dictated messages go through the same extraction and validation pipeline as typed messages.
- Messages are tagged `inputMode: "voice"`, and the tag is recorded in the audit trail.
- Names and addresses from voice have a capped confidence (`VOICE_CONFIDENCE_CAP`) and are stored as `PROPOSED` until the user confirms them.

### Providers

| Provider | Used when | Notes |
| --- | --- | --- |
| Web Speech API | Browser supports `SpeechRecognition` | No API key needed; works in no-key mode |
| Server transcription (`/api/transcribe`) | Browser lacks Web Speech and `OPENAI_API_KEY` is set | Audio limited to 5 MB and 60 seconds; MIME type validated |
| None | Neither is available | The microphone button is hidden; typing still works |

### Browser support

Web Speech is available in Chromium-based browsers and partially in Safari. Firefox does not support it, so Firefox uses the server fallback if a key is configured, otherwise the button is hidden.

### Privacy

- Audio is not stored.
- Transcripts and audio are not written to logs.
- With the Web Speech API, audio is processed by the browser's speech service. With the server fallback, audio is sent to the configured transcription provider.
- A one-line notice is shown the first time the microphone is used.

### Accessibility

The microphone button has an `aria-label` and `aria-pressed`, a keyboard shortcut (`Ctrl+Shift+M`), and a live-region announcement when recording starts and stops.

---

## Data Model

Each field is stored as `{ value, status, confidence, sourceMessageId }`.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `full_name` | string | Yes | Identification |
| `home_address` | string | Yes | Primary residence |
| `covers_worldwide_assets` | boolean | Yes | true = worldwide, false = UK only |
| `has_children` | boolean | Yes | Separate from the children list; controls branching |
| `children` | list of `{ name }` | Conditional | Required only if `has_children` is true |
| `executor.name` | string | Yes | Estate administrator |
| `executor.relationship` | string | Yes | Relationship to the user |
| `specific_gifts` | list of strings | No | Optional bequests |
| `additional_wishes` | string | No | Funeral and personal wishes |

The Zod schema in `src/lib/schema.ts` is the single source of truth, shared by the API route, state store, UI, and tests.

---

## Question Planner

The next question is chosen by a pure function (`src/lib/questionPlanner.ts`), not by the LLM:

1. Full name
2. Home address
3. Asset scope
4. Has children
5. Children's names (only if `has_children` is true)
6. Executor name and relationship
7. Specific gifts (optional)
8. Additional wishes (optional)

A message that answers several fields advances the planner past all of them.

---

## Validation Pipeline

Located in `src/lib/validation/`. Each stage is a separate module.

| Stage | Responsibility |
| --- | --- |
| `schemaValidator` | Type and shape checks; rejects unknown field paths and malformed payloads |
| `conflictDetector` | Detects contradictions with `CONFIRMED` fields; distinguishes explicit corrections from conflicts |
| `businessRuleValidator` | Enforces conditional and required-field rules |

State is committed only after all three stages pass or the user resolves a conflict.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Validation | Zod |
| State | Zustand |
| Styling | Tailwind CSS |
| PDF | <pdf-lib or pdfkit - fill in> |
| LLM | OpenAI / Gemini (optional), built-in simulation engine |
| Voice | Web Speech API, optional OpenAI transcription fallback |
| Testing | Node test runner |
| Containers | Docker, Docker Compose |

---

## LLM Provider Configuration

With no keys set, the app uses the simulation engine. The simulation engine follows the same planner and validation pipeline as the real providers. Voice input works in this mode through the Web Speech API.

To use a real model, create `.env.local`:

```bash
# OpenAI (also enables the server transcription fallback)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# or Gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash
```

Restart the dev server after changing environment variables.

---

## Testing and Evaluation

### Run everything

```bash
./scripts/run_all_tests.sh
```

### Unit and integration tests

```bash
npm test
```

Coverage areas: question planner order and conditional skipping, field status transitions, schema validation, conflict detection, state versioning and immutability, PDF generation, review-page gating, voice provider selection, the Web Speech provider (mocked), the `/api/transcribe` route (size, type, and logging checks), and voice messages passing through validation.

Current result: `<N>/<N> passing` (update from real output).

### Evaluation harness

```bash
npm run eval
```

Runs `<N>` fixtures from `evaluation/cases/*.json` across five categories, plus voice-style input:

| Category | What it checks |
| --- | --- |
| Normal extraction | Single-field extraction |
| Multi-field extraction | Several fields in one message |
| Ambiguity | Hedged language produces `PROPOSED`, not `CONFIRMED` |
| Contradiction | Conflicts with confirmed state do not overwrite it |
| Malformed payload | Invalid JSON, wrong types, and unknown paths are rejected |
| Voice-style input | Disfluent dictated text ("um... sorry, 25 High Street") is extracted correctly |

Current result: `<N>/<N> passing` (update from real output).

The same fixtures are available in the in-app **Test Fixtures** tab.

---

## Reviewer Walkthrough

Run the app and follow these steps:

1. Open the landing page and read the fictional-document notice.
2. Start the interview.
3. Send: `My name is Jane Smith and I live at 25 High Street, London.` Both fields are extracted and the version increments.
4. Choose the **Worldwide assets** chip. Asset scope updates.
5. Send: `I do not have any children.` The children-names question is skipped and the executor question follows.
6. Send: `My brother James.` Executor name and relationship are both captured.
7. Send: `I think Sarah should be my executor.` The field is stored as `PROPOSED` and the assistant asks for confirmation.
8. Send: `Actually, make David my executor.` A conflict card appears. Choose **Use David**. The audit trail records the change.
9. Click the microphone and say: `The executor's relationship is friend.` Check the transcript in the input box, edit it if needed, then send. The audit trail shows the source as voice.
10. Use the pencil icon on **Home address** to edit it manually. A new version is created and the preview updates.
11. Open **Review & Finalize**, tick the confirmation box, generate the document, and download the PDF.

---

## Repository Structure

```
.
|-- src/
|   |-- app/                 # Pages and API routes
|   |   `-- api/
|   |       |-- chat/        # Extraction and streaming
|   |       `-- transcribe/  # Server transcription fallback
|   |-- components/          # Chat, voice button, state panel, conflict card, preview, review
|   |-- lib/
|   |   |-- schema.ts
|   |   |-- questionPlanner.ts
|   |   |-- validation/      # schema, conflict, business-rule modules
|   |   |-- state/           # versioned store and audit records
|   |   |-- llm/             # providers and simulation engine
|   |   |-- voice/           # speech providers and provider selection
|   |   `-- documents/       # PDF and Markdown generation
|   `-- tests/
|-- evaluation/
|   |-- cases/               # JSON fixtures
|   `-- run.ts
|-- docs/
|   |-- AI_LOG.md
|   |-- ARCHITECTURE.md
|   `-- PRODUCTION_NOTES.md
|-- scripts/
|   `-- run_all_tests.sh
|-- Dockerfile
|-- docker-compose.yml
`-- README.md
```
