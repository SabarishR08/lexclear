import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const store = await cookies();

  // Server Components cannot write cookies, so the write is best-effort: session
  // refreshes happen in middleware and route handlers instead.
  const setAll: SetAllCookies = (items) => {
    try {
      items.forEach(({ name, value, options }) => store.set(name, value, options));
    } catch {
      /* Read-only cookie store (Server Component render). */
    }
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => store.getAll(), setAll } },
  );
}
