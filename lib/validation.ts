// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { z } from "zod";

export const uploadSchema = z.object({
  name: z.string().min(1).max(160),
  type: z.enum([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024),
});

export const chatSchema = z.object({
  documentId: z.string().uuid(),
  question: z.string().trim().min(2).max(1000),
});

export const compareSchema = z.object({
  documentA: z.string().uuid(),
  documentB: z.string().uuid(),
});
