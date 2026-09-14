import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClient } = vi.hoisted(() => ({ createServerClient: vi.fn() }));

vi.mock("@supabase/ssr", () => ({ createServerClient }));

import { middleware } from "./middleware";

const REFRESHED_COOKIE = { name: "sb-127-auth-token", value: "refreshed", options: { path: "/" } };

function stubSupabaseClient({ user }: { user: unknown }) {
  createServerClient.mockImplementation(
    (_url: string, _key: string, options: { cookies: { setAll: (items: unknown[]) => void } }) => ({
      auth: {
        getUser: async () => {
          options.cookies.setAll([REFRESHED_COOKIE]);
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

describe("middleware public access and session handling", () => {
  it("allows anonymous access to /dashboard without redirect", async () => {
    const response = await middleware(request("/dashboard"));
    expect(response.status).toBe(200);
  });

  it("allows anonymous access to /documents/[id] without redirect", async () => {
    const response = await middleware(request("/documents/3f2504e0-4f89-11d3-9a0c-0305e82c3301"));
    expect(response.status).toBe(200);
  });

  it("passes refreshed cookies through when session cookie exists", async () => {
    stubSupabaseClient({ user: { id: "user-1" } });
    const response = await middleware(request("/dashboard", "sb-127-auth-token=stale"));
    expect(response.status).toBe(200);
    expect(setCookieHeaders(response).some((header) => header.includes("refreshed"))).toBe(true);
  });
});
