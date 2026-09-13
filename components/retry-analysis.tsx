"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { retryAnalysis } from "@/app/dashboard/actions";

export function RetryAnalysis({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, startTransition] = useTransition();

  return (
    <div className="retry">
      <p className="error" role="alert">
        Analysis did not finish for this document. The extracted text is saved, so you can retry
        without uploading it again.
      </p>
      <button
        className="btn"
        type="button"
        disabled={busy}
        onClick={() =>
          startTransition(async () => {
            const result = await retryAnalysis(documentId);
            if (result.error) {
              setMessage({ kind: "error", text: result.error });
              return;
            }
            setMessage({ kind: "ok", text: "Analysis finished. Showing the clause guide." });
            router.refresh();
          })
        }
      >
        {busy ? "Re-analysing…" : "Retry analysis"}
      </button>
      <p className={message?.kind === "error" ? "error" : "muted"} role="status" aria-live="polite">
        {message?.text ?? ""}
      </p>
    </div>
  );
}
