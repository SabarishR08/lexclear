# CODEX AGENT PROMPT — PromptWars Virtual (Exclusive Edition): AI for Legal Assistance & Access

## Stack decision (final, don't relitigate)

- **Framework:** Next.js 15 (App Router) + TypeScript — one repo, one deploy, matches judged criteria (Code Quality/Security/Efficiency scored as one artifact), and matches PathFinder AI's stack that already worked for me.
- **DB:** Supabase Postgres + `pgvector` extension. Free tier, one service for auth + relational data + vector search. No separate vector DB needed.
- **GenAI:** Google Gemini API (`gemini-2.5-flash` for chat/analysis, `text-embedding-004` for embeddings). This event is run by Hack2skill "in collaboration with Google for Developers" — using Gemini is the safest alignment with evaluator bias, and it's free-tier friendly (generous RPD on Flash).
- **No custom ML model.** This is a 13-day solo build with a hard 4-min demo video and <10MB repo cap. Training/shipping a model buys nothing a good RAG + prompt pipeline doesn't already deliver, and it risks blowing the repo size limit and killing "Efficiency"/"Testing" scores. GenAI = Gemini + RAG. Do NOT add PyTorch/sklearn/local models.
- **Auth:** Supabase Auth (email + Google OAuth). Needed for "My Documents" persistence and to demonstrate Security (RBAC, RLS) to the evaluator.
- **File parsing:** `pdf-parse` (or `unpdf`) for PDF, `mammoth` for DOCX — client uploads, server-side extraction only, no third-party doc-parsing SaaS (keeps repo small, no extra API keys).
- **Hosting:** Vercel (free tier) for the Next.js app — satisfies "Deployed Prototype Link" requirement, zero-config with Next.js.
- **Styling:** Tailwind CSS + shadcn/ui — fast, accessible-by-default primitives (Radix under the hood) — directly helps the Accessibility score.
- **Testing:** Vitest (unit) + Playwright (e2e, 3-4 critical flows) — required for the "Testing" score line item; do not skip this.
- **State/data fetching:** React Server Components + Server Actions (no separate REST layer, no Redux). Keeps code surface small = higher Code Quality/Efficiency score.

Do not suggest alternate stacks (no Django, no Flask, no MERN, no Streamlit). This is final.

---

## Product: "LexClear" — Legal Document Clarity & Access Assistant

### Core problem being solved
Ordinary users (tenants signing leases, freelancers signing contracts, employees signing offer letters/NDAs) cannot parse legal documents and can't afford a lawyer for every read-through. LexClear turns an uploaded document into: a plain-language summary, a clause-by-clause risk/obligation breakdown, a Q&A chat grounded only in that document, a red-flag checklist, and a "questions to ask a lawyer" export — without ever issuing legal advice or a verdict.

### Explicit GenAI integration points (must be visible in the demo video and README — evaluator requires "explicit mapping")
1. **Document Simplification Engine** — Gemini 2.5 Flash rewrites each clause into plain English (grade-8 reading level), tagged by clause type (Payment, Termination, Liability, Confidentiality, Dispute Resolution, etc.).
2. **Risk & Obligation Highlighter** — Gemini structured-output call (JSON schema response) classifies each clause as `favorable / neutral / risky / needs-attention` with a one-line reason. Rendered as color-coded highlights over the original document text.
3. **Grounded Document Q&A (RAG)** — document is chunked, embedded via `text-embedding-004`, stored in `pgvector`; user chat questions retrieve top-k chunks and Gemini answers ONLY from retrieved context, with inline citations back to the exact clause/page. If the answer isn't in the document, it must say so explicitly (no hallucinated legal advice).
4. **Contract Comparison Mode** — upload two documents (e.g., two lease offers); Gemini produces a side-by-side diff of material terms (rent, deposit, notice period, penalties) in a table.
5. **Next-Steps & Lawyer-Prep Generator** — Gemini generates (a) a checklist of red flags to negotiate, (b) a list of specific questions to bring to a lawyer, referencing exact clauses.

### Explicit non-negotiable disclaimers (needed for "Problem Statement Alignment" — spec says "assist, not replace")
- Persistent banner: "LexClear provides general information, not legal advice. Consult a licensed attorney for your specific situation."
- Same disclaimer repeated at top of every AI-generated output (summary, chat answer, checklist).

---

## Feature list → build in this order

