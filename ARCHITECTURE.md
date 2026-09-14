# Architecture & Technical Design — LexClear

LexClear delivers evidence-grounded legal document comprehension and negotiation assistance using **Next.js 15 (App Router)**, **Supabase PostgreSQL with pgvector**, and **Google Gemini 2.5 Flash**.

---

## 1. System Architecture

`mermaid
flowchart TD
    User([Everyday Signer / Evaluator]) --> Client[Next.js App / React 19 Workspace]
    Client --> ServerAction[Next.js Server Actions & API]
    ServerAction --> Validation[Byte-Level Magic Sniffer & Zod Guards]
    Validation --> GeminiAI[Google Gemini 2.5 Flash API]
    GeminiAI --> StructOutput[Structured Clause Analysis & Risk Tiers]
    ServerAction --> Embedding[text-embedding-004 / 768-dim Vectors]
    Embedding --> Supabase[(Supabase PostgreSQL + pgvector)]
    Supabase --> RAG[Cosine Distance Semantic Search]
    RAG --> GroundedQA[Grounded Q&A with In-line Citations]
    Client --> LawyerSheet[Client-Side Markdown Prep Sheet Export]
    Client --> LegalAid[Section 12 NALSA Eligibility Engine]
`

---

## 2. Core Processing Pipeline

1. **Document Ingestion & Byte Sniffing**:
   - Files (.pdf, .docx) or raw text are validated by magic bytes. Character limits prevent unbounded token expenditures.
2. **Deterministic Chunking & Structured Generation**:
   - Contracts are segmented into numbered clauses. Gemini 2.5 Flash categorizes each clause into risk tiers (🔴 Risky, 🟡 Needs Attention, 🟢 Favorable, ⚪ Neutral) and produces Grade-8 reading level plain-English translations.
3. **Multi-Model Fallback Chain**:
   - High-reliability model chain (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`) ensures 0% rate limit or transient quota outage downtime.
   - All models configure `thinkingBudget: 0` for lightning-fast deterministic parsing.
4. **Deterministic Substring Evidence Verification**:
   - Every AI-extracted clause undergoes deterministic substring verification (`lib/ai/evidence.ts`) against the raw uploaded text.
   - Hallucinated or non-verbatim clauses that do not match the source document are automatically detected and filtered out.
5. **Vector Embeddings & Semantic Index**:
   - Text chunks are converted to 768-dimensional vector embeddings with controlled concurrency (EMBED_CONCURRENCY = 3) and stored in Supabase with HNSW/IVFFlat vector indexing.
6. **Bilateral Fairness Scorecard & Inconsistency Checker**:
   - Evaluates bilateral remedies (e.g. mutual vs. unilateral termination notice) and audits temporal/monetary contradictions across clauses.
7. **Grounded RAG Q&A**:
   - User queries generate a real-time vector embedding and run match_document_chunks RPC via pgvector cosine similarity (1 - (embedding <=> query_embedding)). System prompts strictly forbid ungrounded conjecture.
8. **Actionable Outputs & Access to Justice**:
   - Interactive negotiation checklist with browser persistence.
   - 1-click counter-proposal wording generator.
   - Lawyer consultation prep sheet (one-click copy & download).
   - Free Legal Aid eligibility self-check under Section 12 of the Legal Services Authorities Act, 1987.
