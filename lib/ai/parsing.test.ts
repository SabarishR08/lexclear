// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { parseMaterialTerms, parseRiskAnalysis } from "./parsing";

const validClause = {
  clauseText: "Either party may terminate on 30 days' notice.",
  plainText: "Either side can end the agreement with a month's notice.",
  category: "Termination",
  riskLevel: "needs-attention",
  reason: "Short notice period.",
  clauseRef: "Clause 8",
};

describe("parseRiskAnalysis", () => {
  it("accepts a well-formed model response", () => {
    expect(parseRiskAnalysis([validClause])).toHaveLength(1);
  });

  it("rejects a risk level the UI cannot render", () => {
    expect(() => parseRiskAnalysis([{ ...validClause, riskLevel: "catastrophic" }])).toThrow();
  });

  it("rejects output that is missing a field", () => {
    const { reason: _reason, ...incomplete } = validClause;
    expect(() => parseRiskAnalysis([incomplete])).toThrow();
  });
});

describe("parseMaterialTerms", () => {
  it("accepts a comparison row", () => {
    const terms = parseMaterialTerms([
      {
        term: "Deposit",
        documentA: "Two months' rent",
        documentB: "One month's rent",
        difference: "The first lease ties up an extra month of cash.",
        riskLevel: "risky",
      },
    ]);

    expect(terms[0].term).toBe("Deposit");
  });

  it("rejects a row without both document values", () => {
    expect(() =>
      parseMaterialTerms([{ term: "Deposit", documentA: "Two months", riskLevel: "neutral" }]),
    ).toThrow();
  });
});
