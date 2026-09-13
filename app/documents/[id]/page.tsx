// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClauseExplorer } from "@/components/clause-explorer";
import { DocumentChat } from "@/components/document-chat";
import { InlineDisclaimer } from "@/components/disclaimer";
import { RetryAnalysis } from "@/components/retry-analysis";
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

      <div className="document-page-header">
        <div>
          <h1 className="document-title">{document.title}</h1>
          <p className="muted">
            Plain-language review, risk breakdown, and grounded Q&amp;A.{" "}
            <a className="link" href={`/documents/${id}/export`} download>
              Download Markdown Lawyer Prep Sheet
            </a>
            .
          </p>
        </div>
      </div>

      <InlineDisclaimer />

      {document.status === "processing" ? (
        <p className="notice-inline" role="status">
          Analysis is still running. Refresh in a moment to see the clause guide.
        </p>
      ) : null}
      {document.status === "failed" ? <RetryAnalysis documentId={id} /> : null}

      <div className="reader">
        <ClauseExplorer documentId={id} documentTitle={document.title} clauses={clauses} />
        <DocumentChat documentId={id} />
      </div>
    </main>
  );
}
