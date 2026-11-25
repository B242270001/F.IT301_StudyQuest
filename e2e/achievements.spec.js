import { expect, test } from "@playwright/test";
import { loginThroughForm } from "./task06-helpers.js";

// TASK-06 (Lab 5): Тэмдэг — frontend → /api/achievements → MongoDB end-to-end.
// Backend (`npm run start:grader`, MONGODB_URI тохируулсан) ажиллаж байх ёстой.

const isAchievementsCall = (method) => (req) =>
  new URL(req.url()).pathname.startsWith("/api/achievements") && req.method() === method;

async function openAchievements(page) {
  const listResponse = page.waitForResponse(
    (res) => new URL(res.url()).pathname === "/api/achievements" && res.request().method() === "GET",
  );
  await page.goto("/achievements");
  expect((await listResponse).status()).toBe(200);
  await expect(page.getByTestId("achievements-list")).toBeVisible();
}

test.describe("TASK-06: achievements integration @integration", () => {
  test("teacher creates a badge through POST /api/achievements, it survives a reload, then deletes it", async ({ page }) => {
    const title = `E2E тэмдэг ${Date.now()}`;
    await loginThroughForm(page, "teacher");
    await openAchievements(page);

    await page.getByTestId("achievement-title-input").fill(title);
    await page.getByTestId("achievement-type-select").selectOption("STREAK");
    await page.getByTestId("achievement-threshold-input").fill("14");
    await page.getByTestId("achievement-xp-input").fill("70");

    const [request] = await Promise.all([
      page.waitForRequest(isAchievementsCall("POST")),
      page.getByTestId("achievement-save-btn").click(),
    ]);
    const response = await request.response();
    expect(response.status()).toBe(201);
    const { id } = await response.json();

    await expect(page.getByTestId("achievements-success")).toContainText(title);
    await expect(page.getByTestId(`achievement-card-${id}`)).toContainText(title);

    // Reload → GET /api/achievements-ээс MongoDB дээрх өгөгдөл буцаж ирнэ
    await page.reload();
    await expect(page.getByTestId(`achievement-card-${id}`)).toContainText(title);

    // Цэвэрлэгээ: UI-аар устгана (DELETE → 204)
    await page.getByTestId(`achievement-delete-${id}`).click();
    const [deleted] = await Promise.all([
      page.waitForResponse((res) => isAchievementsCall("DELETE")(res.request())),
      page.getByTestId("confirm-delete").click(),
    ]);
    expect(deleted.status()).toBe(204);
    await expect(page.getByTestId(`achievement-card-${id}`)).toHaveCount(0);
  });

  test("student sees all badges and their own earned state from the API", async ({ page }) => {
    await loginThroughForm(page, "student");
    const mine = page.waitForResponse((res) => new URL(res.url()).pathname.startsWith("/api/achievements/"));
    await openAchievements(page);
    expect((await mine).status()).toBe(200);

    await expect(page.getByTestId("achievement-card-A01")).toBeVisible();
    await expect(page.getByTestId("achievements-earned-count")).toContainText("тэмдэг авсан");
    await expect(page.getByTestId("achievement-form")).toHaveCount(0);
  });
});

test.describe("TASK-06: achievements validation @validation", () => {
  test("an empty title shows a field error and sends no POST", async ({ page }) => {
    const posts = [];
    page.on("request", (req) => isAchievementsCall("POST")(req) && posts.push(req.url()));

    await loginThroughForm(page, "teacher");
    await openAchievements(page);
    await page.getByTestId("achievement-threshold-input").fill("0");
    await page.getByTestId("achievement-save-btn").click();

    await expect(page.getByTestId("achievement-error-title")).toBeVisible();
    await expect(page.getByTestId("achievement-error-threshold")).toBeVisible();
    expect(posts).toEqual([]);
  });
});
