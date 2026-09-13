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

/**
 * Splits text into prompt-sized batches, preferring a paragraph or sentence
 * boundary near the limit so a batch does not start mid-clause. Clause analysis
 * runs one Gemini call per batch, so the whole document is covered rather than
 * only the opening 45,000 characters.
 */
export function splitIntoBatches(text: string, maxChars: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxChars) return [trimmed];

  const batches: string[] = [];
  let cursor = 0;

  while (cursor < trimmed.length) {
    let end = Math.min(cursor + maxChars, trimmed.length);

    if (end < trimmed.length) {
      const window = trimmed.slice(cursor, end);
      const boundary = Math.max(
        window.lastIndexOf("\n\n"),
        window.lastIndexOf(". "),
        window.lastIndexOf("? "),
      );
      // Only accept a boundary that keeps most of the batch, otherwise a long
      // unbroken run of text would produce tiny batches.
      if (boundary > maxChars / 2) end = cursor + boundary + 1;
    }

    const batch = trimmed.slice(cursor, end).trim();
    if (batch) batches.push(batch);
    cursor = end;
  }

  return batches;
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
