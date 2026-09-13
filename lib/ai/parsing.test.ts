import { describe, expect, it } from "vitest";
import { parseRiskAnalysis } from "./parsing";
describe("parseRiskAnalysis", () => { it("accepts the allowed risk labels", () => expect(parseRiskAnalysis([{ clauseText:"x", plainText:"y", category:"Term", riskLevel:"needs-attention", reason:"z", clauseRef:"1" }])[0].riskLevel).toBe("needs-attention")); it("rejects invented labels", () => expect(() => parseRiskAnalysis([{ clauseText:"x", plainText:"y", category:"Term", riskLevel:"danger", reason:"z", clauseRef:"1" }])).toThrow()); });
