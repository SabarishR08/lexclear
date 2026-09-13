"use server";
import { createClient } from "@/lib/supabase/server";
import { embedText, groundedAnswer } from "@/lib/ai/gemini";
import { chatSchema } from "@/lib/validation";

export async function askDocument(documentId: string, question: string) {
  const input = chatSchema.safeParse({ documentId, question }); if (!input.success) return { error: "Please enter a valid question." };
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return { error: "Please sign in first." };
  const embedding = await embedText(input.data.question);
  const { data: chunks, error } = await supabase.rpc("match_document_chunks", { query_embedding: embedding, match_document_id: documentId, match_count: 5 });
  if (error || !chunks?.length) return { error: "I can't find that in this document." };
  const context = chunks.map((chunk: { content: string; chunk_index: number }) => `[Clause excerpt ${chunk.chunk_index + 1}] ${chunk.content}`).join("\n\n");
  const answer = await groundedAnswer(input.data.question, context);
  await supabase.from("chat_messages").insert([{ document_id: documentId, user_id: user.id, role: "user", content: question }, { document_id: documentId, user_id: user.id, role: "assistant", content: answer }]);
  return { answer };
}
