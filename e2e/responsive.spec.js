import { expect, test } from "@playwright/test";
import { ROUTES, openRoute, routeName } from "./task06-helpers.js";

// TASK-06 (Lab 3): route бүр 375px (mobile) болон 1440px (desktop) өргөнд хэвтээ overflow-гүй.
const VIEWPORTS = [
  ["mobile", 375, 740],
  ["desktop", 1440, 900],
];

for (const [device, width, height] of VIEWPORTS) {
  test.describe(`TASK-06: ${device} ${width}px has no horizontal overflow @responsive`, () => {
    test.use({ viewport: { width, height } });

    for (const route of ROUTES) {
      test(routeName(route), async ({ page }) => {
        await openRoute(page, route);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${route.path} is ${overflow}px wider than the ${width}px screen`).toBeLessThanOrEqual(0);
      });
    }
  });
}
