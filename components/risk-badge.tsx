// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { RiskLevel } from "@/lib/types";

export const riskColors: Record<RiskLevel, string> = {
  risky: "#f9d6d1",
  "needs-attention": "#fbe0d1",
  neutral: "#e7eee9",
  favorable: "#d8eee4",
};

/**
 * The risk level is always written out, so the colour is reinforcement rather
 * than the only signal.
 */
export function RiskBadge({ level, category }: { level: RiskLevel; category?: string }) {
  return (
    <span className="tag" style={{ background: riskColors[level] }}>
      {category ? `${level} · ${category}` : level}
    </span>
  );
}
