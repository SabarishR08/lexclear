import { createServer } from "node:http";

/**
 * Minimal stand-in for Supabase so the signed-in flows can run in CI without a
 * real project. It implements only what the app actually calls:
 *
 *   POST /auth/v1/token?grant_type=refresh_token  -> a fresh session
 *   GET  /auth/v1/user                            -> the user behind a bearer token
 *   GET  /rest/v1/<table>                         -> an empty result set
 *
 * An empty result set is enough for the library page and the upload form, and
 * the upload failure paths return from validation before touching the network.
 */
const PORT = Number(process.env.FAKE_SUPABASE_PORT ?? 54329);

export const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "reader@example.com",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

const accessToken = (secondsFromNow) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: USER.id,
      aud: "authenticated",
      role: "authenticated",
      email: USER.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + secondsFromNow,
    }),
  ).toString("base64url");
  return `${header}.${payload}.fake-signature`;
};

const send = (response, status, body, headers = {}) => {
  response.writeHead(status, { "content-type": "application/json", ...headers });
  response.end(JSON.stringify(body));
};

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;
  const bearer = request.headers.authorization?.replace(/^Bearer /i, "");

  // Readiness probe for the Playwright webServer entry.
  if (path === "/health") return send(response, 200, { ok: true });

  // Token refresh. The auth client calls this when the stored session is inside
  // its expiry margin, and writes whatever comes back through setAll.
  if (path === "/auth/v1/token") {
    if (url.searchParams.get("grant_type") !== "refresh_token") {
      return send(response, 400, { error: "unsupported_grant_type" });
    }
    return send(response, 200, {
      access_token: accessToken(3600),
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "refreshed-refresh-token",
      user: USER,
    });
  }

  if (path === "/auth/v1/user") {
    if (!bearer) return send(response, 401, { message: "missing bearer token" });
    return send(response, 200, USER);
  }

  if (path.startsWith("/rest/v1/")) {
    return send(response, 200, [], { "content-range": "0-0/0" });
  }

  return send(response, 404, { message: `no fake route for ${path}` });
});

server.listen(PORT, "127.0.0.1");
