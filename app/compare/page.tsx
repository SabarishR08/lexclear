// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { Metadata } from "next";
import Link from "next/link";
import { CompareForm } from "@/components/compare-form";
import { loadLibrary } from "@/lib/documents";

export const metadata: Metadata = { title: "Compare documents" };

export default async function ComparePage() {
  const { documents } = await loadLibrary();
  const ready = documents.filter((document) => document.status === "ready");

  return (
    <main className="page dashboard" id="main">
      <nav className="nav" aria-label="Primary">
        <Link className="brand" href="/">
          Lex<span>Clear</span>
        </Link>
        <Link className="btn secondary" href="/dashboard">
          Library
        </Link>
      </nav>

      <h1 className="dashboard-title">Compare documents</h1>
      <p className="lead">
        Put two leases, offers or NDAs side by side and see who the material terms actually favour.
      </p>

      {ready.length >= 2 ? (
        <CompareForm documents={ready} />
      ) : (
        <div className="panel">
          <p className="muted">
            Comparison needs two analysed documents. You currently have {ready.length} ready.
          </p>
          <Link className="btn" href="/dashboard">
            Upload a document
          </Link>
        </div>
      )}
    </main>
  );
}
