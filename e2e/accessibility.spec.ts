import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("accessibility", () => {
  test("landing page has no detectable WCAG A/AA violations", async ({ page }) => {
    await page.goto("/");

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(violations).toEqual([]);
  });

  test("the non-negotiable disclaimer is visible before any content", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("note").first()).toContainText("not legal advice");
  });

  test("keyboard users can skip straight to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  });

  test("login page is labelled and free of WCAG A/AA violations", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Email address")).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    expect(violations).toEqual([]);
  });
});
