import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { describe, expect, it, vi } from "vitest";
import { isRetryableError, parseRetryDelayMs, withRetry } from "./retry";

const fetchError = (status: number, details?: Record<string, unknown>[]) =>
  new GoogleGenerativeAIFetchError(`${status} error`, status, "test", details);

const noSleep = async () => {};

/** The spy is typed so tests can assert on the delay it was asked to wait. */
const sleepSpy = () => vi.fn<(milliseconds: number) => Promise<void>>(noSleep);

describe("isRetryableError", () => {
  it("retries rate limits and transient server faults", () => {
    expect(isRetryableError(fetchError(429))).toBe(true);
    expect(isRetryableError(fetchError(503))).toBe(true);
  });

  it("does not retry a bad request or a bad key", () => {
    expect(isRetryableError(fetchError(400))).toBe(false);
    expect(isRetryableError(fetchError(401))).toBe(false);
    expect(isRetryableError(fetchError(404))).toBe(false);
  });

  it("does not retry a non-HTTP failure", () => {
    expect(isRetryableError(new Error("model returned malformed JSON"))).toBe(false);
  });
});

describe("parseRetryDelayMs", () => {
  it("reads the server's duration hint", () => {
    expect(parseRetryDelayMs(fetchError(429, [{ retryDelay: "37s" }]))).toBe(37_000);
    expect(parseRetryDelayMs(fetchError(429, [{ retryDelay: "1500ms" }]))).toBe(1500);
  });

  it("returns null when there is no usable hint", () => {
    expect(parseRetryDelayMs(fetchError(429))).toBeNull();
    expect(parseRetryDelayMs(fetchError(429, [{ retryDelay: "soon" }]))).toBeNull();
    expect(parseRetryDelayMs(new Error("nope"))).toBeNull();
  });
});

describe("withRetry", () => {
  it("returns the first successful result without sleeping", async () => {
    const sleep = sleepSpy();
    const operation = vi.fn(async () => "ok");

    await expect(withRetry(operation, { sleep })).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries a 503 and then succeeds", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(fetchError(503))
      .mockResolvedValueOnce("recovered");

    await expect(withRetry(operation, { sleep: noSleep })).resolves.toBe("recovered");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("gives up after the configured attempts and rethrows", async () => {
    const operation = vi.fn(async () => {
      throw fetchError(429);
    });

    await expect(withRetry(operation, { attempts: 3, sleep: noSleep })).rejects.toThrow(
      "429 error",
    );
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("does not waste attempts on a permanent error", async () => {
    const operation = vi.fn(async () => {
      throw fetchError(400);
    });

    await expect(withRetry(operation, { sleep: noSleep })).rejects.toThrow("400 error");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("honours the server's retryDelay hint over its own backoff", async () => {
    const sleep = sleepSpy();
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(fetchError(429, [{ retryDelay: "3s" }]))
      .mockResolvedValueOnce("ok");

    await withRetry(operation, { sleep, baseDelayMs: 100 });

    expect(sleep).toHaveBeenCalledWith(3000);
  });

  it("backs off exponentially with jitter when there is no hint", async () => {
    const sleep = sleepSpy();
    const operation = vi.fn(async () => {
      throw fetchError(503);
    });

    // random() = 1 gives the top of the equal-jitter band, so delays are exact.
    await expect(
      withRetry(operation, { attempts: 3, baseDelayMs: 1000, sleep, random: () => 1 }),
    ).rejects.toThrow();

    expect(sleep.mock.calls.map(([milliseconds]) => milliseconds)).toEqual([1000, 2000]);
  });

  it("caps the delay so a request cannot hang indefinitely", async () => {
    const sleep = sleepSpy();
    const operation = vi.fn(async () => {
      throw fetchError(429, [{ retryDelay: "600s" }]);
    });

    await expect(
      withRetry(operation, { attempts: 2, maxDelayMs: 15_000, sleep, random: () => 1 }),
    ).rejects.toThrow();

    expect(sleep).toHaveBeenCalledWith(15_000);
  });
});
