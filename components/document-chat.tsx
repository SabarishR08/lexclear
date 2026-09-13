"use client";

import { useId, useState, useTransition } from "react";
import { askDocument } from "@/app/documents/[id]/actions";
import { InlineDisclaimer } from "@/components/disclaimer";

export function DocumentChat({ documentId }: { documentId: string }) {
  const inputId = useId();
  const statusId = useId();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<{ kind: "answer" | "error"; text: string } | null>(null);
  const [busy, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < 2) {
      setResult({ kind: "error", text: "Please enter a question about this document." });
      return;
    }
    startTransition(async () => {
      const response = await askDocument(documentId, trimmed);
      if (response.error) {
        setResult({ kind: "error", text: response.error });
        return;
      }
      setResult({ kind: "answer", text: response.answer ?? "" });
    });
  }

  return (
    <section className="panel" aria-labelledby="chat-heading">
      <h2 id="chat-heading">Ask this document</h2>
      <p className="muted">
        Answers are grounded only in retrieved text from this document and cite the clauses they
        came from.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId}>Your question</label>
        <textarea
          id={inputId}
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="How much notice do I need to give?"
          aria-describedby={statusId}
          minLength={2}
          maxLength={1000}
          required
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Searching…" : "Ask LexClear"}
        </button>
      </form>
      <div id={statusId} role="status" aria-live="polite">
        {result ? (
          <div className={result.kind === "error" ? "error" : "answer"}>
            {/* The disclaimer is rendered here, not requested from the model. */}
            {result.kind === "answer" ? <InlineDisclaimer /> : null}
            <p>{result.text}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
