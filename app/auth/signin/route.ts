// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().trim().min(3).max(200).email(),
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = signInSchema.safeParse({ email: form.get("email") });
  const redirectTo = (params: Record<string, string>) => {
    const url = new URL("/login", request.url);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return NextResponse.redirect(url);
  };

  if (!parsed.success) return redirectTo({ error: "invalid-email" });

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: new URL("/dashboard", request.url).toString() },
    });
    if (error) return redirectTo({ error: "send-failed" });
  } catch {
    return redirectTo({ error: "not-configured" });
  }

  return redirectTo({ sent: "1" });
}
