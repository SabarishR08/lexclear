import { describe, expect, it } from "vitest";
import { filterVerifiedClauses, isVerifiedQuote, normalizeText } from "./evidence";

describe("evidence verification layer", () => {
  const sourceDocument = `
    1. Term and Rent. Tenant agrees to pay Landlord $2,500 on the first day of each month.
    2. Security Deposit. Landlord acknowledges receipt of $2,500 as security deposit.
    3. Early Termination. Either party may terminate this agreement upon thirty days written notice.
  `;

  it("normalizeText collapses multiple spaces and trims text", () => {
    expect(normalizeText("Clause   14   \n\t text")).toBe("Clause 14 text");
  });

  it("isVerifiedQuote returns true for verbatim substrings", () => {
    const quote = "Either party may terminate this agreement upon thirty days written notice.";
    expect(isVerifiedQuote(quote, sourceDocument)).toBe(true);
  });

  it("isVerifiedQuote tolerates whitespace discrepancies through normalization", () => {
    const quote = "Either party   may terminate this agreement \n upon thirty days written notice.";
    expect(isVerifiedQuote(quote, sourceDocument)).toBe(true);
  });

  it("isVerifiedQuote returns false for quotes under 12 characters", () => {
    expect(isVerifiedQuote("Rent.", sourceDocument)).toBe(false);
    expect(isVerifiedQuote("", sourceDocument)).toBe(false);
  });

  it("isVerifiedQuote returns false for fabricated text not present in source", () => {
    const hallucinated = "Tenant must forfeit all deposits and pay an additional ,000 fee.";
    expect(isVerifiedQuote(hallucinated, sourceDocument)).toBe(false);
  });

  it("filterVerifiedClauses filters out unverified clauses and reports dropped count", () => {
    const clauses = [
      {
        clauseRef: "1",
        clauseText: "Tenant agrees to pay Landlord $2,500 on the first day of each month.",
        plainText: "Rent is $2,500 due on the 1st.",
      },
      {
        clauseRef: "99",
        clauseText: "This hallucinated clause does not exist in the contract anywhere.",
        plainText: "A fake rule.",
      },
    ];

    const { verified, droppedCount } = filterVerifiedClauses(clauses, sourceDocument);
    expect(verified).toHaveLength(1);
    expect(verified[0]?.clauseRef).toBe("1");
    expect(droppedCount).toBe(1);
  });
});
