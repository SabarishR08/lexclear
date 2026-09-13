"use server";

import mammoth from "mammoth";
import pdf from "pdf-parse";
import { revalidatePath } from "next/cache";
import { analyzeClauses, embedText } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/lib/auth";
import { chunkText, isWithinIndexLimit } from "@/lib/chunking";
import { mapWithConcurrency } from "@/lib/concurrency";
import { detectUploadKind } from "@/lib/files";
import { takeToken } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { uploadSchema } from "@/lib/validation";

/** Keeps a long contract from firing dozens of embedding requests at once. */
const EMBED_CONCURRENCY = 3;

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a PDF or DOCX file." };

  const parsed = uploadSchema.safeParse({ name: file.name, type: file.type, size: file.size });
  if (!parsed.success) return { error: "Use a PDF or DOCX smaller than 10MB." };

  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };

  if (!takeToken(`upload:${user.id}`, { capacity: 4, refillPerMinute: 4 })) {
    return { error: "That is a lot of uploads in a row. Try again in a minute." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // The declared MIME type is client-supplied, so trust the bytes instead.
  const kind = detectUploadKind(buffer);
  if (!kind) {
    return { error: "That file does not look like a valid PDF or DOCX. Try re-exporting it." };
  }

  let rawText: string;
  try {
    rawText =
      kind === "pdf" ? (await pdf(buffer)).text : (await mammoth.extractRawText({ buffer })).value;
  } catch {
    return { error: "We could not read that file. Try re-exporting it." };
  }
  if (!rawText.trim()) {
    return { error: "We could not extract readable text from this file." };
  }
  // Refuse before storing anything: indexing a document this long would fire
  // hundreds of embedding requests and trip the rate limit mid-analysis.
  if (!isWithinIndexLimit(rawText)) {
    return {
      error: "This document is longer than LexClear can analyse in one pass. Try splitting it up.",
    };
  }

  const supabase = await createClient();
  const { data: document, error } = await supabase
    .from("documents")
    .insert({ user_id: user.id, title: file.name, raw_text: rawText, status: "processing" })
    .select("id")
    .single();
  if (error || !document) return { error: "Your document could not be saved." };

  try {
    const chunks = chunkText(rawText);
    const [analysis, embeddings] = await Promise.all([
      analyzeClauses(rawText),
      mapWithConcurrency(chunks, EMBED_CONCURRENCY, (chunk) => embedText(chunk.content)),
    ]);

    await supabase.from("document_analysis").insert(
      analysis.map((item) => ({
        document_id: document.id,
        clause_text: item.clauseText,
        plain_text: item.plainText,
        category: item.category,
        risk_level: item.riskLevel,
        reason: item.reason,
        clause_ref: item.clauseRef,
      })),
    );

    await supabase.from("document_chunks").insert(
      chunks.map((chunk, index) => ({
        document_id: document.id,
        content: chunk.content,
        chunk_index: chunk.index,
        embedding: embeddings[index],
      })),
    );

    await supabase.from("documents").update({ status: "ready" }).eq("id", document.id);
  } catch {
    await supabase.from("documents").update({ status: "failed" }).eq("id", document.id);
    return {
      error: "Analysis could not finish. Check your Gemini configuration and try again.",
    };
  }

  revalidatePath("/dashboard");
  return { success: true as const };
}
