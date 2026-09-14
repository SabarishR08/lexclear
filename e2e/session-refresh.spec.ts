import { expect, test } from "@playwright/test";
import { SESSION_COOKIE_NAME, sessionCookieValue } from "./support/session";

const setCookie = (response: { headersArray: () => { name: string; value: string }[] }) =>
  response
    .headersArray()
    .filter((header) => header.name.toLowerCase() === "set-cookie")
    .map((header) => header.value)
    .join("\n");

/**
 * The cookie holds `base64-` + base64url(session JSON), so the session has to be
 * decoded before it can be asserted on.
 */
const decodeSessionCookie = (headers: string) => {
  const match = headers.match(/sb-127-auth-token=([^;\s]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  const json = value.startsWith("base64-")
    ? Buffer.from(value.slice("base64-".length), "base64url").toString("utf8")
    : value;
  return JSON.parse(json) as { refresh_token: string; expires_at: number };
};

test.describe("session refresh", () => {
  test("refreshes an expired session on a public page and returns the new cookie", async ({
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: SESSION_COOKIE_NAME, value: sessionCookieValue({ current: false }), url: baseURL! },
    ]);

    const response = await context.request.get("/", { maxRedirects: 0 });

    expect(response.status()).toBe(200);

    // The fake endpoint answers the refresh exchange, so the response must carry
    // a genuinely new session: a different refresh token and a future expiry.
    const issued = decodeSessionCookie(setCookie(response));
    expect(issued).not.toBeNull();
    expect(issued?.refresh_token).toBe("refreshed-refresh-token");
    expect(issued!.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test("refreshes an expired session and renders the signed-in dashboard", async ({
    context,
    page,
    baseURL,
  }) => {
    await context.addCookies([
      { name: SESSION_COOKIE_NAME, value: sessionCookieValue({ current: false }), url: baseURL! },
    ]);

    await page.goto("/dashboard");

    // A failed refresh would have redirected to /login instead.
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Your documents" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("not legal advice");
  });

  test("allows public anonymous access without redirecting to login", async ({ context }) => {
    // No cookie at all, so there is nothing to refresh and the user is anonymous.
    const response = await context.request.get("/dashboard", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });

  test("skips Supabase entirely for an anonymous public page load", async ({ request }) => {
    const response = await request.get("/", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    // Nothing to refresh, so no session cookie is offered.
    expect(setCookie(response)).not.toContain(SESSION_COOKIE_NAME);
  });
});
