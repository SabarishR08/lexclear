"use server";

// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { embedText, groundedAnswer } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/lib/auth";
import { takeToken } from "@/lib/rate-limit";
import { selectRelevantChunks, type RetrievedChunk } from "@/lib/retrieval";
import { createClient } from "@/lib/supabase/server";
import { chatSchema } from "@/lib/validation";

/** Fetch a few extra candidates so the relevance floor still leaves usable context. */
const CANDIDATE_CHUNKS = 8;

export async function askDocument(documentId: string, question: string) {
  const input = chatSchema.safeParse({ documentId, question });
  if (!input.success) return { error: "Please enter a valid question." };

  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };

  if (!takeToken(`ask:${user.id}`, { capacity: 10, refillPerMinute: 10 })) {
    return { error: "That is a lot of questions at once. Try again in a minute." };
  }

  try {
    const supabase = await createClient();
    const embedding = await embedText(input.data.question);

    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: embedding,
      match_document_id: input.data.documentId,
      match_count: CANDIDATE_CHUNKS,
    });
    if (error) return { error: "This document's search index is unavailable right now." };

    // Row-level security already limits these rows to the signed-in user's document.
    const relevant = selectRelevantChunks((data ?? []) as RetrievedChunk[]);
    if (!relevant.length) return { error: "I can't find that in this document." };

    const context = relevant
      .map((chunk) => `[Clause excerpt ${chunk.chunk_index + 1}] ${chunk.content}`)
      .join("\n\n");
    const answer = await groundedAnswer(input.data.question, context);

    await supabase.from("chat_messages").insert([
      { document_id: input.data.documentId, user_id: user.id, role: "user", content: question },
      { document_id: input.data.documentId, user_id: user.id, role: "assistant", content: answer },
    ]);

    return { answer };
  } catch {
    return { error: "That answer could not be generated. Please try again." };
  }
}
