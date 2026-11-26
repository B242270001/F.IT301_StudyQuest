import { test, expect } from "@playwright/test";

// TASK-01 (Lab 5): Dashboard тэмдэглэл frontend → /api/notes → MongoDB end-to-end.
// Backend (`npm run start:grader`, MONGODB_URI тохируулсан) ажиллаж байх ёстой.
test.describe("TASK-01: Dashboard notes integration @integration", () => {
  test("creates a note through POST /api/notes and lists it after reload", async ({ page }) => {
    const content = `Lab5 integration ${Date.now()}`;

    await page.goto("/login");
    await page.getByTestId("login-name-input").fill("anujin");
    await page.getByTestId("login-password-input").fill("student123");
    await page.getByTestId("login-submit-btn").click();
    await expect(page.getByTestId("page-dashboard")).toBeVisible();

    // Өмнөх ажиллуулалтаас үлдсэн тэмдэглэлүүдийг цэвэрлэнэ (3-ын хязгаар)
    await expect(page.getByTestId("notes-loading")).toBeHidden();
    const deleteButtons = page.locator('[data-testid^="delete-note-btn-"]');
    while ((await deleteButtons.count()) > 0) {
      const before = await deleteButtons.count();
      await deleteButtons.first().click();
      await expect(deleteButtons).toHaveCount(before - 1);
    }

    await page.getByTestId("add-note-interactive-btn").click();
    await page.getByTestId("note-textarea").fill(content);

    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("/api/notes") && req.method() === "POST"),
      page.getByTestId("save-note-btn").click(),
    ]);
    expect(request.url()).toContain("/api/notes");
    await expect(page.getByTestId("notes-success")).toBeVisible();
    await expect(page.getByText(content)).toBeVisible();

    // Reload → GET /api/notes-ээс MongoDB дээрх өгөгдөл буцаж ирнэ
    const listResponse = page.waitForResponse(
      (res) => res.url().includes("/api/notes") && res.request().method() === "GET",
    );
    await page.reload();
    expect((await listResponse).status()).toBe(200);
    await expect(page.getByText(content)).toBeVisible();
  });
});

// TASK-01 (Lab 6): бүртгүүлэх → JWT → protected хуудас
test.describe("TASK-01: Register integration @integration @auth", () => {
  test("registers through POST /api/auth/register and lands on the dashboard", async ({ page }) => {
    const username = `e2e.${Date.now()}`;

    await page.goto("/register");
    await page.getByTestId("register-username-input").fill(username);
    await page.getByTestId("register-displayName-input").fill("E2E Хэрэглэгч");
    await page.getByTestId("register-password-input").fill("secret123");
    await page.getByTestId("register-confirm-input").fill("secret123");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/register")),
      page.getByTestId("register-submit-btn").click(),
    ]);
    expect(response.status()).toBe(201);
    expect((await response.json()).token.split(".")).toHaveLength(3);

    await expect(page.getByTestId("page-dashboard")).toBeVisible();
  });

  test("anonymous user cannot open the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
