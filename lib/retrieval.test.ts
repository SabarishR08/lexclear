import { describe, expect, it } from "vitest";
import { cosineSimilarity } from "./retrieval";
describe("cosineSimilarity", () => it("ranks identical vectors highest", () => { expect(cosineSimilarity([1, 0], [1, 0])).toBe(1); expect(cosineSimilarity([1, 0], [0, 1])).toBe(0); }));
