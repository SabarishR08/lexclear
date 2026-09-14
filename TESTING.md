# Testing & Quality Assurance — LexClear

LexClear maintains rigorous test coverage spanning unit tests, AI schema validation, accessibility checks, and concurrency safeguards.

---

## 1. Test Execution Commands

`ash

# Run all unit and integration test suites

npm test

# Run TypeScript compilation check

npm run typecheck

# Run ESLint validation

npm run lint

# Run Prettier code formatting check

npm run format:check

# Run full production build

npm run build
`

---

## 2. Tested Layers & Coverage

| Layer                  | Focus Area                                                          | Verification Files                                                  |
| :--------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------ |
| **Input Validation**   | Byte-level PDF/DOCX magic numbers, file size limits, rate limiting  | lib/files.test.ts, lib/validation.test.ts, lib/rate-limit.test.ts   |
| **AI Integration**     | Gemini response parsing, structured schema adherence, retry backoff | lib/ai/parsing.test.ts, lib/ai/retry.test.ts, lib/ai/gemini.test.ts |
| **Document Chunking**  | Text splitting, boundary preservation, character bounds             | lib/chunking.test.ts, lib/fixtures.test.ts                          |
| **Vector Retrieval**   | Semantic cosine similarity thresholding, relevance filtering        | lib/retrieval.test.ts                                               |
| **Contract Reasoning** | Fairness score calculation, date/term inconsistency detection       | lib/scorecard.test.ts                                               |
| **Concurrency**        | Bounded promise concurrency pool execution                          | lib/concurrency.test.ts                                             |
| **Routing & Auth**     | Public evaluation access and cookie session preservation            | middleware.test.ts                                                  |

---

## 3. Accessibility Standards (WCAG 2.2 AA)

- **Color Contrast**: 4.5:1 ratio verified across all risk badges and text elements.
- **Dual-Coding**: Every risk indicator pairs colors with text labels (🔴 Risky, 🟡 Needs Attention, 🟢 Favorable).
- **Keyboard Traversal**: Skip-link, focus visible outlines (:focus-visible), and ARIA live regions for dynamic clause filtering.
