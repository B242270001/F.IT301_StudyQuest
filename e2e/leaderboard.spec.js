import { expect, test } from "@playwright/test";
import { loginThroughForm } from "./task06-helpers.js";

// TASK-06 (Lab 3): чансааны role-based UI — team-spec.json `task06-leaderboard-*` scenario.
test.describe("TASK-06: leaderboard role @role", () => {
  test("student sees the podium, own row and progress", async ({ page }) => {
    await loginThroughForm(page, "student");
    await page.goto("/leaderboard");

    await expect(page.getByTestId("page-leaderboard")).toBeVisible();
    await expect(page.getByTestId("leaderboard-podium")).toBeVisible();
    await expect(page.getByTestId("leaderboard-row-me")).toContainText("ЧИ");
    await expect(page.getByTestId("leaderboard-my-progress")).toBeVisible();

    await page.getByTestId("leaderboard-tab-allTime").click();
    await expect(page.getByTestId("leaderboard-tab-allTime")).toHaveAttribute("aria-selected", "true");
  });

  test("teacher gets state-forbidden instead of the ranking", async ({ page }) => {
    await loginThroughForm(page, "teacher");
    await page.goto("/leaderboard");

    await expect(page.getByTestId("state-forbidden")).toBeVisible();
    await expect(page.getByTestId("leaderboard-podium")).toHaveCount(0);
    await page.getByTestId("leaderboard-goto-teacher").click();
    await expect(page.getByTestId("page-teacher-room")).toBeVisible();
  });

  test("anonymous visitor is sent to /login", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
