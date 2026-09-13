"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useEffect, useMemo, useState } from "react";
import { DeadlineTracker } from "@/components/deadline-tracker";
import { FairnessScorecard } from "@/components/fairness-scorecard";
import { InconsistencyChecker } from "@/components/inconsistency-checker";
import { RiskBadge, riskColors } from "@/components/risk-badge";
import { getCounterProposal } from "@/lib/counter-proposals";
import type { AnalysisRow } from "@/lib/documents";
import { detectContractInconsistencies, extractContractDeadlines } from "@/lib/scorecard";
import type { RiskLevel } from "@/lib/types";

interface ClauseExplorerProps {
  documentId: string;
  documentTitle: string;
  clauses: AnalysisRow[];
}

type ExplorerTab = "guide" | "scorecard" | "inconsistencies" | "deadlines" | "checklist";

export function ClauseExplorer({ documentId, documentTitle, clauses }: ClauseExplorerProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ExplorerTab>("guide");
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [expandedProposals, setExpandedProposals] = useState<Record<string, boolean>>({});
  const [copiedProposalId, setCopiedProposalId] = useState<string | null>(null);

  // Load saved checklist states from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lexclear_checklist_${documentId}`);
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [documentId]);

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`lexclear_checklist_${documentId}`, JSON.stringify(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  }

  function toggleProposal(id: string) {
    setExpandedProposals((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function copyAlternative(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedProposalId(id);
      setTimeout(() => setCopiedProposalId(null), 2500);
    } catch {
      // ignore
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const counts = {
      total: clauses.length,
      risky: 0,
      "needs-attention": 0,
      neutral: 0,
      favorable: 0,
    };
    for (const c of clauses) {
      if (counts[c.riskLevel] !== undefined) {
        counts[c.riskLevel] += 1;
      }
    }
    return counts;
  }, [clauses]);

  // Derived analyses
  const inconsistencies = useMemo(() => detectContractInconsistencies(clauses), [clauses]);
  const deadlines = useMemo(() => extractContractDeadlines(clauses), [clauses]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of clauses) {
      if (c.category) set.add(c.category);
    }
    return Array.from(set).sort();
  }, [clauses]);

  // Filtered clauses for guide view
  const filteredClauses = useMemo(() => {
    return clauses.filter((c) => {
      if (selectedRisk !== "all" && c.riskLevel !== selectedRisk) return false;
      if (selectedCategory !== "all" && c.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = c.clauseRef.toLowerCase().includes(q);
        const matchesOriginal = c.clauseText.toLowerCase().includes(q);
        const matchesPlain = c.plainText.toLowerCase().includes(q);
        const matchesReason = c.reason.toLowerCase().includes(q);
        if (!matchesRef && !matchesOriginal && !matchesPlain && !matchesReason) return false;
      }
      return true;
    });
  }, [clauses, selectedRisk, selectedCategory, searchQuery]);

  // Flagged clauses for checklist view (risky + needs-attention)
  const flaggedClauses = useMemo(() => {
    return clauses.filter((c) => c.riskLevel === "risky" || c.riskLevel === "needs-attention");
  }, [clauses]);

  const resolvedCount = useMemo(() => {
    return flaggedClauses.filter((c) => checkedIds[c.id]).length;
  }, [flaggedClauses, checkedIds]);

  async function handleCopyPrepSheet() {
    const flagged = clauses.filter(
      (c) => c.riskLevel === "risky" || c.riskLevel === "needs-attention",
    );
    const text = [
      `# Lawyer Prep Sheet: ${documentTitle}`,
      "",
      "> LexClear provides general information, not legal advice. Consult a licensed attorney for your specific situation.",
      "",
      "## Flagged Clauses to Discuss:",
      ...(flagged.length
        ? flagged.map(
            (c) =>
              `- [${c.clauseRef}] (${c.riskLevel.toUpperCase()}): ${c.plainText}\n  Reason: ${c.reason}\n  Original: "${c.clauseText}"`,
          )
        : ["- No high-risk clauses were flagged in this document."]),
      "",
      "## Questions to Ask a Lawyer:",
      "1. Does this clause structure fit standard industry norms for my specific situation?",
      "2. What amendments or counter-proposals would reduce my practical liability?",
      "3. Are there implied warranties or statutory rights that override these terms?",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied to clipboard!");
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(null), 3000);
    }
  }

  return (
    <section className="panel clause-explorer" aria-labelledby="clause-guide-heading">
      <div className="explorer-header">
        <div>
          <h2 id="clause-guide-heading">Contract Intelligence Center</h2>
          <p className="muted">
            Plain-language explanations, fairness metrics, conflict detection, and negotiation
            tools.
          </p>
        </div>
        <div className="explorer-actions">
          <button
            className="btn secondary"
            type="button"
            onClick={handleCopyPrepSheet}
            aria-label="Copy lawyer prep sheet to clipboard"
          >
            {copyStatus ? "✓ Copied!" : "📋 Copy Prep Sheet"}
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="metrics-summary-bar" role="region" aria-label="Risk Metrics Summary">
        <div className="metric-pill">
          <span className="metric-count">{metrics.total}</span>
          <span className="metric-label">Total Clauses</span>
        </div>
        <button
          type="button"
          className={`metric-pill metric-risky ${selectedRisk === "risky" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("guide");
            setSelectedRisk(selectedRisk === "risky" ? "all" : "risky");
          }}
          aria-pressed={selectedRisk === "risky"}
        >
          <span className="metric-count">{metrics.risky}</span>
          <span className="metric-label">🔴 Risky</span>
        </button>
        <button
          type="button"
          className={`metric-pill metric-attention ${selectedRisk === "needs-attention" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("guide");
            setSelectedRisk(selectedRisk === "needs-attention" ? "all" : "needs-attention");
          }}
          aria-pressed={selectedRisk === "needs-attention"}
        >
          <span className="metric-count">{metrics["needs-attention"]}</span>
          <span className="metric-label">🟡 Needs Attention</span>
        </button>
        <button
          type="button"
          className={`metric-pill metric-favorable ${selectedRisk === "favorable" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("guide");
            setSelectedRisk(selectedRisk === "favorable" ? "all" : "favorable");
          }}
          aria-pressed={selectedRisk === "favorable"}
        >
          <span className="metric-count">{metrics.favorable}</span>
          <span className="metric-label">🟢 Favorable</span>
        </button>
        <button
          type="button"
          className={`metric-pill metric-neutral ${selectedRisk === "neutral" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("guide");
            setSelectedRisk(selectedRisk === "neutral" ? "all" : "neutral");
          }}
          aria-pressed={selectedRisk === "neutral"}
        >
          <span className="metric-count">{metrics.neutral}</span>
          <span className="metric-label">⚪ Neutral</span>
        </button>
      </div>

      {/* 5-Tab View Switcher */}
      <div className="view-switcher" role="tablist" aria-label="Analysis views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "guide"}
          className={`view-tab ${activeTab === "guide" ? "active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          📖 Clause Guide ({filteredClauses.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "scorecard"}
          className={`view-tab ${activeTab === "scorecard" ? "active" : ""}`}
          onClick={() => setActiveTab("scorecard")}
        >
          ⚖️ Fairness Scorecard
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inconsistencies"}
          className={`view-tab ${activeTab === "inconsistencies" ? "active" : ""}`}
          onClick={() => setActiveTab("inconsistencies")}
        >
          ⚠️ Inconsistencies ({inconsistencies.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "deadlines"}
          className={`view-tab ${activeTab === "deadlines" ? "active" : ""}`}
          onClick={() => setActiveTab("deadlines")}
        >
          📅 Deadlines ({deadlines.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "checklist"}
          className={`view-tab ${activeTab === "checklist" ? "active" : ""}`}
          onClick={() => setActiveTab("checklist")}
        >
          ☑️ Action Checklist ({resolvedCount}/{flaggedClauses.length})
        </button>
      </div>

      {/* Tab 1: Clause Guide */}
      {activeTab === "guide" ? (
        <>
          <div className="filter-controls">
            <div className="search-field">
              <label htmlFor="clause-search" className="visually-hidden">
                Search clauses
              </label>
              <input
                id="clause-search"
                type="search"
                placeholder="Search clauses, topics, or terms (e.g. deposit, notice, liability)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {categories.length > 0 ? (
              <div className="category-field">
                <label htmlFor="category-select" className="visually-hidden">
                  Filter by category
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {selectedRisk !== "all" || selectedCategory !== "all" || searchQuery ? (
              <button
                type="button"
                className="btn secondary reset-filters-btn"
                onClick={() => {
                  setSelectedRisk("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </button>
            ) : null}
          </div>

          <div className="clause-list" role="feed" aria-busy="false">
            {filteredClauses.length ? (
              filteredClauses.map((clause) => {
                const isFlagged =
                  clause.riskLevel === "risky" || clause.riskLevel === "needs-attention";
                const isProposalOpen = Boolean(expandedProposals[clause.id]);
                const counterProposal = isFlagged
                  ? getCounterProposal(clause.category, clause.clauseText, clause.reason)
                  : null;

                return (
                  <article
                    className="demo-doc"
                    key={clause.id}
                    style={{ borderLeftColor: riskColors[clause.riskLevel] }}
                  >
                    <div className="clause-item-header">
                      <RiskBadge level={clause.riskLevel} category={clause.category} />
                      <h3>{clause.clauseRef}</h3>
                    </div>
                    <p>
                      <strong>Original text:</strong> {clause.clauseText}
                    </p>
                    <p>
                      <strong>In plain language:</strong> {clause.plainText}
                    </p>
                    <p className="muted">
                      <strong>Why it matters:</strong> {clause.reason}
                    </p>

                    {/* Counter-Proposal Tool for Flagged Clauses */}
                    {isFlagged && counterProposal ? (
                      <div className="counter-proposal-wrapper">
                        <button
                          type="button"
                          className="btn-counter-toggle"
                          onClick={() => toggleProposal(clause.id)}
                          aria-expanded={isProposalOpen}
                        >
                          {isProposalOpen
                            ? "▲ Hide Counter-Proposal"
                            : "💡 Suggest Fair Alternative Clause"}
                        </button>

                        {isProposalOpen ? (
                          <div className="counter-proposal-box">
                            <div className="proposal-header">
                              <strong>Recommended Balanced Amendment</strong>
                              <button
                                type="button"
                                className="btn-copy-proposal"
                                onClick={() =>
                                  copyAlternative(clause.id, counterProposal.suggestedWording)
                                }
                              >
                                {copiedProposalId === clause.id ? "✓ Copied" : "Copy Clause"}
                              </button>
                            </div>
                            <blockquote className="suggested-wording">
                              &ldquo;{counterProposal.suggestedWording}&rdquo;
                            </blockquote>
                            <p className="proposal-rationale">
                              <strong>Strategic Rationale:</strong> {counterProposal.rationale}
                            </p>
                            <p className="proposal-tip">
                              <em>Negotiation Tip:</em> {counterProposal.negotiationTip}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <p className="muted" role="status">
                No clauses match your current filter or search criteria.
              </p>
            )}
          </div>
        </>
      ) : null}

      {/* Tab 2: Fairness Scorecard */}
      {activeTab === "scorecard" ? <FairnessScorecard clauses={clauses} /> : null}

      {/* Tab 3: Inconsistencies & Conflicts */}
      {activeTab === "inconsistencies" ? <InconsistencyChecker clauses={clauses} /> : null}

      {/* Tab 4: Deadlines & Calendar */}
      {activeTab === "deadlines" ? (
        <DeadlineTracker clauses={clauses} documentTitle={documentTitle} />
      ) : null}

      {/* Tab 5: Negotiation Checklist */}
      {activeTab === "checklist" ? (
        <div className="checklist-container" role="region" aria-label="Negotiation Checklist">
          <div className="checklist-banner">
            <strong>Actionable Review Checklist</strong>
            <p className="muted">
              These {flaggedClauses.length} items carry potential risk or one-sided obligations.
              Check them off as you discuss with the counterparty or your attorney.
            </p>
            <div className="checklist-progress-bar">
              <div
                className="checklist-progress-fill"
                style={{
                  width: `${flaggedClauses.length ? (resolvedCount / flaggedClauses.length) * 100 : 0}%`,
                }}
              />
            </div>
            <small>
              {resolvedCount} of {flaggedClauses.length} items marked as addressed
            </small>
          </div>

          {flaggedClauses.length ? (
            <ul className="checklist-items">
              {flaggedClauses.map((clause) => {
                const isChecked = Boolean(checkedIds[clause.id]);
                return (
                  <li
                    key={clause.id}
                    className={`checklist-item ${isChecked ? "completed" : ""}`}
                    style={{ borderLeftColor: riskColors[clause.riskLevel] }}
                  >
                    <label className="checklist-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(clause.id)}
                        className="checklist-checkbox"
                      />
                      <div className="checklist-content">
                        <div className="checklist-item-header">
                          <RiskBadge level={clause.riskLevel} category={clause.category} />
                          <strong>{clause.clauseRef}</strong>
                        </div>
                        <p className="checklist-plain">{clause.plainText}</p>
                        <p className="checklist-reason">
                          <em>Action point:</em> {clause.reason}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="panel empty-checklist">
              <p>🎉 No high-risk or attention-needed clauses were flagged in this document!</p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
