import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;

const supabasePort = Number(process.env.FAKE_SUPABASE_PORT ?? 54329);
const supabaseUrl = `http://127.0.0.1:${supabasePort}`;

export default defineConfig({
  testDir: "./e2e",
  // The dev server compiles routes on first request, so allow for a cold start.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Stands in for Supabase so the signed-in flows run without credentials.
      command: "node e2e/support/fake-supabase.mjs",
      url: `${supabaseUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { FAKE_SUPABASE_PORT: String(supabasePort) },
    },
    {
      command: `npm run dev -- --port ${port}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        // Always the fake endpoint, so the suite is deterministic and needs no secrets.
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-anon-key",
      },
    },
  ],
});
