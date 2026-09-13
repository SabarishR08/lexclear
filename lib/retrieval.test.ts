import { describe, expect, it } from "vitest";
import { DEFAULT_RELEVANCE_THRESHOLD, selectRelevantChunks } from "./retrieval";

const chunk = (chunk_index: number, similarity: number) => ({
  content: `chunk ${chunk_index}`,
  chunk_index,
  similarity,
});

describe("selectRelevantChunks", () => {
  it("drops chunks below the relevance floor", () => {
    const selected = selectRelevantChunks([chunk(0, 0.81), chunk(1, 0.44), chunk(2, 0.2)]);

    expect(selected.map((item) => item.chunk_index)).toEqual([0]);
  });

  it("orders the strongest matches first and caps the result", () => {
    const selected = selectRelevantChunks(
      [chunk(0, 0.6), chunk(1, 0.92), chunk(2, 0.75), chunk(3, 0.99)],
      DEFAULT_RELEVANCE_THRESHOLD,
      2,
    );

    expect(selected.map((item) => item.chunk_index)).toEqual([3, 1]);
  });

  it("returns nothing when every candidate is weak, so the chat can refuse", () => {
    expect(selectRelevantChunks([chunk(0, 0.3), chunk(1, 0.12)])).toEqual([]);
  });

  it("ignores non-finite similarity scores", () => {
    expect(selectRelevantChunks([chunk(0, Number.NaN), chunk(1, 0.8)])).toHaveLength(1);
  });
});
