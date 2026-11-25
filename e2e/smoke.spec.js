import { expect, test } from "@playwright/test";
import { ROUTES, openRoute } from "./task06-helpers.js";

// TASK-06 (Lab 3): team-spec.json-ийн route бүр шууд URL-ээр нээгдэж,
// өөрийн page testId-тай, JavaScript runtime алдаагүй render хийнэ.
test.describe("TASK-06: route smoke @smoke", () => {
  for (const route of ROUTES) {
    test(`${route.path} opens with ${route.testId} and no runtime errors`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));

      await openRoute(page, route);

      await expect(page).toHaveURL((url) => url.pathname === (route.landsOn || route.path));
      await expect(page.getByTestId(route.testId).first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});
