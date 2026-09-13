// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

export type RetrievedChunk = {
  content: string;
  chunk_index: number;
  similarity: number;
};

/**
 * text-embedding-004 cosine similarity for genuinely related legal text lands
 * around 0.65-0.85, while unrelated passages cluster near 0.3-0.5. Chunks below
 * this floor are dropped so the chat can refuse honestly instead of answering
 * from an irrelevant passage.
 */
export const DEFAULT_RELEVANCE_THRESHOLD = 0.5;

export function selectRelevantChunks(
  chunks: RetrievedChunk[],
  threshold: number = DEFAULT_RELEVANCE_THRESHOLD,
  limit = 5,
): RetrievedChunk[] {
  return chunks
    .filter((chunk) => Number.isFinite(chunk.similarity) && chunk.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