1. **Auth + shell**: Supabase email/Google login, protected `/dashboard`, empty state.
2. **Upload + parse pipeline**: drag-drop PDF/DOCX (max 10MB per file client-side check) → extract text server-side (Server Action) → store raw text + metadata in Supabase → chunk (500-token overlap-100) → embed via Gemini embeddings → store vectors in `pgvector` table `document_chunks`.
3. **Simplification + risk tagging**: on upload, run one Gemini structured-output call per clause batch, store results in `document_analysis` table (clause_text, plain_text, category, risk_level, reason). Render in a two-column reader view (original | plain-language) with color-coded risk sidebar.
4. **RAG chat**: chat UI scoped per document; retrieval via `pgvector` cosine similarity (top 5 chunks); Gemini answers with citations `[Clause 4.2]`; store chat history per document per user.
5. **Comparison mode**: select two documents from the user's library → Gemini comparison call → rendered diff table.
6. **Export**: "Lawyer Prep Sheet" as a downloadable PDF/Markdown (red flags + questions + doc excerpts).
7. **Accessibility pass**: keyboard nav, ARIA labels on all interactive elements, color contrast AA minimum, risk color-coding also has text/icon labels (not color-only), screen-reader tested with axe-core in CI.
8. **Security pass**: Supabase Row-Level Security on every table (`user_id = auth.uid()`), input sanitization on all Server Actions with `zod`, rate-limit the Gemini-calling endpoints (Upstash Redis or simple in-memory token bucket if avoiding new services), no service-role key on client, `.env` never committed, file upload MIME/type validation, PII redaction warning shown to user before any external LLM call (document text goes to Gemini API — disclose this in UI).
9. **Testing**: Vitest unit tests for chunking, risk-classification parsing, and the retrieval scorer; Playwright e2e for upload→analysis→chat happy path and one failure path (bad file type). Add `npm test` script and a GitHub Action CI workflow (`.github/workflows/ci.yml`) running lint + typecheck + tests — this alone materially helps Code Quality + Testing + Efficiency scores since evaluators check for CI.
10. **Polish for demo**: seed with 1 sample lease + 1 sample NDA (fixtures only, not committed as huge files) so live testing during the video is fast and realistic.

---

## Repo constraints (hard requirements — do not violate)

- Total repo size **< 10MB**. No `node_modules` committed (obviously), no large sample PDFs (keep sample fixtures under 200KB each, or generate them from a `.txt`/markdown source at seed time instead of storing binary PDFs).
- Repo must be **public** on GitHub.
- Add a root `README.md` with: project description, problem solved, **explicit GenAI service + integration point list** (copy section "Explicit GenAI integration points" above nearly verbatim — the evaluator explicitly wants this spelled out), setup instructions, architecture diagram (ASCII or a single lightweight SVG, no huge PNGs), and links (deployed URL, video).
- `.env.example` committed, real `.env` gitignored.

## Environment variables needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

## Deliverables checklist (map 1:1 to submission form)

- [ ] Deployed Prototype Link (Vercel production URL)
- [ ] Public GitHub Repo, <10MB
- [ ] Project description (README + a 2-paragraph text block for the submission form)
- [ ] GenAI architecture doc explicitly mapping services → integration points (see list above)
- [ ] Demo video, strictly <4 minutes, no pre-filled forms (type live), must visibly show: upload a real document live, simplification view, risk highlighting, RAG chat with a question typed live, comparison mode, export. Narrate which Gemini call powers each screen.

## Judging criteria this build targets (from prior challenge rubric: Code Quality, Security, Efficiency, Testing, Accessibility, Problem Statement Alignment)

- **Code Quality**: TypeScript strict mode, ESLint + Prettier, Server Actions instead of ad-hoc API routes, no dead code, consistent folder structure (`/app`, `/lib`, `/components`, `/lib/ai`, `/lib/db`).
- **Security**: RLS everywhere, zod validation, no secrets client-side, rate limiting, disclosed data handling.
- **Efficiency**: RSC to avoid over-fetching, vector search instead of brute-force LLM re-reads, caching of embeddings (don't re-embed unchanged docs), streaming Gemini responses for perceived speed.
- **Testing**: CI pipeline + unit + e2e, visible in repo.
- **Accessibility**: shadcn/Radix primitives, axe-core CI check, keyboard-only flow tested.
- **Problem Statement Alignment**: every one of the 7 "potential use cases" listed in the problem statement is covered by a named feature above (simplify, compare, highlight clauses/risks, answer questions on the document, understand options/next steps, generate summaries/checklists, prepare questions for a lawyer).

---

## Your task, Codex

Scaffold and build this project end to end in the order listed under "Feature list," committing incrementally with clear messages. Ask me only if a Supabase/Gemini credential is missing — otherwise make every implementation decision yourself using the stack and constraints above. Do not deviate from the stack. Do not add a custom-trained ML model. Do not exceed the 10MB repo budget — flag anything before adding a dependency or asset that would risk it. When done, produce the README content and a bullet-point script I can read for the 4-minute demo video.
