// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { beforeEach, describe, expect, it } from "vitest";
import { resetRateLimits, takeToken } from "./rate-limit";

describe("takeToken", () => {
  beforeEach(() => resetRateLimits());

  it("allows calls up to the capacity and then refuses", () => {
    const options = { capacity: 3, refillPerMinute: 3, now: 0 };

    expect(takeToken("user-1", options)).toBe(true);
    expect(takeToken("user-1", options)).toBe(true);
    expect(takeToken("user-1", options)).toBe(true);
    expect(takeToken("user-1", options)).toBe(false);
  });

  it("refills over time", () => {
    const base = { capacity: 2, refillPerMinute: 60, now: 0 };
    takeToken("user-2", base);
    takeToken("user-2", base);
    expect(takeToken("user-2", { ...base, now: 0 })).toBe(false);

    // 60 tokens per minute is one per second.
    expect(takeToken("user-2", { ...base, now: 1_000 })).toBe(true);
  });

  it("tracks each key separately", () => {
    const options = { capacity: 1, refillPerMinute: 1, now: 0 };
    expect(takeToken("user-3", options)).toBe(true);
    expect(takeToken("user-4", options)).toBe(true);
  });

  it("never exceeds the capacity after a long idle period", () => {
    expect(takeToken("user-5", { capacity: 1, refillPerMinute: 60, now: 600_000 })).toBe(true);
    expect(takeToken("user-5", { capacity: 1, refillPerMinute: 60, now: 600_000 })).toBe(false);
  });
});
