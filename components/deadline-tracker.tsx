"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useMemo, useState } from "react";
import { generateCalendarICS } from "@/lib/calendar";
import type { AnalysisRow } from "@/lib/documents";
import { extractContractDeadlines } from "@/lib/scorecard";

export function DeadlineTracker({
  clauses,
  documentTitle,
}: {
  clauses: AnalysisRow[];
  documentTitle: string;
}) {
  const deadlines = useMemo(() => extractContractDeadlines(clauses), [clauses]);
  const [downloaded, setDownloaded] = useState(false);

  function handleDownloadICS() {
    if (!deadlines.length) return;
    const icsContent = generateCalendarICS(documentTitle, deadlines);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName =
      documentTitle
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "contract";
    link.download = `${safeName}-deadlines.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }

  return (
    <div className="deadline-tracker-container" role="region" aria-label="Contract Deadlines">
      <div className="deadline-header">
        <div>
          <strong>Key Contractual Deadlines &amp; Milestones</strong>
          <p className="muted">
            Important dates, notice windows, and payment triggers extracted from your contract.
          </p>
        </div>
        {deadlines.length ? (
          <button
            type="button"
            className="btn secondary download-ics-btn"
            onClick={handleDownloadICS}
          >
            {downloaded ? "✓ Calendar Exported (.ics)" : "📅 Add to Calendar (.ics)"}
          </button>
        ) : null}
      </div>

      {deadlines.length ? (
        <div className="deadline-timeline">
          {deadlines.map((item) => (
            <div key={item.id} className="timeline-event">
              <div className="timeline-marker" />
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <span className="tag">{item.category.toUpperCase()}</span>
                  <span className="timeline-timeframe">{item.timeframe}</span>
                  <small className="muted">{item.clauseRef}</small>
                </div>
                <h4>{item.title}</h4>
                <p className="timeline-action">
                  <strong>Action Required:</strong> {item.actionRequired}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel empty-deadlines">
          <p>
            No specific calendar deadlines or numerical notice periods were found in this document.
          </p>
        </div>
      )}
    </div>
  );
}
