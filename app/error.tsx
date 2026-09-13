"use client";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page login-page" id="main">
      <h1 className="login-title">Something went wrong</h1>
      <p className="lead" role="alert">
        {error.message || "This page could not be loaded."}
      </p>
      <button className="btn" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
