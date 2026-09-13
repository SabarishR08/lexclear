import { z } from "zod";
export const riskItemSchema = z.object({ clauseText: z.string(), plainText: z.string(), category: z.string(), riskLevel: z.enum(["favorable", "neutral", "risky", "needs-attention"]), reason: z.string(), clauseRef: z.string() });
export function parseRiskAnalysis(value: unknown) { return z.array(riskItemSchema).parse(value); }
