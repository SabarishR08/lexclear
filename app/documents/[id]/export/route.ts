// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { DISCLAIMER } from "@/lib/disclaimer";
import { loadDocument } from "@/lib/documents";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = await loadDocument(id);
  if (!loaded) return new Response("Not found", { status: 404 });

  const { document, clauses } = loaded;
  const flagged = clauses.filter(
    (clause) => clause.riskLevel === "risky" || clause.riskLevel === "needs-attention",
  );

  const lines = [
    `# Lawyer prep sheet: ${document.title}`,
    "",
    `> ${DISCLAIMER}`,
    "",
    "## Clauses to discuss",
    ...(flagged.length
      ? flagged.map(
          (clause) =>
            `- **${clause.clauseRef} — ${clause.riskLevel}:** ${clause.plainText} _Why:_ ${clause.reason}`,
        )
      : ["- No high-risk clauses were flagged in this document."]),
    "",
    "## Questions to bring to a licensed attorney",
    "- Does this clause fit my specific situation?",
    "- What change would reduce my practical risk?",
    "- Which obligations or deadlines should I diarise?",
    "",
  ];

  const filename =
    document.title
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "document";

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-lawyer-prep.md"`,
    },
  });
}
