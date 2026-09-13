"use client";

import { useId, useState, useTransition } from "react";
import { compareDocuments } from "@/app/compare/actions";
import { InlineDisclaimer } from "@/components/disclaimer";
import { RiskBadge } from "@/components/risk-badge";
import type { DocumentRecord, MaterialTermComparison } from "@/lib/types";

type ComparisonResult = {
  terms: MaterialTermComparison[];
  titleA: string;
  titleB: string;
};

export function CompareForm({ documents }: { documents: DocumentRecord[] }) {
  const firstId = useId();
  const secondId = useId();
  const statusId = useId();
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const documentA = String(data.get("documentA") ?? "");
    const documentB = String(data.get("documentB") ?? "");

    startTransition(async () => {
      setError(null);
      setResult(null);
      const response = await compareDocuments(documentA, documentB);
      if (response.error) {
        setError(response.error);
        return;
      }
      setResult({
        terms: response.terms ?? [],
        titleA: response.titleA ?? "",
        titleB: response.titleB ?? "",
      });
    });
  }

  return (
    <>
      <form className="panel compare-form" onSubmit={handleSubmit}>
        <div className="compare-fields">
          <div>
            <label htmlFor={firstId}>First document</label>
            <select id={firstId} name="documentA" defaultValue={documents[0]?.id ?? ""} required>
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={secondId}>Second document</label>
            <select
              id={secondId}
              name="documentB"
              defaultValue={documents[1]?.id ?? documents[0]?.id ?? ""}
              required
            >
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Comparing…" : "Compare material terms"}
        </button>
        <p id={statusId} className={error ? "error" : "muted"} role="status" aria-live="polite">
          {error ?? "Gemini compares payment, deposit, notice, penalties, term and liability."}
        </p>
      </form>

      {result ? (
        <section className="panel" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading">Material terms</h2>
          <InlineDisclaimer />
          <table className="compare-table">
            <caption>
              {result.titleA} compared with {result.titleB}
            </caption>
            <thead>
              <tr>
                <th scope="col">Term</th>
                <th scope="col">{result.titleA}</th>
                <th scope="col">{result.titleB}</th>
                <th scope="col">Practical difference</th>
              </tr>
            </thead>
            <tbody>
              {result.terms.map((term, index) => (
                <tr key={`${term.term}-${index}`}>
                  <th scope="row">
                    {term.term}
                    <RiskBadge level={term.riskLevel} />
                  </th>
                  <td>{term.documentA}</td>
                  <td>{term.documentB}</td>
                  <td>{term.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </>
  );
}
