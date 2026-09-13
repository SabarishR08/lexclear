// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentChat } from "@/components/document-chat";
import { InlineDisclaimer } from "@/components/disclaimer";
import { RetryAnalysis } from "@/components/retry-analysis";
import { RiskBadge, riskColors } from "@/components/risk-badge";
import { loadDocument } from "@/lib/documents";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const loaded = await loadDocument(id);
  return { title: loaded?.document.title ?? "Document" };
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const loaded = await loadDocument(id);
  if (!loaded) notFound();

  const { document, clauses } = loaded;

  return (
    <main className="page dashboard" id="main">
      <nav className="nav" aria-label="Primary">
        <Link className="brand" href="/">
          Lex<span>Clear</span>
        </Link>
        <Link className="btn secondary" href="/dashboard">
          Back to library
        </Link>
      </nav>

      <h1 className="document-title">{document.title}</h1>
      <InlineDisclaimer />
      <p className="muted">
        Risk labels are written out as text as well as colour.{" "}
        <a className="link" href={`/documents/${id}/export`} download>
          Download the lawyer prep sheet
        </a>
        .
      </p>

      {document.status === "processing" ? (
        <p className="notice-inline" role="status">
          Analysis is still running. Refresh in a moment to see the clause guide.
        </p>
      ) : null}
      {document.status === "failed" ? <RetryAnalysis documentId={id} /> : null}

      <div className="reader">
        <section className="panel" aria-labelledby="clause-guide-heading">
          <h2 id="clause-guide-heading">Clear clause guide</h2>
          {clauses.length ? (
            clauses.map((clause) => (
              <article
                className="demo-doc"
                key={clause.id}
                style={{ borderLeftColor: riskColors[clause.riskLevel] }}
              >
                <RiskBadge level={clause.riskLevel} category={clause.category} />
                <h3>{clause.clauseRef}</h3>
                <p>
                  <strong>Original:</strong> {clause.clauseText}
                </p>
                <p>
                  <strong>In plain language:</strong> {clause.plainText}
                </p>
                <p className="muted">
                  <strong>Why:</strong> {clause.reason}
                </p>
              </article>
            ))
          ) : (
            <p className="muted">No clauses have been analysed yet.</p>
          )}
        </section>

        <DocumentChat documentId={id} />
      </div>
    </main>
  );
}
