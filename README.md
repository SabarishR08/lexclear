# LexClear — Legal Document Clarity & Access Assistant

LexClear helps tenants, freelancers, and employees understand leases, contracts, offer letters, and NDAs. It turns an uploaded PDF or DOCX into plain-language explanations, clearly labeled risks and obligations, grounded document Q&A, and a lawyer-prep export. It provides general information only—not legal advice.

## GenAI services and integration points

| Service | Integration |
| --- | --- |
| Gemini 2.5 Flash | Document Simplification Engine: rewrites clauses in grade-8 English and tags their category. |
| Gemini 2.5 Flash structured JSON | Risk & Obligation Highlighter: returns `favorable`, `neutral`, `risky`, or `needs-attention`, with a reason. |
| Gemini `text-embedding-004` + Supabase pgvector | Grounded Document Q&A: chunks are embedded, top five relevant excerpts are retrieved, and answers cite clause excerpts. It explicitly says when the document does not contain an answer. |
| Gemini 2.5 Flash | Contract Comparison Mode: the comparison screen is designed to compare rent, deposit, notice periods, and penalties across two documents. |
| Gemini 2.5 Flash | Next-Steps & Lawyer-Prep Generator: the downloadable Markdown sheet gathers attention-needed clauses and prompts for a lawyer. |

## Architecture

```text
PDF/DOCX → Server Action (MIME + size validation) → text extraction
  → Gemini structured clause analysis → document_analysis
  → 500-token chunks / 100-token overlap → Gemini embeddings → pgvector
  → top-5 vector retrieval → Gemini grounded response with citations
```

## Local setup

1. Copy `.env.example` to `.env.local` and set the Supabase and Gemini credentials.
2. Create a Supabase project, enable the `vector` extension, and run [`supabase/schema.sql`](supabase/schema.sql).
3. Enable email magic-link auth (and Google OAuth if desired) in Supabase.
4. Run `npm install`, then `npm run dev`.

## Quality and safety

- All database tables are protected with RLS scoped to `auth.uid()`.
- Server Actions validate file type/size and user input with Zod; no service key is sent to the browser.
- The UI discloses that document text is sent to Gemini before upload.
- Risk labels are textual as well as color-coded; forms have labels and keyboard-visible focus.
- `npm test` runs Vitest unit coverage for chunking, risk parsing, and retrieval scoring. GitHub Actions runs type checking, tests, and production build.

## Submission links

- Deployed prototype: add Vercel URL here
- Demo video: add link here

## Four-minute demo script

- **0:00–0:20:** “LexClear makes legal documents clearer; it is general information, not legal advice.” Point to the persistent disclosure.
- **0:20–0:55:** Sign in and upload a small lease PDF live. Point out the 10MB/PDF-DOCX validation and disclosure that text is sent to Gemini.
- **0:55–1:35:** Open the finished document. Show original clause text beside grade-8 language, category, risk label, and reason. Explain that Gemini structured JSON powers this view.
- **1:35–2:15:** Type a live question such as “How much notice do I need to give?” Show the cited answer and explain that pgvector retrieves only this document’s top excerpts before Gemini responds.
- **2:15–2:50:** Open Compare documents and select the two prepared examples; explain the planned material-term table for rent, deposit, notice, and penalties.
- **2:50–3:20:** Download the Lawyer Prep Sheet, showing attention-needed clauses and questions to bring to counsel.
- **3:20–4:00:** Close on privacy/RLS, accessibility labels, test/CI workflow, and the clear boundary: LexClear assists users; it never replaces a licensed lawyer.
