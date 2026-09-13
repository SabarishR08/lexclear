/**
 * Builds the cookie @supabase/ssr expects to find.
 *
 * The name is derived by supabase-js from the project URL:
 * `sb-${hostname.split(".")[0]}-auth-token`, so the fake endpoint at
 * http://127.0.0.1:54329 yields `sb-127-auth-token`. The value is
 * `base64-` + base64url(JSON) because createServerClient defaults to
 * cookieEncoding "base64url".
 */
export const SESSION_COOKIE_NAME = "sb-127-auth-token";

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "reader@example.com",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

const accessToken = (expiresAt: number) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: USER.id, aud: "authenticated", exp: expiresAt }),
  ).toString("base64url");
  return `${header}.${payload}.fake-signature`;
};

/**
 * @param current Whether the access token should still be valid. When false the
 *   session sits inside the client's expiry margin, which is what triggers the
 *   refresh exchange through the middleware.
 */
export function sessionCookieValue({ current = true }: { current?: boolean } = {}) {
  const expiresAt = Math.floor(Date.now() / 1000) + (current ? 3600 : -3600);
  const session = {
    access_token: accessToken(expiresAt),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: "initial-refresh-token",
    user: USER,
  };
  return `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}
