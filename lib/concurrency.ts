/**
 * Runs `worker` over `items` with at most `limit` requests in flight. Embedding
 * every chunk through an unbounded Promise.all is the fastest way to trip a
 * Gemini rate limit on a long contract.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runner = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  };

  const runners = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, runner);
  await Promise.all(runners);

  return results;
}
