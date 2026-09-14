"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08

import { useState } from "react";
import { CheckCircle2, ExternalLink, HelpCircle, Shield, Scale } from "lucide-react";

interface LegalAidCategory {
  id: string;
  clause: string;
  label: string;
  description: string;
}

const CATEGORIES: LegalAidCategory[] = [
  {
    id: "woman_child",
    clause: "Section 12(c)",
    label: "Women & Children",
    description: "All women and children are entitled to free legal aid irrespective of income.",
  },
  {
    id: "sc_st",
    clause: "Section 12(a)",
    label: "Scheduled Castes / Scheduled Tribes",
    description: "Members of SC or ST communities qualify automatically for legal assistance.",
  },
  {
    id: "disability",
    clause: "Section 12(d)",
    label: "Persons with Disabilities",
    description:
      "Persons with disabilities as defined under the Rights of Persons with Disabilities Act.",
  },
  {
    id: "workman",
    clause: "Section 12(f)",
    label: "Industrial Workman / Gig Labor",
    description: "Any person who is an industrial workman or low-income manual/gig worker.",
  },
  {
    id: "income_limit",
    clause: "Section 12(h)",
    label: "Income Below Prescribed Limit",
    description:
      "Annual income below state thresholds (typically ₹1,00,000 to ₹3,00,000 depending on state SLSA rules).",
  },
  {
    id: "custody_disaster",
    clause: "Section 12(e)/(g)",
    label: "Disaster Victim or In Custody",
    description: "Victims of mass disasters, ethnic violence, trafficking, or persons in custody.",
  },
];

export function LegalAidChecklist() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const matches = CATEGORIES.filter((c) => selected[c.id]);
  const isLikelyEligible = matches.length > 0;

  return (
    <div className="legal-aid-container">
      <div className="legal-aid-header">
        <div className="aid-title-row">
          <Scale size={22} className="aid-icon" />
          <div>
            <h3>Free Legal Aid Eligibility Self-Check</h3>
            <p className="muted">
              Under Section 12 of the Legal Services Authorities Act, 1987 (NALSA), millions of
              citizens qualify for 100% free legal assistance and government-appointed advocates.
            </p>
          </div>
        </div>
      </div>

      <div className="aid-assessment-box">
        {isLikelyEligible ? (
          <div className="aid-result eligible" role="status">
            <CheckCircle2 size={20} className="result-icon" />
            <div>
              <strong>Likely Eligible for Free Legal Aid!</strong>
              <p>
                You matched {matches.length} category criteria (
                {matches.map((m) => m.clause).join(", ")}). You can approach your nearest Taluk /
                District Legal Services Authority (DLSA) or High Court Legal Services Committee.
              </p>
              <a
                href="https://nalsa.gov.in/legal-aid/"
                target="_blank"
                rel="noreferrer noopener"
                className="aid-link-btn"
              >
                Apply Online via NALSA Portal <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ) : (
          <div className="aid-result check-prompt">
            <HelpCircle size={18} />
            <span>
              Select any conditions below that apply to check if you qualify for free
              representation:
            </span>
          </div>
        )}
      </div>

      <div className="aid-grid">
        {CATEGORIES.map((cat) => (
          <label key={cat.id} className={"aid-card" + (selected[cat.id] ? " active" : "")}>
            <input
              type="checkbox"
              checked={Boolean(selected[cat.id])}
              onChange={() => toggle(cat.id)}
              className="aid-checkbox"
            />
            <div className="aid-card-content">
              <div className="aid-card-header">
                <span className="aid-clause-tag">{cat.clause}</span>
                <span className="aid-card-title">{cat.label}</span>
              </div>
              <p className="aid-card-desc">{cat.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="aid-footer">
        <Shield size={16} />
        <span>
          LexClear does not store this information. Verification and final assignment of an advocate
          is done directly by the respective State Legal Services Authority.
        </span>
      </div>
    </div>
  );
}
