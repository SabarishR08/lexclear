import { describe, expect, it, vi } from "vitest";
import { withModelFallback, MODEL_CHAIN } from "./model-chain";

describe("model fallback chain", () => {
  it("returns the result of the first model if it succeeds", async () => {
    const attempt = vi.fn().mockResolvedValue("success-output");
    const result = await withModelFallback(attempt);

    expect(result).toBe("success-output");
    expect(attempt).toHaveBeenCalledTimes(1);
    expect(attempt).toHaveBeenCalledWith(MODEL_CHAIN[0]);
  });

  it("falls back to the second model if the first model fails", async () => {
    const errorFirst = new Error("Quota exceeded for primary model");
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(errorFirst)
      .mockResolvedValueOnce("fallback-output");

    const onError = vi.fn();
    const result = await withModelFallback(attempt, onError);

    expect(result).toBe("fallback-output");
    expect(attempt).toHaveBeenCalledTimes(2);
    expect(attempt).toHaveBeenNthCalledWith(1, MODEL_CHAIN[0]);
    expect(attempt).toHaveBeenNthCalledWith(2, MODEL_CHAIN[1]);
    expect(onError).toHaveBeenCalledWith(MODEL_CHAIN[0], errorFirst);
  });

  it("throws the last error if all models in the chain fail", async () => {
    const err = new Error("All models exhausted");
    const attempt = vi.fn().mockRejectedValue(err);
    const onError = vi.fn();

    await expect(withModelFallback(attempt, onError)).rejects.toThrow("All models exhausted");
    expect(attempt).toHaveBeenCalledTimes(MODEL_CHAIN.length);
    expect(onError).toHaveBeenCalledTimes(MODEL_CHAIN.length);
  });
});
