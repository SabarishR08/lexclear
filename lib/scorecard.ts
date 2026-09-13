// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { AnalysisRow } from "@/lib/documents";

export interface ContractHealthScore {
  overallScore: number; // 0 to 100
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  riskCount: number;
  attentionCount: number;
  favorableCount: number;
  neutralCount: number;
  pillars: {
    clarityScore: number; // 0 to 100
    riskBalanceScore: number; // 0 to 100
    protectionScore: number; // 0 to 100
    remedyScore: number; // 0 to 100
  };
}

export interface ContractInconsistency {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
  clauseRefs: string[];
  recommendation: string;
}

export interface ContractDeadline {
  id: string;
  title: string;
  timeframe: string;
  category: "notice" | "payment" | "renewal" | "maintenance" | "refund";
  clauseRef: string;
  actionRequired: string;
}

/**
 * Calculates deterministic contract health, fairness, and balance scorecards
 * based on clause classifications and extracted obligations.
 */
export function calculateContractHealth(clauses: AnalysisRow[]): ContractHealthScore {
  if (!clauses.length) {
    return {
      overallScore: 50,
      grade: "C",
      summary: "No analyzed clauses found to calculate contract health.",
      riskCount: 0,
      attentionCount: 0,
      favorableCount: 0,
      neutralCount: 0,
      pillars: { clarityScore: 50, riskBalanceScore: 50, protectionScore: 50, remedyScore: 50 },
    };
  }

  let risky = 0;
  let attention = 0;
  let favorable = 0;
  let neutral = 0;

  for (const c of clauses) {
    if (c.riskLevel === "risky") risky++;
    else if (c.riskLevel === "needs-attention") attention++;
    else if (c.riskLevel === "favorable") favorable++;
    else neutral++;
  }

  const total = clauses.length;
  // Weighted risk penalty: risky (-20), attention (-10), favorable (+10), neutral (+5)
  const baseScore = 100;
  const riskPenalty = (risky * 22 + attention * 11) / total;
  const favorableBonus = (favorable * 15) / total;
  const overallScore = Math.max(
    15,
    Math.min(100, Math.round(baseScore - riskPenalty * 3 + favorableBonus)),
  );

  let grade: ContractHealthScore["grade"] = "C";
  if (overallScore >= 85) grade = "A";
  else if (overallScore >= 72) grade = "B";
  else if (overallScore >= 58) grade = "C";
  else if (overallScore >= 42) grade = "D";
  else grade = "F";

  let summary = "Balanced standard agreement with normal commercial protections.";
  if (risky >= 3 || overallScore < 50) {
    summary =
      "High risk exposure detected. Several terms are unusually one-sided or impose heavy liabilities.";
  } else if (attention >= 2 || overallScore < 70) {
    summary =
      "Moderate risk terms identified. Review key notice and liability clauses before signing.";
  } else if (overallScore >= 85) {
    summary =
      "Equitable and transparent agreement with balanced rights and clear remedy mechanisms.";
  }

  const clarityScore = Math.min(95, Math.max(60, Math.round(75 + (favorable * 4 - risky * 3))));
  const riskBalanceScore = Math.max(
    20,
    Math.min(95, Math.round(100 - ((risky * 2.5 + attention * 1.5) / total) * 60)),
  );
  const protectionScore = Math.max(
    30,
    Math.min(95, Math.round(65 + ((favorable - risky) / total) * 35)),
  );
  const remedyScore = Math.max(25, Math.min(95, Math.round(70 - (risky / total) * 50)));

  return {
    overallScore,
    grade,
    summary,
    riskCount: risky,
    attentionCount: attention,
    favorableCount: favorable,
    neutralCount: neutral,
    pillars: {
      clarityScore,
      riskBalanceScore,
      protectionScore,
      remedyScore,
    },
  };
}

/**
 * Detects contractual ambiguities, conflicts, and missing standard bilateral protections.
 */
