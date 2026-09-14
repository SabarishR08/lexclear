# Security Policy & Hardening Controls — LexClear

LexClear provides private, evidence-grounded legal document analysis and assistance designed for everyday signers facing unequal bargaining power.

---

## 1. Threat Model

LexClear processes sensitive legal instruments (leases, freelance agreements, offer letters, NDAs). Key threat vectors and mitigations:

| Threat Vector                                 | Severity | Mitigation & Defense Layer                                                                                                                                                 |
| :-------------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document Leakage / Unauthorized Access**    | Critical | Client/session-isolated querying; RLS policies; Zero data training guarantee; no raw document storage on public CDNs.                                                      |
| **Prompt Injection via Document Text**        |   High   | Untrusted document text is delimited in strict XML/data tags. In Grounded Q&A, system instructions explicitly forbid treating document content as executable instructions. |
| **Model Hallucination / Fabricated Law**      |   High   | Grounded RAG with strict verbatim citation requirement. Gemini responses must cite matching clause excerpts or explicitly refuse.                                          |
| **AI Quota Depletion / Denial of Service**    |  Medium  | Multi-tier token-bucket rate limiting ( akeToken) per IP/session; 10MB byte-sniffed file size caps; bounded token generation.                                              |
| **Cross-Site Scripting (XSS) & Clickjacking** |   High   | Modern React auto-escaping, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and strict Referrer-Policy.                                                            |

---

## 2. Technical Safeguards

### **A. Byte-Level File Sniffing & Input Validation**

- Uploads are checked against strict MIME magic-bytes (detectUploadKind) rather than trusting user-provided file extension or headers.
- Input size strictly limited to 10MB; character lengths bounded before chunking to prevent embedding-runaway.

### **B. Zero Retention & Privacy-First Architecture**

- Document text is never utilized for LLM retraining or fine-tuning under Google AI Studio terms.
- Database records use row-level cascading deletion; session states and checklists persist locally in browser storage without tracking cookies.

### **C. Defense-in-Depth Transport Headers**

Configured across all responses in Next.js:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

---

## 3. Vulnerability Reporting

If you discover a security concern in LexClear, please open a private GitHub security advisory on the repository or contact the author directly at sabarishr1087@gmail.com.
