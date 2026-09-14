// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08

import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Server Components cannot write cookies, so this is where a Supabase
 * session can be refreshed if present.
 * NOTE: LexClear enables public instant evaluation—no routes are gated behind mandatory login.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

  if (!hasAuthCookie) return response;

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

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2)$).*)",
  ],
};
