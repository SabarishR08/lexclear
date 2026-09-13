// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { MAX_INDEXED_CHARS, chunkText, isWithinIndexLimit, splitIntoBatches } from "./chunking";

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

describe("splitIntoBatches", () => {
  it("returns the whole document as one batch when it fits", () => {
    expect(splitIntoBatches("A short lease.", 45_000)).toEqual(["A short lease."]);
  });

  it("returns nothing for blank input", () => {
    expect(splitIntoBatches("   \n ", 45_000)).toEqual([]);
  });

  it("splits a long document so every batch is within the limit", () => {
    const text = `First clause. ${"filler ".repeat(400)}`;
    const batches = splitIntoBatches(text, 500);

    expect(batches.length).toBeGreaterThan(1);
    batches.forEach((batch) => expect(batch.length).toBeLessThanOrEqual(500));
  });

  it("loses no text when splitting", () => {
    const text = Array.from({ length: 400 }, (_, index) => `Clause ${index} applies.`).join(" ");
    const batches = splitIntoBatches(text, 1000);

    const rejoined = batches.join(" ").replace(/\s+/g, " ").trim();
    expect(rejoined).toBe(text.replace(/\s+/g, " ").trim());
  });

  it("prefers a paragraph boundary so batches do not start mid-clause", () => {
    const paragraph = "x".repeat(600);
    const text = `${paragraph}\n\n${paragraph}\n\n${paragraph}`;
    const batches = splitIntoBatches(text, 1000);

    expect(batches[0].length).toBe(600);
    expect(batches[0].includes("\n\n")).toBe(false);
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
