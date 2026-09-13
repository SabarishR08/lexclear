// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { chatSchema, compareSchema, uploadSchema } from "./validation";

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOCUMENT_ID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("uploadSchema", () => {
  it("accepts a PDF under the 10MB cap", () => {
    expect(uploadSchema.safeParse({ name: "lease.pdf", type: PDF, size: 1024 }).success).toBe(true);
  });

  it("accepts a DOCX", () => {
    expect(uploadSchema.safeParse({ name: "nda.docx", type: DOCX, size: 2048 }).success).toBe(true);
  });

  it("rejects a plain text file", () => {
    expect(
      uploadSchema.safeParse({ name: "notes.txt", type: "text/plain", size: 10 }).success,
    ).toBe(false);
  });

  it("rejects a file larger than 10MB", () => {
    const tooBig = 10 * 1024 * 1024 + 1;
    expect(uploadSchema.safeParse({ name: "lease.pdf", type: PDF, size: tooBig }).success).toBe(
      false,
    );
  });

  it("rejects an empty file", () => {
    expect(uploadSchema.safeParse({ name: "lease.pdf", type: PDF, size: 0 }).success).toBe(false);
  });
});

describe("chatSchema", () => {
  it("trims the question and enforces a minimum length", () => {
    expect(chatSchema.safeParse({ documentId: DOCUMENT_ID, question: "  ok?  " }).success).toBe(
      true,
    );
    expect(chatSchema.safeParse({ documentId: DOCUMENT_ID, question: " " }).success).toBe(false);
  });

  it("rejects a non-uuid document id", () => {
    expect(chatSchema.safeParse({ documentId: "not-a-uuid", question: "hi" }).success).toBe(false);
  });

  it("rejects an over-long question", () => {
    const question = "a".repeat(1001);
    expect(chatSchema.safeParse({ documentId: DOCUMENT_ID, question }).success).toBe(false);
  });
});

describe("compareSchema", () => {
  it("requires two uuid document ids", () => {
    expect(
      compareSchema.safeParse({ documentA: DOCUMENT_ID, documentB: DOCUMENT_ID }).success,
    ).toBe(true);
    expect(compareSchema.safeParse({ documentA: DOCUMENT_ID, documentB: "nope" }).success).toBe(
      false,
    );
  });
});
