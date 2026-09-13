// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

export type TextChunk = { content: string; index: number };

/**
 * Roughly 100+ pages of plain text. Past this the embedding fan-out runs into
 * the hundreds of requests and the upload starts rate-limiting itself, so it is
 * refused rather than silently analysed in part.
 */
export const MAX_INDEXED_CHARS = 300_000;

export function isWithinIndexLimit(text: string): boolean {
  return text.length <= MAX_INDEXED_CHARS;
}

export function chunkText(text: string, size = 500, overlap = 100): TextChunk[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return [];
  const step = Math.max(1, size - overlap);
  const chunks: TextChunk[] = [];
  for (let start = 0; start < words.length; start += step) {
    const content = words.slice(start, start + size).join(" ");
    if (content) chunks.push({ content, index: chunks.length });
    if (start + size >= words.length) break;
  }
  return chunks;
}
