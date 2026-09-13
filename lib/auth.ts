import { createClient } from "@/lib/supabase/server";

/**
 * Supabase may be unconfigured (or briefly unreachable); callers treat that as
 * "signed out" instead of letting the whole page 500.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}
