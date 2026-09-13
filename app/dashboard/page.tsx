// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { Metadata } from "next";
import Link from "next/link";
import { SampleDocumentLoader } from "@/components/sample-document-loader";
import { UploadForm } from "@/components/upload-form";
import { getCurrentUser } from "@/lib/auth";
import { loadLibrary } from "@/lib/documents";

export const metadata: Metadata = { title: "Your documents" };

export default async function DashboardPage() {
  const [user, { documents, connected }] = await Promise.all([getCurrentUser(), loadLibrary()]);

  return (
    <main className="page dashboard" id="main">
      <nav className="nav" aria-label="Primary">
        <Link className="brand" href="/">
          Lex<span>Clear</span>
        </Link>
        {user ? (
          <span className="muted">{user.email}</span>
        ) : (
          <Link className="btn secondary" href="/login">
            Sign in
          </Link>
        )}
      </nav>

      <div className="dashboard-head">
        <div>
          <h1 className="dashboard-title">Your documents</h1>
          <p className="muted">Private, plain-language support for your legal paperwork.</p>
        </div>
        <Link className="btn secondary" href="/compare">
          Compare two documents
        </Link>
      </div>

      {connected ? (
        <>
          <UploadForm />
          <SampleDocumentLoader />
        </>
      ) : (
        <p className="error" role="alert">
          Supabase is not configured for this deployment yet, so uploads are disabled.
        </p>
      )}

      <section className="documents" aria-labelledby="library-heading">
        <h2 id="library-heading" className="section-heading">
          Library
        </h2>
        {documents.length ? (
          <ul className="document-list">
            {documents.map((document) => (
              <li key={document.id}>
                <Link className="doc-card" href={`/documents/${document.id}`}>
                  <strong>{document.title}</strong>
                  <span className="tag">{document.status}</span>
                  <small>{new Date(document.created_at).toLocaleDateString()}</small>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No documents yet. Upload a PDF or DOCX to get started.</p>
        )}
      </section>
    </main>
  );
}
