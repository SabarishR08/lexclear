"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/app/dashboard/actions";
import { DISCLAIMER } from "@/lib/disclaimer";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function validateFile(file: File): string | null {
  if (file.size > MAX_BYTES) return "That file is larger than 10MB.";
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "Choose a PDF or DOCX file.";
  }
  return null;
}

export function UploadForm() {
  const router = useRouter();
  const inputId = useId();
  const statusId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get("file");

    if (!(file instanceof File) || file.size === 0) {
      setMessage({ kind: "error", text: "Choose a PDF or DOCX file." });
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setMessage({ kind: "error", text: validationError });
      return;
    }

    const payload = new FormData(form);
    startTransition(async () => {
      const result = await uploadDocument(payload);
      if (result.error) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setMessage({ kind: "ok", text: "Your document is ready to review." });
      setFileName(null);
      form.reset();
      if ("documentId" in result && result.documentId) {
        router.push(`/documents/${result.documentId}`);
      }
    });
  }

  return (
    <form className="upload" onSubmit={handleSubmit} encType="multipart/form-data">
      <label className="upload-drop" htmlFor={inputId}>
        <strong>Choose a PDF or DOCX to review</strong>
        <span className="muted">Maximum 10MB. Text is sent to Gemini for analysis.</span>
      </label>
      <input
        id={inputId}
        // Visually hidden rather than display:none, so it stays in the tab order.
        className="visually-hidden"
        type="file"
        name="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        aria-describedby={statusId}
        onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
      />
      {fileName ? <p className="muted">Selected: {fileName}</p> : null}
      <div className="upload-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Analyzing…" : "Upload and analyze"}
        </button>
      </div>
      <p
        id={statusId}
        className={message?.kind === "error" ? "error" : "muted"}
        role="status"
        aria-live="polite"
      >
        {message?.text ?? DISCLAIMER}
      </p>
    </form>
  );
}