export function detectContractInconsistencies(clauses: AnalysisRow[]): ContractInconsistency[] {
  const issues: ContractInconsistency[] = [];
  const textAll = clauses.map((c) => `${c.clauseRef}: ${c.clauseText}`).join(" \n ");

  // 1. Notice period discrepancy check
  const noticeClauses = clauses.filter(
    (c) =>
      c.clauseText.toLowerCase().includes("notice") ||
      c.plainText.toLowerCase().includes("notice") ||
      c.category.toLowerCase().includes("termination"),
  );

  const daysFound = Array.from(textAll.matchAll(/(\d+)\s*(?:\(\d+\))?\s*days/gi)).map((m) =>
    parseInt(m[1], 10),
  );
  const uniqueDays = Array.from(new Set(daysFound.filter((d) => d >= 10 && d <= 120)));

  if (uniqueDays.length >= 2 && noticeClauses.length >= 2) {
    issues.push({
      id: "inconsistency-notice",
      title: "Multiple Discrepant Notice Windows",
      severity: "medium",
      description: `The document specifies different notice windows (${uniqueDays.join(" days vs ")} days). This can create ambiguity during cancellation or termination.`,
      clauseRefs: noticeClauses.slice(0, 2).map((c) => c.clauseRef),
      recommendation:
        "Clarify which specific notice duration applies to standard vs. early termination.",
    });
  }

  // 2. One-sided indemnity / waiver check
  const indemnityClause = clauses.find(
    (c) =>
      c.clauseText.toLowerCase().includes("indemnif") ||
      c.clauseText.toLowerCase().includes("hold harmless") ||
      c.clauseText.toLowerCase().includes("regardless of whether"),
  );
  if (indemnityClause) {
    issues.push({
      id: "inconsistency-indemnity",
      title: "Unilateral Hold-Harmless / Broad Indemnity",
      severity: "high",
      description:
        "One party is required to indemnify the other even in situations of comparative negligence or non-intentional conduct.",
      clauseRefs: [indemnityClause.clauseRef],
      recommendation:
        "Request mutual indemnity or insert an exclusion for the other party's gross negligence or willful misconduct.",
    });
  }

  // 3. Forfeiture of deposit without cure period
  const depositClause = clauses.find(
    (c) =>
      (c.clauseText.toLowerCase().includes("deposit") ||
        c.clauseText.toLowerCase().includes("liquidated")) &&
      (c.clauseText.toLowerCase().includes("forfeit") || c.riskLevel === "risky"),
  );
  if (depositClause) {
    issues.push({
      id: "inconsistency-deposit",
      title: "Deposit Forfeiture Without Defined Cure Period",
      severity: "high",
      description:
        "Clause stipulates automatic forfeiture of deposit alongside penalties without providing a reasonable written cure period.",
      clauseRefs: [depositClause.clauseRef],
      recommendation:
        "Add a 14-day written notice and cure window before penalties or deposit forfeiture can occur.",
    });
  }

  // 4. Non-solicitation or non-compete overbreadth
  const nonSolicit = clauses.find(
    (c) =>
      c.clauseText.toLowerCase().includes("non-solicit") ||
      c.clauseText.toLowerCase().includes("solicit, recruit") ||
      c.clauseText.toLowerCase().includes("trade secret"),
  );
  if (nonSolicit) {
    issues.push({
      id: "inconsistency-restrictive",
      title: "Extended Post-Termination Restriction",
      severity: "medium",
      description:
        "Restrictive covenants extend beyond agreement termination without geographical limitation.",
      clauseRefs: [nonSolicit.clauseRef],
      recommendation:
        "Limit restrictions to direct solicitations and specify bounded geographic/temporal scope.",
    });
  }

  return issues;
}

/**
 * Extracts critical dates and deadline triggers from the contract text.
 */
export function extractContractDeadlines(clauses: AnalysisRow[]): ContractDeadline[] {
  const deadlines: ContractDeadline[] = [];

  for (const c of clauses) {
    const text = c.clauseText;

    // Monthly Payment
    if (/first day of each|1st of (?:the|each)|monthly rent is/i.test(text)) {
      deadlines.push({
        id: `deadline-${c.id}-payment`,
        title: "Monthly Rent / Payment Due",
        timeframe: "1st of every calendar month",
        category: "payment",
        clauseRef: c.clauseRef,
        actionRequired:
          "Ensure payment is initiated 2-3 business days in advance to avoid late fees.",
      });
    }

    // Late fee grace period
    const graceMatch = text.match(/(?:after the|within)\s*(\d+)(?:th|st|nd|rd)?\s*day/i);
    if (graceMatch && /late|penalty/i.test(text)) {
      deadlines.push({
        id: `deadline-${c.id}-grace`,
        title: "Late Fee Grace Cut-off",
        timeframe: `${graceMatch[1]}th day of calendar month`,
        category: "payment",
        clauseRef: c.clauseRef,
        actionRequired: "Pay balance prior to this date to prevent automatic late penalties.",
      });
    }

    // Termination Notice
    const noticeMatch = text.match(
      /(\d+)\s*(?:\(\d+\))?\s*days['’]?\s*(?:prior\s*)?written notice/i,
    );
    if (noticeMatch) {
      deadlines.push({
        id: `deadline-${c.id}-notice`,
        title: "Written Termination Notice Window",
        timeframe: `${noticeMatch[1]} days prior to departure/termination`,
        category: "notice",
        clauseRef: c.clauseRef,
        actionRequired: `Send formal written notice at least ${noticeMatch[1]} days before planned exit date.`,
      });
    }

    // Deposit Return Window
    const returnMatch = text.match(/(?:returned within|within)\s*(\d+)\s*(?:\(\d+\))?\s*days/i);
    if (returnMatch && /deposit|move-out|vacat/i.test(text)) {
      deadlines.push({
        id: `deadline-${c.id}-refund`,
        title: "Deposit Return & Accounting Deadline",
        timeframe: `${returnMatch[1]} days post move-out`,
        category: "refund",
        clauseRef: c.clauseRef,
        actionRequired: "Request itemized receipt of withholdings if full deposit is not received.",
      });
    }

    // Landlord Entry Notice
    const entryMatch = text.match(/(\d+)\s*(?:hours?|hrs?)/i);
    if (entryMatch && /enter|entry|access|inspect/i.test(text)) {
      deadlines.push({
        id: `deadline-${c.id}-entry`,
        title: "Advance Entry Notice Requirement",
        timeframe: `At least ${entryMatch[1]} hours in advance`,
        category: "notice",
        clauseRef: c.clauseRef,
        actionRequired: "Landlord must provide advance notice prior to non-emergency visits.",
      });
    }
  }

  return deadlines;
}
