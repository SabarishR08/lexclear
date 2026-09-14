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
import type { SupabaseClient } from "@supabase/supabase-js";
import { retrySchema, uploadSchema } from "@/lib/validation";
import { SAMPLE_CONTRACTS, type SampleContractType } from "@/lib/fixtures";

/** Keeps a long contract from firing dozens of embedding requests at once. */
const EMBED_CONCURRENCY = 3;

type Client = SupabaseClient;

const FAILURE_MESSAGE = "Analysis could not finish. Check your Gemini configuration and try again.";

/**
 * The one place a document is turned into analysis and vectors, shared by the
 * upload flow and the retry flow.
 */
async function indexDocument(supabase: Client, documentId: string, rawText: string) {
  const chunks = chunkText(rawText);
  const [analysis, embeddings] = await Promise.all([
    analyzeClauses(rawText),
    mapWithConcurrency(chunks, EMBED_CONCURRENCY, (chunk) => embedText(chunk.content)),
  ]);

  await supabase.from("document_analysis").insert(
    analysis.map((item) => ({
      document_id: documentId,
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
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.index,
      embedding: embeddings[index],
    })),
  );

  await supabase.from("documents").update({ status: "ready" }).eq("id", documentId);
}

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a PDF or DOCX file." };

  const parsed = uploadSchema.safeParse({ name: file.name, type: file.type, size: file.size });
  if (!parsed.success) return { error: "Use a PDF or DOCX smaller than 10MB." };

  const user = await getCurrentUser();
  const actorKey = user ? user.id : "public-guest";

  if (!takeToken(`upload:${actorKey}`, { capacity: 10, refillPerMinute: 10 })) {
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
    .insert({
      user_id: user ? user.id : null,
      title: file.name,
      raw_text: rawText,
      status: "processing",
    })
    .select("id")
    .single();
  if (error || !document) return { error: "Your document could not be saved." };

  try {
    await indexDocument(supabase, document.id, rawText);
  } catch {
    await supabase.from("documents").update({ status: "failed" }).eq("id", document.id);
    return { error: FAILURE_MESSAGE };
  }

  revalidatePath("/dashboard");
  return { success: true as const, documentId: document.id };
}

/**
 * Re-runs analysis for a document whose text is already stored, so a transient
 * Gemini failure or a rate limit does not force the reader to upload again.
 */
export async function retryAnalysis(documentId: string) {
  const parsed = retrySchema.safeParse({ documentId });
  if (!parsed.success) return { error: "That document could not be found." };

  const user = await getCurrentUser();
  const actorKey = user ? user.id : "public-guest";

  if (!takeToken(`upload:${actorKey}`, { capacity: 10, refillPerMinute: 10 })) {
    return { error: "That is a lot of analysis runs in a row. Try again in a minute." };
  }

  const supabase = await createClient();
  const { data: document } = await supabase
    .from("documents")
    .select("id,raw_text")
    .eq("id", documentId)
    .maybeSingle();

  const rawText = document?.raw_text;
  if (typeof rawText !== "string" || !rawText.trim()) {
    return { error: "That document has no stored text to analyse." };
  }

  // Clear anything the failed run left behind, so a retry cannot duplicate rows.
  await supabase.from("document_analysis").delete().eq("document_id", documentId);
  await supabase.from("document_chunks").delete().eq("document_id", documentId);
  await supabase.from("documents").update({ status: "processing" }).eq("id", documentId);

  try {
    await indexDocument(supabase, documentId, rawText);
  } catch {
    await supabase.from("documents").update({ status: "failed" }).eq("id", documentId);
    return { error: FAILURE_MESSAGE };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/documents/${documentId}`);
  return { success: true as const };
}

/**
 * Loads a curated legal agreement fixture so evaluators or demo viewers
 * can test LexClear without uploading their own PDF/DOCX.
 */
export async function loadSampleAgreement(type: SampleContractType) {
  const sample = SAMPLE_CONTRACTS[type];
  if (!sample) return { error: "Unknown sample document type." };

  const user = await getCurrentUser();
  const actorKey = user ? user.id : "public-guest";

  if (!takeToken(`upload:${actorKey}`, { capacity: 10, refillPerMinute: 10 })) {
    return { error: "Too many actions in a row. Try again in a moment." };
  }

  const supabase = await createClient();
  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      user_id: user ? user.id : null,
      title: sample.title,
      raw_text: sample.rawText,
      status: "processing",
    })
    .select("id")
    .single();

  if (error || !document) return { error: "Could not create sample document." };

  try {
    await indexDocument(supabase, document.id, sample.rawText);
  } catch {
    await supabase.from("documents").update({ status: "failed" }).eq("id", document.id);
    return { error: FAILURE_MESSAGE };
  }

  revalidatePath("/dashboard");
  return { success: true as const, documentId: document.id };
}
