// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { z } from "zod";
import type { ClauseAnalysis } from "@/lib/types";

/**
 * Gemini output is untrusted input: validate it with zod before it reaches the
 * database or the UI rather than casting the parsed JSON.
 */
export const riskItemSchema = z.object({
  clauseText: z.string(),
  plainText: z.string(),
  category: z.string(),
  riskLevel: z.enum(["favorable", "neutral", "risky", "needs-attention"]),
  reason: z.string(),
  clauseRef: z.string(),
  sourceQuote: z.string().optional().default(""),
});

export const materialTermSchema = z.object({
  term: z.string(),
  documentA: z.string(),
  documentB: z.string(),
  difference: z.string(),
  riskLevel: z.enum(["favorable", "neutral", "risky", "needs-attention"]),
});

export function parseRiskAnalysis(value: unknown) {
  return z.array(riskItemSchema).parse(value);
}

/**
 * Clause analysis runs one call per batch, so the batches are concatenated in
 * document order. A clause that appears verbatim in two batches — possible when
 * a batch boundary splits a section — is kept once.
 */
export function mergeClauseBatches(batches: ClauseAnalysis[][]): ClauseAnalysis[] {
  const seen = new Set<string>();
  const merged: ClauseAnalysis[] = [];

  for (const clause of batches.flat()) {
    const key = `${clause.clauseRef}\u0000${clause.clauseText}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(clause);
  }

  return merged;
}

export function parseMaterialTerms(value: unknown) {
  return z.array(materialTermSchema).parse(value);
}
