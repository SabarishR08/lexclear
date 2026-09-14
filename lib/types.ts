// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

export type RiskLevel = "favorable" | "neutral" | "risky" | "needs-attention";

export type ClauseAnalysis = {
  clauseText: string;
  plainText: string;
  category: string;
  riskLevel: RiskLevel;
  reason: string;
  clauseRef: string;
  sourceQuote?: string;
};

export type MaterialTermComparison = {
  term: string;
  documentA: string;
  documentB: string;
  difference: string;
  riskLevel: RiskLevel;
};

export type DocumentRecord = {
  id: string;
  title: string;
  created_at: string;
  status: DocumentStatus;
};

export type DocumentStatus = "processing" | "ready" | "failed";

export type DocumentDetail = {
  id: string;
  title: string;
  status: DocumentStatus;
};
