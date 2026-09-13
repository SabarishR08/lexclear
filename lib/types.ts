export type RiskLevel = "favorable" | "neutral" | "risky" | "needs-attention";
export type ClauseAnalysis = { clauseText: string; plainText: string; category: string; riskLevel: RiskLevel; reason: string; clauseRef: string };
export type DocumentRecord = { id: string; title: string; created_at: string; status: "processing" | "ready" | "failed" };
