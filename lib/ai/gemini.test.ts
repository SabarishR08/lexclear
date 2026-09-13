// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { beforeEach, describe, expect, it, vi } from "vitest";

const { embedContent, getGenerativeModel } = vi.hoisted(() => {
  const embedContent = vi.fn();
  const getGenerativeModel = vi.fn(() => ({ embedContent }));
  return { embedContent, getGenerativeModel };
});

vi.mock("@google/generative-ai", () => ({
  SchemaType: { ARRAY: "ARRAY", OBJECT: "OBJECT", STRING: "STRING" },
  GoogleGenerativeAI: class {
    getGenerativeModel = getGenerativeModel;
  },
}));

import { embedText } from "./gemini";

/**
 * text-embedding-004 was retired and embedContent now returns 404 for it, which
 * broke every upload at the embedding step. These asserts pin the replacement
 * and, more importantly, the 768 width that has to match vector(768) in
 * supabase/schema.sql.
 */
describe("embedText", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    getGenerativeModel.mockClear();
    embedContent.mockReset();
    embedContent.mockResolvedValue({ embedding: { values: Array(768).fill(0.1) } });
  });

  it("uses a currently served embedding model", async () => {
    await embedText("Either party may terminate on thirty days notice.");
    expect(getGenerativeModel).toHaveBeenCalledWith({ model: "gemini-embedding-001" });
  });

  it("requests 768 dimensions so vectors match the vector(768) column", async () => {
    await embedText("Either party may terminate on thirty days notice.");
    expect(embedContent).toHaveBeenCalledTimes(1);
    const request = embedContent.mock.calls[0][0] as {
      content: { parts: { text: string }[] };
      outputDimensionality: number;
    };
    expect(request.outputDimensionality).toBe(768);
    expect(request.content.parts[0].text).toContain("thirty days notice");
  });

  it("returns the raw vector from the response", async () => {
    const vector = await embedText("indemnity");
    expect(vector).toHaveLength(768);
  });
});
