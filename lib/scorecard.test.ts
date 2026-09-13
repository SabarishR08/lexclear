// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { generateCalendarICS } from "./calendar";
import { getCounterProposal } from "./counter-proposals";
import type { AnalysisRow } from "./documents";
import {
  calculateContractHealth,
  detectContractInconsistencies,
  extractContractDeadlines,
} from "./scorecard";

const mockClauses: AnalysisRow[] = [
  {
    id: "1",
    clauseRef: "Clause 2",
    clauseText:
      "Monthly rent is $1,850 payable on the first day of each month. Late fee after 5th day.",
    plainText: "Rent is due on the 1st. Late fee applies after the 5th.",
    category: "Payment",
    riskLevel: "neutral",
    reason: "Standard rent schedule.",
  },
  {
    id: "2",
    clauseRef: "Clause 4",
    clauseText:
      "Tenant may terminate upon giving 60 days prior written notice and paying 2 months full rent penalty fee. Failure forfeits deposit.",
    plainText:
      "You must give 60 days notice and pay 2 months rent to leave early, or lose deposit.",
    category: "Termination",
    riskLevel: "risky",
    reason: "Severe early termination penalty.",
  },
  {
    id: "3",
    clauseRef: "Clause 6",
    clauseText:
      "Landlord may enter with 24 hours advance notice. In emergency, entry is immediate.",
    plainText: "Landlord gives 24 hours notice to enter, unless emergency.",
    category: "Access",
    riskLevel: "favorable",
    reason: "Clear notice requirement.",
  },
  {
    id: "4",
    clauseRef: "Clause 8",
    clauseText:
      "Tenant agrees to indemnify and hold Landlord harmless from any claim, regardless of whether Landlord was partially negligent.",
    plainText: "You protect landlord from all claims even if landlord was partly at fault.",
    category: "Liability",
    riskLevel: "risky",
    reason: "Unilateral indemnification even for landlord negligence.",
  },
];

describe("calculateContractHealth", () => {
  it("calculates realistic health and fairness scorecard", () => {
    const health = calculateContractHealth(mockClauses);
    expect(health.overallScore).toBeGreaterThan(0);
    expect(health.overallScore).toBeLessThanOrEqual(100);
    expect(["A", "B", "C", "D", "F"]).toContain(health.grade);
    expect(health.riskCount).toBe(2);
    expect(health.favorableCount).toBe(1);
    expect(health.pillars.clarityScore).toBeGreaterThan(50);
  });

  it("handles empty clauses gracefully", () => {
    const health = calculateContractHealth([]);
    expect(health.overallScore).toBe(50);
    expect(health.grade).toBe("C");
  });
});

describe("detectContractInconsistencies", () => {
  it("detects broad indemnity issues", () => {
    const issues = detectContractInconsistencies(mockClauses);
    expect(issues.some((i) => i.id === "inconsistency-indemnity")).toBe(true);
    const indemnityIssue = issues.find((i) => i.id === "inconsistency-indemnity");
    expect(indemnityIssue?.severity).toBe("high");
    expect(indemnityIssue?.clauseRefs).toContain("Clause 8");
  });

  it("detects deposit forfeiture without cure period", () => {
    const issues = detectContractInconsistencies(mockClauses);
    expect(issues.some((i) => i.id === "inconsistency-deposit")).toBe(true);
  });
});

describe("extractContractDeadlines", () => {
  it("extracts payment, grace period, and termination deadlines", () => {
    const deadlines = extractContractDeadlines(mockClauses);
    expect(deadlines.length).toBeGreaterThanOrEqual(3);
    const payment = deadlines.find((d) => d.category === "payment" && d.timeframe.includes("1st"));
    expect(payment).toBeDefined();
    const notice = deadlines.find(
      (d) => d.category === "notice" && d.timeframe.includes("60 days"),
    );
    expect(notice).toBeDefined();
  });
});

describe("generateCalendarICS", () => {
  it("generates valid iCalendar VCALENDAR text", () => {
    const deadlines = extractContractDeadlines(mockClauses);
    const ics = generateCalendarICS("Residential Lease", deadlines);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("Residential Lease");
  });
});

describe("getCounterProposal", () => {
  it("suggests balanced wording and negotiation tips for early termination", () => {
    const proposal = getCounterProposal(
      "Termination",
      "Early termination penalty of 2 months",
      "Excessive fee",
    );
    expect(proposal.suggestedWording).toContain("thirty (30) days");
    expect(proposal.rationale).toContain("Standard commercial standards");
    expect(proposal.negotiationTip).toBeTruthy();
  });

  it("suggests reciprocal wording for unilateral indemnity", () => {
    const proposal = getCounterProposal(
      "Liability",
      "Tenant indemnifies landlord",
      "Unilateral liability",
    );
    expect(proposal.suggestedWording).toContain("gross negligence or willful misconduct");
  });
});
