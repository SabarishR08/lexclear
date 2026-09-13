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
 * Calibrated against gemini-embedding-001 (768 dimensions), measured over 9
 * answerable questions and 27 unrelated query/clause pairs of legal text:
 *
 *   relevant  0.672 - 0.788
 *   irrelevant 0.369 - 0.640
 *
 * A floor of 0.5 let 17 of those 27 irrelevant pairs through; 0.6 admits 2 and
 * still misses none of the relevant ones, so it is the strictest value that
 * keeps real answers reachable. Chunks below the floor are dropped so the chat
 * can refuse honestly instead of answering from an irrelevant passage.
 * Re-measure this if the embedding model changes again.
 */
export const DEFAULT_RELEVANCE_THRESHOLD = 0.6;

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
