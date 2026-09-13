import { z } from "zod";

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

export function parseMaterialTerms(value: unknown) {
  return z.array(materialTermSchema).parse(value);
}
