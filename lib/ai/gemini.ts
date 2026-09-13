import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import type { ClauseAnalysis } from "@/lib/types";

const disclaimer =
  "LexClear provides general information, not legal advice. Consult a licensed attorney for your specific situation.";

const CHAT_MODEL = "gemini-2.5-flash";
// text-embedding-004 returns 768-dimension vectors, matching document_chunks.embedding.
const EMBEDDING_MODEL = "text-embedding-004";

const client = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenerativeAI(key);
};

const clauseSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      clauseText: { type: SchemaType.STRING },
      plainText: { type: SchemaType.STRING },
      category: { type: SchemaType.STRING },
      riskLevel: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["favorable", "neutral", "risky", "needs-attention"],
      },
      reason: { type: SchemaType.STRING },
      clauseRef: { type: SchemaType.STRING },
    },
    required: ["clauseText", "plainText", "category", "riskLevel", "reason", "clauseRef"],
  },
};

export async function analyzeClauses(text: string): Promise<ClauseAnalysis[]> {
  const model = client().getGenerativeModel({ model: CHAT_MODEL });
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this legal document as general information only. Split important clauses; explain in grade-8 English; never give a legal conclusion. ${disclaimer}\n\nDOCUMENT:\n${text.slice(0, 45000)}`,
          },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json", responseSchema: clauseSchema },
  });
  return JSON.parse(result.response.text()) as ClauseAnalysis[];
}

export async function embedText(content: string) {
  const model = client().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({ content: { role: "user", parts: [{ text: content }] } });
  return result.embedding.values;
}

export async function groundedAnswer(question: string, context: string) {
  const model = client().getGenerativeModel({ model: CHAT_MODEL });
  const result = await model.generateContent(
    `Answer ONLY using the retrieved document excerpts below. If the answer is absent, say "I can't find that in this document." Cite relevant clause labels in brackets. Do not offer legal advice. Start with: ${disclaimer}\n\nEXCERPTS:\n${context}\n\nQUESTION: ${question}`,
  );
  return result.response.text();
}
