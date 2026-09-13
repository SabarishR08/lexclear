// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { createClient } from "@/lib/supabase/server";
import type { ClauseAnalysis, DocumentDetail, DocumentRecord, RiskLevel } from "@/lib/types";

export type AnalysisRow = {
  id: string;
  clauseRef: string;
  clauseText: string;
  plainText: string;
  category: string;
  riskLevel: RiskLevel;
  reason: string;
};

type AnalysisSelectRow = {
  id: string;
  clause_ref: string;
  clause_text: string;
  plain_text: string;
  category: string;
  risk_level: string;
  reason: string;
};

/**
 * Supabase may be unconfigured or unreachable; the library page should degrade
 * to its empty state rather than throwing a 500 at the reader.
 */
export async function loadLibrary(): Promise<{ documents: DocumentRecord[]; connected: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { documents: [], connected: true };

    const { data } = await supabase
      .from("documents")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false });

    const documents: DocumentRecord[] = (data ?? []).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      status: row.status as DocumentRecord["status"],
      created_at: String(row.created_at),
    }));

    return { documents, connected: true };
  } catch {
    return { documents: [], connected: false };
  }
}

export async function loadDocument(
  id: string,
): Promise<{ document: DocumentDetail; clauses: AnalysisRow[] } | null> {
  try {
    const supabase = await createClient();
    const { data: document } = await supabase
      .from("documents")
      .select("id,title,status")
      .eq("id", id)
      .maybeSingle();

    if (!document) return null;

    const { data: clauses } = await supabase
      .from("document_analysis")
      .select("id,clause_ref,clause_text,plain_text,category,risk_level,reason")
      .eq("document_id", id)
      .order("created_at");

    return {
      document: {
        id: String(document.id),
        title: String(document.title),
        status: document.status as DocumentDetail["status"],
      },
      clauses: (clauses ?? []).map((row: AnalysisSelectRow) => ({
        id: String(row.id),
        clauseRef: row.clause_ref,
        clauseText: row.clause_text,
        plainText: row.plain_text,
        category: row.category,
        riskLevel: row.risk_level as RiskLevel,
        reason: row.reason,
      })),
    };
  } catch {
    return null;
  }
}

export async function loadAnalysisForComparison(
  id: string,
): Promise<{ title: string; clauses: ClauseAnalysis[] } | null> {
  const supabase = await createClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select("id,title,status")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!document) return null;

  const { data: clauses, error: clauseError } = await supabase
    .from("document_analysis")
    .select("clause_ref,clause_text,plain_text,category,risk_level,reason")
    .eq("document_id", id);

  if (clauseError) throw new Error(clauseError.message);
  if (!clauses?.length) return null;

  return {
    title: String(document.title),
    clauses: clauses.map((row: Omit<AnalysisSelectRow, "id">) => ({
      clauseRef: row.clause_ref,
      clauseText: row.clause_text,
      plainText: row.plain_text,
      category: row.category,
      riskLevel: row.risk_level as RiskLevel,
      reason: row.reason,
    })),
  };
}
