// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { GoogleGenerativeAIFetchError } from "@google/generative-ai";

/** Quota/rate limits and transient server faults are worth another attempt. */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const defaultSleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export type RetryOptions = {
  /** Total attempts, including the first one. */
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Injected in tests so the suite never actually waits. */
  sleep?: (milliseconds: number) => Promise<void>;
  random?: () => number;
};

/**
 * Only HTTP-level failures are retried. A malformed response or a schema
 * mismatch is deterministic, so repeating it just burns quota.
 */
export function isRetryableError(error: unknown): boolean {
  return (
    error instanceof GoogleGenerativeAIFetchError &&
    typeof error.status === "number" &&
    RETRYABLE_STATUSES.has(error.status)
  );
}

/**
 * Gemini reports its own backoff in the error details as a duration string such
 * as "37s" (or occasionally "1500ms"). Honouring the server's number beats
 * guessing at a backoff curve.
 */
export function parseRetryDelayMs(error: unknown): number | null {
  if (!(error instanceof GoogleGenerativeAIFetchError)) return null;

  for (const detail of error.errorDetails ?? []) {
    const hint = detail["retryDelay"];
    if (typeof hint !== "string") continue;

    const match = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(hint.trim());
    if (!match) continue;

    const value = Number(match[1]);
    if (!Number.isFinite(value)) continue;

    return Math.round(match[2] === "s" ? value * 1000 : value);
  }

  return null;
}

/**
 * Equal jitter: half the backoff plus a random fraction of the other half. It
 * overlaps the retry windows of concurrent workers instead of letting them
 * fire in lockstep and re-trip the same limit.
 */
function jitteredDelay(backoffMs: number, random: () => number): number {
  const half = backoffMs / 2;
  return Math.round(half + random() * half);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    attempts = 4,
    baseDelayMs = 800,
    maxDelayMs = 15_000,
    sleep = defaultSleep,
    random = Math.random,
  } = options;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts || !isRetryableError(error)) throw error;

      const serverHint = parseRetryDelayMs(error);
      const backoffMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const delayMs =
        serverHint === null ? jitteredDelay(backoffMs, random) : Math.min(serverHint, maxDelayMs);

      await sleep(delayMs);
    }
  }
}
