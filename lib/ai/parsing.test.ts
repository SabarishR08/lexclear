// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import type { ClauseAnalysis } from "@/lib/types";
import { mergeClauseBatches, parseMaterialTerms, parseRiskAnalysis } from "./parsing";

const validClause: ClauseAnalysis = {
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

describe("mergeClauseBatches", () => {
  it("concatenates batches in document order", () => {
    const merged = mergeClauseBatches([
      [{ ...validClause, clauseRef: "Clause 1" }],
      [{ ...validClause, clauseRef: "Clause 9" }],
    ]);

    expect(merged.map((clause) => clause.clauseRef)).toEqual(["Clause 1", "Clause 9"]);
  });

  it("drops a clause repeated verbatim across a batch boundary", () => {
    const merged = mergeClauseBatches([[validClause], [validClause]]);

    expect(merged).toHaveLength(1);
  });

  it("keeps two different clauses that share a reference", () => {
    const merged = mergeClauseBatches([
      [validClause],
      [{ ...validClause, clauseText: "A different clause with the same number." }],
    ]);

    expect(merged).toHaveLength(2);
  });

  it("returns nothing for no batches", () => {
    expect(mergeClauseBatches([])).toEqual([]);
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
