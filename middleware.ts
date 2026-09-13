import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/documents", "/compare"];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Supabase session cookies are named `sb-<project-ref>-auth-token`. */
const hasAuthCookie = (request: NextRequest) =>
  request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

/**
 * Server Components cannot write cookies, so this is the only place a Supabase
 * session can be refreshed. It runs on every page (see the matcher below), not
 * just the private ones, because a token that expires while the reader is on a
 * public page would otherwise never be renewed.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Unconfigured deployments still render; the pages show a setup notice.
  if (!url || !anonKey) return response;

  const { pathname } = request.nextUrl;
  const protectedPath = isProtectedPath(pathname);

  // Anonymous visitors on public pages have nothing to refresh, so skip the
  // round-trip to Supabase and keep those page loads cheap.
  if (!protectedPath && !hasAuthCookie(request)) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: ((items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }) satisfies SetAllCookies,
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && protectedPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    const redirect = NextResponse.redirect(loginUrl);
    // A refresh can happen during getUser(), and those Set-Cookie headers must
    // survive the redirect or the renewed session is silently discarded.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  /**
   * Every route except static assets. Narrowing this to the private prefixes
   * would mean signed-in readers on public pages never get a token refresh.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2)$).*)",
  ],
};
