// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08

import { expect, test } from "@playwright/test";

const PUBLIC_EVALUATION_ROUTES = ["/", "/dashboard", "/compare"];

test.describe("zero-barrier public access", () => {
  for (const route of PUBLIC_EVALUATION_ROUTES) {
    test(`visitors and evaluators can access ${route} without an auth wall`, async ({ page }) => {
      await page.goto(route);
      expect(page.url()).not.toContain("/login");
    });
  }

  test("landing page has clear call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Understand");
  });
});
