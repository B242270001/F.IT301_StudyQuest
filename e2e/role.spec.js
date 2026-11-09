import { test, expect } from "@playwright/test";

test.describe("TASK-01: Role simulation and access control @role", () => {
  test("student logs in and views student-specific room-computer on dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-name-input").fill("temuulen");
    await page.getByTestId("login-password-input").fill("student123");
    await page.getByTestId("login-submit-btn").click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("page-dashboard")).toBeVisible();
    await expect(page.getByTestId("room-computer")).toBeVisible();
    await expect(page.getByTestId("room-board")).not.toBeVisible();
  });

  test("teacher logs in and redirects to /teacher with teacher capabilities", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-name-input").fill("bagsh");
    await page.getByTestId("login-password-input").fill("teacher123");
    await page.getByTestId("login-submit-btn").click();

    await expect(page).toHaveURL(/\/teacher/);
    await expect(page.getByTestId("page-teacher-room")).toBeVisible();
  });

  test("student trying to access protected teacher route sees state-forbidden", async ({ page }) => {
    // 1. Login as student
    await page.goto("/login");
    await page.getByTestId("login-name-input").fill("temuulen");
    await page.getByTestId("login-password-input").fill("student123");
    await page.getByTestId("login-submit-btn").click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Direct navigate to /teacher
    await page.goto("/teacher");
    await expect(page.getByTestId("state-forbidden")).toBeVisible();
  });

  test("bed button opens logout confirmation modal and logs user out", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-name-input").fill("temuulen");
    await page.getByTestId("login-password-input").fill("student123");
    await page.getByTestId("login-submit-btn").click();
    await expect(page.getByTestId("page-dashboard")).toBeVisible();

    await page.getByTestId("room-bed").click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    await page.getByTestId("confirm-delete").click();
    await expect(page).toHaveURL(/\/login/);
  });
});
