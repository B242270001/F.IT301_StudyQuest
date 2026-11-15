import { test, expect } from "@playwright/test";

test.describe("Frontend validation scenarios @validation", () => {
  test("shows login-name-error and login-password-error when submitted empty", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-submit-btn").click();

    await expect(page.getByTestId("login-name-error")).toBeVisible();
    await expect(page.getByTestId("login-name-error")).toHaveTextContent("Оюутны код эсвэл нэрээ оруулна уу");
    await expect(page.getByTestId("login-password-error")).toBeVisible();
    await expect(page.getByTestId("login-password-error")).toHaveTextContent("Нууц үгээ оруулна уу");
  });

  test("shows login-error message on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-name-input").fill("nonexistent_user");
    await page.getByTestId("login-password-input").fill("wrongpassword");
    await page.getByTestId("login-submit-btn").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
  });
});
