import { expect, test } from "@playwright/test";
import { loginAs, loginThroughForm } from "./task06-helpers.js";

// TASK-06 (Lab 5): Тэмдэг — frontend → /api/achievements → MongoDB end-to-end.
// Backend (`npm run start:grader`, MONGODB_URI тохируулсан) ажиллаж байх ёстой.
// TASK-06 (Lab 6): JWT-ээр хамгаалсан бичих үйлдэл (401/403), өөрийн хүрээний /api/me/achievements.

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
});

test.describe("TASK-06: achievements auth @auth @integration", () => {
  test("student loads own progress from GET /api/me/achievements and claims reached badges", async ({ page }) => {
    await loginThroughForm(page, "student");
    const mine = page.waitForResponse((res) => new URL(res.url()).pathname === "/api/me/achievements");
    await page.goto("/achievements");
    const response = await mine;
    expect(response.status()).toBe(200);
    expect(response.request().headers().authorization).toMatch(/^Bearer .+\..+\..+$/);

    await expect(page.getByTestId("achievement-progress-A01")).toBeVisible();
    await expect(page.getByTestId("achievement-form")).toHaveCount(0);

    const [claim] = await Promise.all([
      page.waitForResponse((res) => new URL(res.url()).pathname === "/api/me/achievements/claim"),
      page.getByTestId("achievements-claim-btn").click(),
    ]);
    expect(claim.status()).toBe(200);
    // Анх удаа бол шинэ тэмдэг, дахин ажиллуулахад "шинэ тэмдэг алга" мэдэгдэл
    await expect(page.getByTestId("achievements-success").or(page.getByTestId("achievements-info"))).toBeVisible();
    // temuulen: 2480 XP, 7 өдрийн цуврал → A01, A02 авсан төлөвт
    await expect(page.getByTestId("achievement-card-A01")).toHaveAttribute("data-earned", "true");
    await expect(page.getByTestId("achievement-card-A02")).toHaveAttribute("data-earned", "true");
  });

  test("anonymous gets 401 and a student gets 403 on teacher-only endpoints", async ({ page }) => {
    const badge = { title: "Хууль бус", type: "XP_TOTAL", threshold: 10, code: `e2e-forbidden-${Date.now()}` };
    const anonymous = await page.request.post("/api/achievements", { data: badge });
    expect(anonymous.status()).toBe(401);
    expect((await page.request.get("/api/me/achievements")).status()).toBe(401);

    const { token } = await loginAs(page, "student");
    const headers = { Authorization: `Bearer ${token}` };
    expect((await page.request.post("/api/achievements", { data: badge, headers })).status()).toBe(403);
    expect((await page.request.delete("/api/achievements/A01", { headers })).status()).toBe(403);
    expect((await page.request.get("/api/achievements/A01")).status()).toBe(200);
  });

  test("teacher awards a badge to a student through the UI (POST /award → 201)", async ({ page }) => {
    const { token } = await loginAs(page, "teacher");
    const headers = { Authorization: `Bearer ${token}` };
    const created = await page.request.post("/api/achievements", {
      headers,
      data: { title: `Олгох тест ${Date.now()}`, type: "STREAK", threshold: 3, code: `e2e-award-${Date.now()}` },
    });
    expect(created.status()).toBe(201);
    const { id, title } = await created.json();

    await openAchievements(page);
    await page.getByTestId(`achievement-award-select-${id}`).selectOption("U04");
    const [awarded] = await Promise.all([
      page.waitForResponse((res) => new URL(res.url()).pathname === `/api/achievements/${id}/award`),
      page.getByTestId(`achievement-award-btn-${id}`).click(),
    ]);
    expect(awarded.status()).toBe(201);
    await expect(page.getByTestId("achievements-success")).toContainText(title);

    const holders = await page.request.get(`/api/achievements/user/U04`);
    expect((await holders.json()).some((a) => a.achievement.id === id)).toBe(true);
    expect((await page.request.delete(`/api/achievements/${id}`, { headers })).status()).toBe(204);
  });

  test("anonymous visitor is sent to /login", async ({ page }) => {
    await page.goto("/achievements");
    await expect(page).toHaveURL(/\/login/);
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
