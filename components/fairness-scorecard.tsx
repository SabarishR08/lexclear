"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useMemo } from "react";
import type { AnalysisRow } from "@/lib/documents";
import { calculateContractHealth } from "@/lib/scorecard";

export function FairnessScorecard({ clauses }: { clauses: AnalysisRow[] }) {
  const health = useMemo(() => calculateContractHealth(clauses), [clauses]);

  const gradeColors: Record<string, string> = {
    A: "#126b5a",
    B: "#2e7d32",
    C: "#c67d0a",
    D: "#d97b45",
    F: "#c2392b",
  };

  return (
    <div className="scorecard-container" role="region" aria-label="Contract Fairness Scorecard">
      <div className="scorecard-header">
        <div className="scorecard-main-score">
          <div
            className="score-circle"
            style={{ borderColor: gradeColors[health.grade] ?? "#126b5a" }}
          >
            <span className="score-number">{health.overallScore}</span>
            <span className="score-max">/100</span>
            <span
              className="score-grade-badge"
              style={{ background: gradeColors[health.grade] ?? "#126b5a" }}
            >
              Grade {health.grade}
            </span>
          </div>
          <div className="score-meta">
            <h3>Contract Health &amp; Fairness Score</h3>
            <p className="score-summary">{health.summary}</p>
            <div className="score-pill-row">
              <span className="tag">🔴 {health.riskCount} High Risk</span>
              <span className="tag">🟡 {health.attentionCount} Needs Attention</span>
              <span className="tag">🟢 {health.favorableCount} Favorable</span>
              <span className="tag">⚪ {health.neutralCount} Standard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-header">
            <strong>Clarity &amp; Plain Language</strong>
            <span className="pillar-score">{health.pillars.clarityScore}%</span>
          </div>
          <div className="pillar-bar">
            <div
              className="pillar-fill"
              style={{ width: `${health.pillars.clarityScore}%`, background: "#126b5a" }}
            />
          </div>
          <small className="muted">Readability and absence of deceptive legalese.</small>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <strong>Bilateral Risk Balance</strong>
            <span className="pillar-score">{health.pillars.riskBalanceScore}%</span>
          </div>
          <div className="pillar-bar">
            <div
              className="pillar-fill"
              style={{ width: `${health.pillars.riskBalanceScore}%`, background: "#a85220" }}
            />
          </div>
          <small className="muted">Reciprocity of obligations between both signing parties.</small>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <strong>Standard Protections</strong>
            <span className="pillar-score">{health.pillars.protectionScore}%</span>
          </div>
          <div className="pillar-bar">
            <div
              className="pillar-fill"
              style={{ width: `${health.pillars.protectionScore}%`, background: "#2e7d32" }}
            />
          </div>
          <small className="muted">Presence of customary tenant/client safeguards.</small>
        </div>

        <div className="pillar-card">
          <div className="pillar-header">
            <strong>Remedy Mechanisms</strong>
            <span className="pillar-score">{health.pillars.remedyScore}%</span>
          </div>
          <div className="pillar-bar">
            <div
              className="pillar-fill"
              style={{ width: `${health.pillars.remedyScore}%`, background: "#123e36" }}
            />
          </div>
          <small className="muted">Reasonable notice and cure windows before penalties.</small>
        </div>
      </div>
    </div>
  );
}
