export type TextChunk = { content: string; index: number };
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
