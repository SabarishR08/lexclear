"use server";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { revalidatePath } from "next/cache";
import { chunkText } from "@/lib/chunking";
import { analyzeClauses, embedText } from "@/lib/ai/gemini";
import { uploadSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file"); if (!(file instanceof File)) return { error: "Choose a PDF or DOCX file." };
  const parsed = uploadSchema.safeParse({ name: file.name, type: file.type, size: file.size }); if (!parsed.success) return { error: "Use a PDF or DOCX smaller than 10MB." };
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: "Please sign in first." };
  const buffer = Buffer.from(await file.arrayBuffer()); let rawText = "";
  if (file.type === "application/pdf") rawText = (await pdf(buffer)).text; else rawText = (await mammoth.extractRawText({ buffer })).value;
  if (!rawText.trim()) return { error: "We couldn't extract readable text from this file." };
  const { data: document, error } = await supabase.from("documents").insert({ user_id: user.id, title: file.name, raw_text: rawText, status: "processing" }).select("id").single(); if (error || !document) return { error: "Your document could not be saved." };
  try { const [analysis, chunks] = await Promise.all([analyzeClauses(rawText), Promise.all(chunkText(rawText).map(async (chunk) => ({ ...chunk, embedding: await embedText(chunk.content) })))]);
    await supabase.from("document_analysis").insert(analysis.map((item) => ({ document_id: document.id, ...item })));
    await supabase.from("document_chunks").insert(chunks.map((chunk) => ({ document_id: document.id, content: chunk.content, chunk_index: chunk.index, embedding: chunk.embedding })));
    await supabase.from("documents").update({ status: "ready" }).eq("id", document.id);
  } catch { await supabase.from("documents").update({ status: "failed" }).eq("id", document.id); return { error: "Analysis could not finish. Check your Gemini configuration and try again." }; }
  revalidatePath("/dashboard"); return { success: true };
}
