"use client";

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
