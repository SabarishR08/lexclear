# LexClear — Legal Document Clarity & Access Assistant

[![CI](https://github.com/SabarishR08/lexclear/actions/workflows/ci.yml/badge.svg)](https://github.com/SabarishR08/lexclear/actions/workflows/ci.yml)

LexClear helps tenants, freelancers and employees understand leases, contracts, offer letters and
NDAs. It turns an uploaded PDF or DOCX into plain-language clause explanations, clearly labelled
risks and obligations, grounded document Q&A, a side-by-side comparison of two documents, and a
downloadable lawyer-prep sheet. It provides general information only — **not legal advice**.

> LexClear provides general information, not legal advice. Consult a licensed attorney for your
> specific situation.

## GenAI services and integration points

Every AI capability runs on Google Gemini. There is no fallback provider, because embeddings from a
different model are not comparable to the vectors already stored in `pgvector`.

| Service                                            | Integration point                                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini `gemini-2.5-flash`, structured JSON output  | **Document Simplification Engine** — rewrites each clause in grade-8 English, tagged by category (Payment, Termination, Liability, Confidentiality, Dispute Resolution…).                                                                                                                 |
| Gemini `gemini-2.5-flash`, `responseSchema` enum   | **Risk & Obligation Highlighter** — classifies each clause `favorable`, `neutral`, `risky` or `needs-attention`, each with a written reason. The label is always rendered as text, never colour alone.                                                                                    |
| Gemini `text-embedding-004` + Supabase `pgvector`  | **Grounded Document Q&A (RAG)** — the document is chunked, embedded into 768-dimension vectors, and the top matches above a relevance floor are retrieved. Answers cite the clauses they came from and the model must say "I can't find that in this document" when the answer is absent. |
| Gemini `gemini-2.5-flash`, structured JSON output  | **Contract Comparison Mode** — pick two analysed documents and Gemini returns a material-terms table: payment/rent, deposit, notice period, penalties, term length and liability, with the practical difference for each.                                                                 |
| Gemini analysis output, rendered deterministically | **Next-Steps & Lawyer-Prep Generator** — the downloadable Markdown sheet gathers the `risky` and `needs-attention` clauses plus questions to bring to counsel. It is assembled from the stored analysis rather than a second model call.                                                  |

Document text is fenced in `<document>` tags and the prompts state that fenced content is data, never
instructions, because an uploaded contract is untrusted input.

## Architecture

```text
PDF/DOCX → Server Action (zod + magic-byte validation) → text extraction
  → Gemini structured clause analysis (zod-validated) → document_analysis
  → ~500-word chunks / 100-word overlap → Gemini text-embedding-004 → pgvector
  → top-8 vector candidates → relevance floor (≥0.5) → top 5 → grounded answer with citations
```

Two documents plus their stored analysis → Gemini comparison call → material-terms table.

## Security and privacy

- Row-level security on every table, scoped to `auth.uid()`; no service-role key ever reaches the
  browser (it is not used at all).
- `middleware.ts` refreshes the Supabase session and redirects anonymous visitors away from
  `/dashboard`, `/documents/*` and `/compare`.
- Uploads are validated twice: zod checks the declared type and the 10MB cap, then the raw bytes are
  sniffed for a real PDF header or an OOXML zip package, so a renamed file cannot reach a parser.
- An in-memory token bucket rate-limits both Gemini-calling Server Actions per user.
- Security headers (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are set
  in `next.config.ts`.
- Document text is disclosed as being sent to Gemini before upload, and `.env` is gitignored.

## Accessibility

- `axe-core` runs inside the Playwright suite in CI against the landing and login pages.
- Keyboard users get a skip link, a visibly-focused control outline, and the file input is visually
  hidden rather than `display: none` so it stays in the tab order.
- Risk states are written out as text as well as colour, and async results announce themselves
  through `role="status"` / `aria-live`.

## Testing

```bash
npm test        # Vitest unit suites (31 tests)
npm run test:e2e  # Playwright: accessibility, route protection, upload failure paths
```

Unit coverage: chunking, model-output validation, relevance selection, magic-byte detection, the
rate-limit bucket, bounded-concurrency mapping and the upload/chat/compare schemas.

Four Playwright specs drive the signed-in upload flow (keyboard reaching the file input, a plain
text file, a file that only claims to be a PDF, and an oversized file). They are skipped unless a
signed-in session is provided, because a magic link cannot be completed from a headless test:

```bash
E2E_SUPABASE_COOKIE_NAME=sb-<project-ref>-auth-token \
E2E_SUPABASE_COOKIE_VALUE=<cookie value> \
npm run test:e2e
```

CI (`.github/workflows/ci.yml`) runs lint, Prettier check, typecheck, unit tests, a production
build, and the Playwright suite.

## Code quality tooling

```bash
npm run lint          # ESLint flat config (next/core-web-vitals + next/typescript)
npm run format        # Prettier
npm run format:check  # CI formatting gate
npm run typecheck     # tsc --noEmit, strict
```

## Repository layout

```text
app/          routes, Server Actions and route handlers
components/   shared UI (disclaimer, risk badge, upload form, chat, compare form)
lib/ai/       Gemini calls and zod validation of model output
lib/          chunking, retrieval, upload sniffing, rate limiting, data access
e2e/          Playwright specs
supabase/     schema.sql (tables, RLS policies, match_document_chunks)
```

## Local setup

1. Copy `.env.example` to `.env.local` and set the credentials below.
2. Create a Supabase project, enable the `vector` extension, and run
   [`supabase/schema.sql`](supabase/schema.sql).
3. Enable email magic-link auth (and Google OAuth if you want it) in Supabase.
4. Run `npm install`, then `npm run dev`.

| Variable                        | Required | Purpose                        |
| ------------------------------- | -------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | Public anon key (RLS enforced) |
| `GEMINI_API_KEY`                | yes      | All Gemini calls               |
| `SUPABASE_SERVICE_ROLE_KEY`     | no       | Reserved; never sent to client |

Without the Supabase variables the app still builds and runs, showing a "not configured" notice
instead of the upload form.

## Known limitations

- Comparison Mode needs two documents whose analysis has finished, so upload both before comparing.
- A failed analysis leaves the extracted text in `documents.raw_text` but there is no retry button
  yet; re-uploading re-embeds from scratch (no embedding cache).
- Answers stream only after completion; responses are not token-streamed.
- The lawyer-prep sheet is assembled from the stored analysis instead of a second Gemini call.

## Submission links

- Deployed prototype: add Vercel URL here
- Demo video: add link here

## Four-minute demo script

- **0:00–0:20:** "LexClear makes legal documents clearer; it provides general information, not legal
  advice." Point at the persistent banner above every page.
- **0:20–0:55:** Sign in and upload a small lease PDF live. Point out the 10MB cap, the PDF/DOCX
  check, and the notice that text is sent to Gemini.
- **0:55–1:35:** Open the finished document. Show original clause text beside grade-8 language with
  the category, the written risk label and the reason. Say that Gemini structured JSON powers it and
  that the response is zod-validated before it is stored.
- **1:35–2:15:** Type a live question such as "How much notice do I need to give?" Show the cited
  answer, and explain that pgvector retrieves only this document's strongest passages before Gemini
  answers. Ask something that is not in the document to show it refusing.
- **2:15–2:50:** Open Compare documents, pick two leases, and walk the material-terms table (rent,
  deposit, notice, penalties). This is a second Gemini structured-output call.
- **2:50–3:20:** Download the lawyer prep sheet: flagged clauses plus questions to bring to counsel.
- **3:20–4:00:** Close on the engineering: RLS on every table, rate limiting and byte-level upload
  checks, `axe-core` accessibility checks plus keyboard support in CI, and a clear boundary —
  LexClear assists users, it never replaces a licensed lawyer.
