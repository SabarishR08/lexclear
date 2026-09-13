"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useMemo } from "react";
import type { AnalysisRow } from "@/lib/documents";
import { detectContractInconsistencies } from "@/lib/scorecard";

export function InconsistencyChecker({ clauses }: { clauses: AnalysisRow[] }) {
  const issues = useMemo(() => detectContractInconsistencies(clauses), [clauses]);

  return (
    <div
      className="inconsistency-container"
      role="region"
      aria-label="Clause Inconsistencies and Conflicts"
    >
      <div className="inconsistency-banner">
        <strong>Inconsistency &amp; Ambiguity Detection</strong>
        <p className="muted">
          LexClear analyzes internal contradictions, ambiguous timeframes, and one-sided liabilities
          that may cause disputes or legal exposure.
        </p>
      </div>

      {issues.length ? (
        <div className="inconsistency-list">
          {issues.map((issue) => (
            <article key={issue.id} className={`inconsistency-card severity-${issue.severity}`}>
              <div className="inconsistency-card-header">
                <span
                  className={`tag ${issue.severity === "high" ? "metric-risky" : "metric-attention"}`}
                >
                  {issue.severity.toUpperCase()} PRIORITY
                </span>
                <div className="clause-refs">
                  {issue.clauseRefs.map((ref) => (
                    <span key={ref} className="ref-pill">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
              <h4>{issue.title}</h4>
              <p className="inconsistency-desc">{issue.description}</p>
              <div className="inconsistency-rec">
                <strong>Recommended Resolution:</strong> {issue.recommendation}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty-inconsistencies">
          <p>
            ✨ <strong>No major contradictions or conflicting terms detected.</strong> Standard
            operational clauses appear mutually aligned.
          </p>
        </div>
      )}
    </div>
  );
}
