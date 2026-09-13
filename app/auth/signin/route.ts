import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(request: Request) { const data = await request.formData(); const email = data.get("email"); if (typeof email !== "string") return NextResponse.redirect(new URL("/login", request.url)); const supabase = await createClient(); await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: new URL("/dashboard", request.url).toString() } }); return NextResponse.redirect(new URL("/login?sent=1", request.url)); }
