"use server";

import { compareMaterialTerms } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/lib/auth";
import { loadAnalysisForComparison } from "@/lib/documents";
import { takeToken } from "@/lib/rate-limit";
import { compareSchema } from "@/lib/validation";

export async function compareDocuments(documentA: string, documentB: string) {
  const input = compareSchema.safeParse({ documentA, documentB });
  if (!input.success) return { error: "Select two documents to compare." };
  if (input.data.documentA === input.data.documentB) {
    return { error: "Choose two different documents." };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };

  if (!takeToken(`compare:${user.id}`, { capacity: 4, refillPerMinute: 4 })) {
    return { error: "That is a lot of comparisons at once. Try again in a minute." };
  }

  try {
    // Row-level security scopes both lookups to the signed-in user's documents.
    const [first, second] = await Promise.all([
      loadAnalysisForComparison(input.data.documentA),
      loadAnalysisForComparison(input.data.documentB),
    ]);

    if (!first || !second) {
      return { error: "Both documents need a finished analysis before they can be compared." };
    }

    const terms = await compareMaterialTerms(first, second);
    return { terms, titleA: first.title, titleB: second.title };
  } catch {
    return { error: "The comparison could not finish. Please try again." };
  }
}
