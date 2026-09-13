import { expect, test } from "@playwright/test";

const PRIVATE_ROUTES = [
  "/dashboard",
  "/compare",
  "/documents/3f2504e0-4f89-11d3-9a0c-0305e82c3301",
];

test.describe("route protection", () => {
  for (const route of PRIVATE_ROUTES) {
    test(`anonymous visitors are sent to the sign-in page from ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByLabel("Email address")).toBeVisible();
    });
  }

  test("public pages stay reachable without a session", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Understand");
  });
});
