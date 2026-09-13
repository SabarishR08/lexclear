// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const errorMessage =
    error === "invalid-email"
      ? "Enter a valid email address."
      : error === "not-configured"
        ? "Sign-in is not configured for this deployment yet."
        : error
          ? "We could not send that sign-in link. Please try again."
          : null;

  return (
    <main className="page login-page" id="main">
      <Link className="brand" href="/">
        Lex<span>Clear</span>
      </Link>
      <div className="panel">
        <h1 className="login-title">Welcome</h1>
        <p className="muted">
          Sign in with Supabase to keep your documents private and accessible. We email you a
          one-time link, so there is no password to store.
        </p>

        {sent ? (
          <p className="notice-inline" role="status">
            Check your inbox for the sign-in link.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form action="/auth/signin" method="post">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-describedby="email-hint"
          />
          <p id="email-hint" className="muted">
            Used only for authentication.
          </p>
          <button className="btn" type="submit">
            Send magic link
          </button>
        </form>

        <p className="muted">Google sign-in can be enabled in your Supabase project.</p>
      </div>
    </main>
  );
}
