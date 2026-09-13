import { describe, expect, it } from "vitest";
import { chunkText } from "./chunking";
describe("chunkText", () => { it("splits text with overlap", () => { const text = Array.from({ length: 800 }, (_, i) => `word${i}`).join(" "); const chunks = chunkText(text, 500, 100); expect(chunks).toHaveLength(2); expect(chunks[0].content).toContain("word499"); expect(chunks[1].content).toContain("word400"); }); });
