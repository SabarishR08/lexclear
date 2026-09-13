// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

import { expect, test } from "@playwright/test";

/**
 * The signed-in upload flow needs a real Supabase session, which a magic-link
 * login cannot provide from a headless test. Export the cookie from a browser
 * that is already signed in to enable this spec:
 *
 *   E2E_SUPABASE_COOKIE_NAME=sb-<project-ref>-auth-token
 *   E2E_SUPABASE_COOKIE_VALUE=<cookie value>
 */
const cookieName = process.env.E2E_SUPABASE_COOKIE_NAME;
const cookieValue = process.env.E2E_SUPABASE_COOKIE_VALUE;
const hasSession = Boolean(cookieName && cookieValue);

test.describe("upload validation", () => {
  test.skip(!hasSession, "Needs a signed-in Supabase session cookie (see the comment above).");

  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([{ name: cookieName!, value: cookieValue!, url: baseURL! }]);
  });

  test("the file input is reachable with the keyboard alone", async ({ page }) => {
    await page.goto("/dashboard");

    let reachedInput = false;
    for (let press = 0; press < 20 && !reachedInput; press += 1) {
      await page.keyboard.press("Tab");
      reachedInput = await page.evaluate(
        () =>
          document.activeElement instanceof HTMLInputElement &&
          document.activeElement.type === "file",
      );
    }

    expect(reachedInput).toBe(true);
  });

  test("a plain text file is rejected before any analysis runs", async ({ page }) => {
    await page.goto("/dashboard");

    await page.setInputFiles('input[type="file"]', {
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("this is not a legal document"),
    });
    await page.getByRole("button", { name: /upload and analyze/i }).click();

    await expect(page.getByRole("status")).toContainText(/PDF or DOCX/i);
  });

  test("a file that merely claims to be a PDF is rejected by the magic-byte check", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.setInputFiles('input[type="file"]', {
      name: "lease.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("I am definitely not a PDF"),
    });
    await page.getByRole("button", { name: /upload and analyze/i }).click();

    await expect(page.getByRole("status")).toContainText(/does not look like a valid PDF or DOCX/i);
  });

  test("a file over 10MB is rejected client-side", async ({ page }) => {
    await page.goto("/dashboard");

    await page.setInputFiles('input[type="file"]', {
      name: "huge-lease.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 0),
    });
    await page.getByRole("button", { name: /upload and analyze/i }).click();

    await expect(page.getByRole("status")).toContainText(/larger than 10MB/i);
  });
});
