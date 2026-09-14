"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08

import { useState } from "react";
import { CheckCircle, MessageSquareText, ShieldAlert, Sparkles } from "lucide-react";

type AudienceKey = "tenants" | "freelancers" | "employees";
type PreviewTab = "clauses" | "chat";

interface AudienceDemo {
  label: string;
  docType: string;
  docTitle: string;
  badge: string;
  badgeType: "risky" | "needs-attention" | "favorable";
  clauseNumber: number;
  originalText: string;
  plainText: string;
  actionTip: string;
  sampleQuestion: string;
  sampleAnswer: string;
  citation: string;
}

const DEMOS: Record<AudienceKey, AudienceDemo> = {
  tenants: {
    label: "Tenants (Leases)",
    docType: "Residential Lease Agreement",
    docTitle: "Section 14: Security Deposit Forfeiture",
    badge: "🔴 Risky",
    badgeType: "risky",
    clauseNumber: 14,
    originalText:
      "Landlord may retain the entire security deposit as liquidated damages in the event of any early termination of this Lease, regardless of re-letting status or actual damages incurred.",
    plainText:
      "If you move out early, the landlord claims they can keep your entire deposit—even if they find a new tenant immediately and lose no rent money.",
    actionTip:
      "Ask to cap retention to actual documented damages or require the landlord to mitigate damages.",
    sampleQuestion: "Can my landlord keep my whole deposit if I break the lease early?",
    sampleAnswer:
      "According to Clause 14, the landlord explicitly attempts to withhold the full security deposit as liquidated damages upon any early departure. In many jurisdictions, statutory law limits retention to actual lost rent, making this term potentially unenforceable without mitigation.",
    citation: "Source: Clause 14 (Security Deposit & Early Termination)",
  },
  freelancers: {
    label: "Freelancers (Contracts)",
    docType: "Independent Contractor Agreement",
    docTitle: "Section 9: Unlimited Indemnity & IP Assignment",
    badge: "🔴 Risky",
    badgeType: "risky",
    clauseNumber: 9,
    originalText:
      "Contractor agrees to indemnify, defend, and hold harmless Client against any and all claims, liabilities, or losses, without limitation or cap, arising from Contractor deliverables.",
    plainText:
      "You would have to pay all of the client's legal fees and damages if anyone sues them over your work, with no ceiling on how much money you could owe.",
    actionTip:
      "Counter with a mutual liability cap equal to fees paid in the last 6 months, excluding gross negligence.",
    sampleQuestion: "Is there a limit on how much I could be sued for under this contract?",
    sampleAnswer:
      "No. Clause 9 states indemnification is 'without limitation or cap'. This exposes your personal or business assets to uncapped liability for third-party claims.",
    citation: "Source: Clause 9 (Indemnification & Hold Harmless)",
  },
  employees: {
    label: "Employees (Offers & NDAs)",
    docType: "Employment Offer & NDA",
    docTitle: "Section 6: Post-Employment Non-Compete",
    badge: "🟡 Needs Attention",
    badgeType: "needs-attention",
    clauseNumber: 6,
    originalText:
      "Employee agrees not to engage in or advise any entity competitive with Company for a period of twenty-four (24) months within a 100-mile radius following termination.",
    plainText:
      "You cannot work for or advise any competing company within 100 miles for two whole years after leaving your job.",
    actionTip:
      "Request narrowing the duration to 6 months or clarifying specific prohibited competitor categories.",
    sampleQuestion: "How long am I barred from working for competitors after I leave?",
    sampleAnswer:
      "Clause 6 sets a 24-month restriction within 100 miles. Note that several jurisdictions and regulatory rules severely restrict or ban broad post-employment non-compete covenants.",
    citation: "Source: Clause 6 (Covenant Against Competition)",
  },
};

export function InteractiveLandingPreview() {
  const [audience, setAudience] = useState<AudienceKey>("tenants");
  const [tab, setTab] = useState<PreviewTab>("clauses");

  const activeDemo = DEMOS[audience];

  return (
    <div className="landing-preview-wrapper" aria-label="Interactive LexClear Preview">
      {/* Audience selector */}
      <div className="audience-tabs" role="tablist" aria-label="Target audience examples">
        {(Object.keys(DEMOS) as AudienceKey[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={audience === key}
            className={"audience-pill" + (audience === key ? " active" : "")}
            onClick={() => setAudience(key)}
          >
            {DEMOS[key].label}
          </button>
        ))}
      </div>

      {/* Reader simulation container */}
      <div className="preview-reader-card">
        {/* Mock header bar */}
        <div className="preview-reader-header">
          <div className="preview-doc-meta">
            <span className="doc-pill">{activeDemo.docType}</span>
            <span className="preview-doc-title">{activeDemo.docTitle}</span>
          </div>
          <div className="preview-view-switch" role="tablist">
            <button
              type="button"
              className={"view-switch-btn" + (tab === "clauses" ? " active" : "")}
              onClick={() => setTab("clauses")}
            >
              Clause Guide
            </button>
            <button
              type="button"
              className={"view-switch-btn" + (tab === "chat" ? " active" : "")}
              onClick={() => setTab("chat")}
            >
              Grounded Q&A
            </button>
          </div>
        </div>

        {/* Tab content */}
        {tab === "clauses" ? (
          <div className="preview-body">
            <div className="preview-badge-row">
              <span className={"risk-tag " + activeDemo.badgeType}>{activeDemo.badge}</span>
              <span className="preview-clause-tag">Clause {activeDemo.clauseNumber}</span>
            </div>

            <div className="preview-clause-comparison">
              <div className="preview-box original">
                <div className="box-title">Original Legal Text</div>
                <p>{activeDemo.originalText}</p>
              </div>
              <div className="preview-box plain">
                <div className="box-title">
                  <Sparkles size={14} className="inline-icon" /> Plain-Language Translation (Grade
                  8)
                </div>
                <p>{activeDemo.plainText}</p>
              </div>
            </div>

            <div className="preview-action-callout">
              <ShieldAlert size={16} />
              <div>
                <strong>Recommended Next Step:</strong> {activeDemo.actionTip}
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-body chat-mode">
            <div className="chat-bubble user">
              <div className="bubble-label">You asked:</div>
              <p>{activeDemo.sampleQuestion}</p>
            </div>
            <div className="chat-bubble ai">
              <div className="bubble-label">
                <MessageSquareText size={14} className="inline-icon" /> LexClear Answer (Grounded in
                text):
              </div>
              <p>{activeDemo.sampleAnswer}</p>
              <div className="chat-citation">
                <CheckCircle size={13} /> {activeDemo.citation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
