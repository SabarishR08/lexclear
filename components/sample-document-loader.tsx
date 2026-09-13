"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadSampleAgreement } from "@/app/dashboard/actions";
import type { SampleContractType } from "@/lib/fixtures";

export function SampleDocumentLoader() {
  const router = useRouter();
  const [busyType, setBusyType] = useState<SampleContractType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLoad(type: SampleContractType) {
    setError(null);
    setBusyType(type);

    startTransition(async () => {
      const response = await loadSampleAgreement(type);
      setBusyType(null);

      if ("error" in response && response.error) {
        setError(response.error);
        return;
      }

      if ("documentId" in response && response.documentId) {
        router.push(`/documents/${response.documentId}`);
      }
    });
  }

  const isBusy = isPending || busyType !== null;

  return (
    <div className="sample-loader-card">
      <div className="sample-loader-header">
        <span className="tag">Quick Demo & Evaluation</span>
        <h3>Don&apos;t have a contract PDF handy?</h3>
        <p className="muted">
          Load a realistic legal agreement fixture in one click to test LexClear&apos;s analysis,
          risk breakdown, and grounded Q&amp;A.
        </p>
      </div>

      <div className="sample-loader-buttons">
        <button
          className="btn secondary"
          type="button"
          disabled={isBusy}
          onClick={() => handleLoad("lease")}
        >
          {busyType === "lease" ? "Analysing lease…" : "⚡ Try Residential Lease (12 mo)"}
        </button>
        <button
          className="btn secondary"
          type="button"
          disabled={isBusy}
          onClick={() => handleLoad("nda")}
        >
          {busyType === "nda" ? "Analysing NDA…" : "⚡ Try Mutual NDA"}
        </button>
      </div>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
