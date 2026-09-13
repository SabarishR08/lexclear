import { expect, test } from "@playwright/test";
import { SESSION_COOKIE_NAME, sessionCookieValue } from "./support/session";

/**
 * These run against the fake Supabase endpoint, so they need no credentials.
 * The failure paths return from validation before any Gemini call is made.
 */
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: SESSION_COOKIE_NAME, value: sessionCookieValue(), url: baseURL! },
  ]);
});

test.describe("upload validation", () => {
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
