// lib/ai/evidence.ts
// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>

/**
 * PDF extraction and Gemini structured output may introduce whitespace
 * differences. Normalize before substring matching so "Clause  14" and
 * "Clause 14" both match.
 */
export function normalizeText(text: string): string {
  return text.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

/**
 * Verifies that a Gemini-generated clause excerpt actually exists in the
 * original source document. Returns true only when the normalized quote
 * is a substring of the normalized source. Minimum 12 chars prevents
 * trivially short strings from always matching.
 */
export function isVerifiedQuote(quote: string, sourceText: string): boolean {
  if (!quote || quote.trim().length < 12) return false;
  return normalizeText(sourceText).includes(normalizeText(quote));
}

/**
 * Filters a list of ClauseAnalysis items, keeping only those whose
 * clauseText can be verified against the source document.
 * Unverified clauses are dropped with a count reported so the UI
 * can show "X of Y clauses verified" rather than silently hiding data.
 */
export function filterVerifiedClauses<T extends { clauseText: string }>(
  clauses: T[],
  sourceText: string,
): { verified: T[]; droppedCount: number } {
  const verified: T[] = [];
  let droppedCount = 0;

  for (const clause of clauses) {
    if (isVerifiedQuote(clause.clauseText, sourceText)) {
      verified.push(clause);
    } else {
      droppedCount++;
    }
  }

  return { verified, droppedCount };
}
