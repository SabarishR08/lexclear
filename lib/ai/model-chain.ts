// lib/ai/model-chain.ts
// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>

/**
 * Gemini model chain: primary model is tried first; if it throws (quota,
 * network, timeout) the next model in the chain is tried. All models use the
 * same API key but Gemini's free-tier quota is per-model-per-day, so having
 * a fallback chain is a meaningful reliability improvement.
 *
 * thinkingBudget: 0 is set on all models. Legal document clause extraction
 * is a structured-output task, not an open-ended reasoning task. Disabling
 * thinking tokens reduces latency and per-call token cost.
 */
export const MODEL_CHAIN = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] as const;

export type GeminiModel = (typeof MODEL_CHAIN)[number];

export async function withModelFallback<T>(
  attempt: (model: GeminiModel) => Promise<T>,
  onError?: (model: GeminiModel, error: unknown) => void,
): Promise<T> {
  let lastError: unknown;
  for (const model of MODEL_CHAIN) {
    try {
      return await attempt(model);
    } catch (err) {
      lastError = err;
      onError?.(model, err);
    }
  }
  throw lastError;
}
