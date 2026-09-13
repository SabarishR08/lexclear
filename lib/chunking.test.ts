// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { MAX_INDEXED_CHARS, chunkText, isWithinIndexLimit } from "./chunking";

describe("chunkText", () => {
  it("splits text with overlap", () => {
    const text = Array.from({ length: 800 }, (_, index) => `word${index}`).join(" ");
    const chunks = chunkText(text, 500, 100);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].content).toContain("word499");
    expect(chunks[1].content).toContain("word400");
  });

  it("returns nothing for whitespace-only input", () => {
    expect(chunkText("   \n  ")).toEqual([]);
  });

  it("numbers the chunks in order", () => {
    const text = Array.from({ length: 1200 }, (_, index) => `word${index}`).join(" ");

    expect(chunkText(text, 500, 100).map((chunk) => chunk.index)).toEqual([0, 1, 2]);
  });
});

describe("isWithinIndexLimit", () => {
  it("accepts a document at exactly the limit", () => {
    expect(isWithinIndexLimit("a".repeat(MAX_INDEXED_CHARS))).toBe(true);
  });

  it("refuses a document past the limit", () => {
    expect(isWithinIndexLimit("a".repeat(MAX_INDEXED_CHARS + 1))).toBe(false);
  });
});
