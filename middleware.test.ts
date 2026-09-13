import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClient } = vi.hoisted(() => ({ createServerClient: vi.fn() }));

vi.mock("@supabase/ssr", () => ({ createServerClient }));

import { middleware } from "./middleware";

const REFRESHED_COOKIE = { name: "sb-127-auth-token", value: "refreshed", options: { path: "/" } };

/**
 * Simulates what the Supabase client does when it exchanges a refresh token:
 * it writes the new session through the `setAll` callback it was handed.
 */
function stubSupabaseClient({ user, refresh }: { user: unknown; refresh: boolean }) {
  createServerClient.mockImplementation(
    (_url: string, _key: string, options: { cookies: { setAll: (items: unknown[]) => void } }) => ({
      auth: {
        getUser: async () => {
          if (refresh) options.cookies.setAll([REFRESHED_COOKIE]);
          return { data: { user } };
        },
      },
    }),
  );
}

const request = (path: string, cookie?: string) =>
  new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: cookie ? { cookie } : undefined,
  });

const setCookieHeaders = (response: Response) => response.headers.getSetCookie?.() ?? [];

beforeEach(() => {
  createServerClient.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54329";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
});

describe("middleware session refresh", () => {
  it("carries the refreshed session cookie onto the sign-in redirect", async () => {
    // The refresh succeeds but the account lookup returns no user, which is the
    // path that previously threw the renewed cookie away.
    stubSupabaseClient({ user: null, refresh: true });

    const response = await middleware(request("/dashboard", "sb-127-auth-token=stale"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    const cookies = setCookieHeaders(response);
    expect(cookies.some((header) => header.includes("refreshed"))).toBe(true);
  });

  it("passes the refreshed cookie through on a normal request", async () => {
    stubSupabaseClient({ user: { id: "user-1" }, refresh: true });

    const response = await middleware(request("/dashboard", "sb-127-auth-token=stale"));

    expect(response.status).toBe(200);
    expect(setCookieHeaders(response).some((header) => header.includes("refreshed"))).toBe(true);
  });

  it("refreshes on public routes too, such as the landing page", async () => {
    stubSupabaseClient({ user: { id: "user-1" }, refresh: true });

    const response = await middleware(request("/", "sb-127-auth-token=stale"));

    expect(createServerClient).toHaveBeenCalledTimes(1);
    expect(setCookieHeaders(response).some((header) => header.includes("refreshed"))).toBe(true);
  });

  it("redirects an anonymous visitor away from a private route", async () => {
    stubSupabaseClient({ user: null, refresh: false });

    const response = await middleware(request("/documents/3f2504e0-4f89-11d3-9a0c-0305e82c3301"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });
});

describe("middleware route matching", () => {
  it("does not protect a sibling route that merely shares a prefix", async () => {
    stubSupabaseClient({ user: null, refresh: false });

    const response = await middleware(request("/documents-archive"));

    expect(response.status).toBe(200);
    // Anonymous and public, so Supabase is never consulted.
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("skips Supabase entirely for an anonymous public page load", async () => {
    const response = await middleware(request("/login"));

    expect(response.status).toBe(200);
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("still protects a nested private route", async () => {
    stubSupabaseClient({ user: null, refresh: false });

    const response = await middleware(request("/compare"));

    expect(response.status).toBe(307);
  });

  it("renders without Supabase when the deployment is unconfigured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const response = await middleware(request("/dashboard"));

    expect(response.status).toBe(200);
    expect(createServerClient).not.toHaveBeenCalled();
  });
});
