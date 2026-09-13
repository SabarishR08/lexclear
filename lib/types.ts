export type RiskLevel = "favorable" | "neutral" | "risky" | "needs-attention";

export type ClauseAnalysis = {
  clauseText: string;
  plainText: string;
  category: string;
  riskLevel: RiskLevel;
  reason: string;
  clauseRef: string;
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
