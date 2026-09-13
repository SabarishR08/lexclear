"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useId, useState, useTransition } from "react";
import { askDocument } from "@/app/documents/[id]/actions";
import { InlineDisclaimer } from "@/components/disclaimer";

const SUGGESTED_QUESTIONS = [
  "What are the notice requirements to terminate or cancel?",
  "What are the payment and late fee terms?",
  "What obligations or liability do I take on?",
  "What happens to the deposit or confidential information?",
];

export function DocumentChat({ documentId }: { documentId: string }) {
  const inputId = useId();
  const statusId = useId();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<{ kind: "answer" | "error"; text: string } | null>(null);
  const [busy, startTransition] = useTransition();

  function submitQuestion(text: string) {
    const trimmed = text.trim();
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  function handlePromptClick(prompt: string) {
    setQuestion(prompt);
    submitQuestion(prompt);
  }

  return (
    <section className="panel" aria-labelledby="chat-heading">
      <h2 id="chat-heading">Ask this document</h2>
      <p className="muted">
        Answers are grounded only in retrieved text from this document and cite the clauses they
        came from.
      </p>

      <div className="chat-suggestions" role="group" aria-label="Suggested questions">
        <span className="suggestions-label">Try asking:</span>
        <div className="suggestion-chips">
          {SUGGESTED_QUESTIONS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chip-btn"
              disabled={busy}
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

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
