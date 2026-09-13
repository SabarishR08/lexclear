// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { detectUploadKind } from "./files";

describe("detectUploadKind", () => {
  it("recognises a PDF from its header", () => {
    expect(detectUploadKind(Buffer.from("%PDF-1.7\nrest of file"))).toBe("pdf");
  });

  it("recognises a DOCX as a zip package containing Word parts", () => {
    const docx = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from("padding"),
      Buffer.from("word/document.xml"),
    ]);

    expect(detectUploadKind(docx)).toBe("docx");
  });

  it("rejects a text file renamed to .pdf", () => {
    expect(detectUploadKind(Buffer.from("just some plain text, not a document"))).toBeNull();
  });

  it("rejects a plain zip that is not an OOXML package", () => {
    const zip = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.from("assets/logo.png"),
    ]);

    expect(detectUploadKind(zip)).toBeNull();
  });

  it("rejects an empty buffer", () => {
    expect(detectUploadKind(Buffer.alloc(0))).toBeNull();
  });
});
