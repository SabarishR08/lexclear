// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { describe, expect, it } from "vitest";
import { isWithinIndexLimit } from "./chunking";
import { SAMPLE_CONTRACTS } from "./fixtures";

describe("SAMPLE_CONTRACTS", () => {
  it("provides valid lease fixture within character indexing limits", () => {
    const lease = SAMPLE_CONTRACTS.lease;
    expect(lease).toBeDefined();
    expect(lease.title).toContain("Residential Lease");
    expect(lease.rawText.length).toBeGreaterThan(500);
    expect(isWithinIndexLimit(lease.rawText)).toBe(true);
    expect(lease.rawText).toContain("SECURITY DEPOSIT");
    expect(lease.rawText).toContain("EARLY TERMINATION");
  });

  it("provides valid NDA fixture within character indexing limits", () => {
    const nda = SAMPLE_CONTRACTS.nda;
    expect(nda).toBeDefined();
    expect(nda.title).toContain("Non-Disclosure Agreement");
    expect(nda.rawText.length).toBeGreaterThan(500);
    expect(isWithinIndexLimit(nda.rawText)).toBe(true);
    expect(nda.rawText).toContain("CONFIDENTIAL INFORMATION");
    expect(nda.rawText).toContain("NON-SOLICITATION");
  });
});
