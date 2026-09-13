# Submission block

Copy-paste text for the PromptWars submission form, plus a checklist of the remaining artefacts.

## Project description (paste both paragraphs)

LexClear is a legal document clarity assistant for people who have to sign contracts they cannot
parse: tenants reading a lease, freelancers reviewing a client agreement, employees weighing an offer
letter or an NDA. Upload a PDF or DOCX and LexClear returns a clause-by-clause guide that sets each
original clause beside a grade-8 plain-language explanation, labels every clause `favorable`,
`neutral`, `risky` or `needs-attention` with a written reason, answers questions using only the
retrieved text of that document, compares two documents term by term, and exports a lawyer-prep sheet
of the flagged clauses and the questions to bring to counsel. It closes a comprehension gap rather
than practising law: it provides general information, never a legal conclusion.

The stack is deliberately small and server-first: Next.js 15 App Router with Server Actions and React
Server Components, Supabase for Postgres, `pgvector`, row-level security and magic-link auth, and
Google Gemini for every AI capability. Five integration points are explicit — `gemini-2.5-flash` with
structured JSON output powers clause simplification and risk classification; `gemini-embedding-001`
with `pgvector` powers retrieval-augmented question answering that cites the clauses it used; a
second structured call powers the two-document material-terms comparison; and the lawyer-prep sheet
is assembled from stored analysis. Every model response is validated with zod before it is stored,
document text is fenced as untrusted input to resist prompt injection, embeddings run three at a time
with backoff retries on 429 and 503, and the persistent banner states that LexClear assists users
rather than replacing a licensed attorney.

## Quick facts

| Field      | Value                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Repository | <https://github.com/SabarishR08/lexclear>                                                                   |
| Stack      | Next.js 15, TypeScript (strict), Supabase Postgres + pgvector, Google Gemini, Tailwind-free hand-rolled CSS |
| GenAI      | `gemini-2.5-flash` (structured JSON), `gemini-embedding-001` (768-dimension vectors)                        |
| Author     | Sabarish R — <sabarishr1087@gmail.com>                                                                      |
| License    | MIT                                                                                                         |

## Deliverables checklist

- [x] Public GitHub repository
- [x] Repository under the 10MB cap (223KB of tracked content)
- [x] README with problem statement, explicit GenAI service mapping and Mermaid architecture diagrams
- [x] GenAI architecture mapping — see the README table
- [x] `.env.example` committed, real `.env` gitignored
- [x] CI running lint, formatting, typecheck, unit tests, build and Playwright accessibility checks
- [x] Two-paragraph project description (above)
- [x] MIT license
- [x] Deployed prototype link — <https://lexclear-three.vercel.app> (needs Supabase and Gemini env vars, see below)
- [ ] Demo video link — record and fill in below

## Demo links

- Deployed prototype: <https://lexclear-three.vercel.app>
- Demo video: _add link here_

## Before recording the demo

The deployed prototype currently reports "Supabase is not configured for this deployment yet", which
disables uploads, sign-in and the grounded Q&A the demo depends on. On Vercel, set:

| Variable                        | Where to get it                               |
| ------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project settings, API                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings, API, `anon` public |
| `GEMINI_API_KEY`                | Google AI Studio                              |

Then run `supabase/schema.sql` against that project (it enables the `vector` extension, creates the
tables and the RLS policies) and redeploy. Verify by loading `/dashboard`: it should redirect to
`/login` rather than showing the not-configured notice.
