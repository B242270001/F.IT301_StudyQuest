// TASK-06 (Lab 5/6): /achievements хуудас — бодит API-ийн хариуг fetch mock-оор дуурайна.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Achievements from "../task-06-leaderboard/Achievements";
import { generateCode, validateAchievementForm, EMPTY_ACHIEVEMENT } from "../task-06-leaderboard/achievementValidation";

const BADGES = [
  { id: "A01", code: "first-steps", title: "Анхны алхам", description: "Анхны 100 XP", icon: "🌱", type: "XP_TOTAL", threshold: 100, xpReward: 10 },
  { id: "A02", code: "streak-7", title: "Долоо хоногийн цуврал", description: "", icon: "🔥", type: "STREAK", threshold: 7, xpReward: 50 },
];

const student = { id: "U05", role: "STUDENT", displayName: "Б. Тэмүүлэн" };

// Lab 6: GET /api/me/achievements — тэмдэг бүр earned + progress-той
const progress = (current, target) => ({ current, target, percent: Math.min(100, Math.floor((current / target) * 100)), reached: current >= target });
const MINE = [
  { ...BADGES[0], earned: false, awardedAt: null, progress: progress(2480, 100) },
  { ...BADGES[1], earned: true, awardedAt: "2026-11-25T00:00:00Z", progress: progress(7, 7) },
];
const RANKING = [
  { rank: 1, id: "U01", name: "Д. Анужин", xp: 3240 },
  { rank: 4, id: "U05", name: "Б. Тэмүүлэн", xp: 2480 },
];
const TEACHER_ROUTES = {
  "GET /api/achievements": () => json(200, BADGES),
  "GET /api/leaderboard?period=allTime": () => json(200, RANKING),
};
const teacher = { id: "U10", role: "TEACHER", displayName: "Багш Дорж" };

const json = (status, body) => ({ ok: status < 400, status, json: async () => body });

// routes: { "GET /api/achievements": () => response, ... }
function serve(routes) {
  const fetch = vi.fn(async (url, { method = "GET" } = {}) => {
    const handler = routes[`${method} ${url}`];
    if (!handler) throw new Error(`unexpected ${method} ${url}`);
    return handler();
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const calls = (fetch, method) =>
  fetch.mock.calls.filter(([, init = {}]) => (init.method || "GET") === method).map(([url, init]) => [url, init]);

function renderPage(user) {
  return render(
    <MemoryRouter initialEntries={["/achievements"]}>
      <Achievements user={user} />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Achievements (student)", () => {
  it("shows loading, then my badges and progress from GET /api/me/achievements", async () => {
    const fetch = serve({ "GET /api/me/achievements": () => json(200, MINE) });
    renderPage(student);

    expect(screen.getByTestId("achievements-loading")).toBeTruthy();
    expect(await screen.findByTestId("achievements-list")).toBeTruthy();
    expect(screen.getByTestId("achievement-card-A01").getAttribute("data-earned")).toBe("false");
    expect(screen.getByTestId("achievement-card-A01").textContent).toContain("Авах боломжтой");
    expect(screen.getByTestId("achievement-card-A02").getAttribute("data-earned")).toBe("true");
    expect(screen.getByTestId("achievements-earned-count").textContent).toBe("1 / 2 тэмдэг авсан");
    expect(screen.getByTestId("achievement-progress-A01").textContent).toContain("2,480 / 100 XP");
    expect(screen.getByRole("progressbar", { name: "Долоо хоногийн цуврал биелэлт" }).getAttribute("aria-valuenow")).toBe("100");
    expect(screen.getByTestId("achievements-claim-btn").textContent).toBe("Тэмдэг авах (1)");
    expect(screen.queryByTestId("achievement-form")).toBeNull();
    expect(calls(fetch, "GET").map(([url]) => url)).toEqual(["/api/me/achievements"]);
  });

  it("claims reached badges with POST /api/me/achievements/claim", async () => {
    const after = MINE.map((a) => ({ ...a, earned: true }));
    const fetch = serve({
      "GET /api/me/achievements": () => json(200, MINE),
      "POST /api/me/achievements/claim": () => json(200, { awarded: [{ id: "A01", title: "Анхны алхам", icon: "🌱", xpReward: 10 }], achievements: after }),
    });
    renderPage(student);
    fireEvent.click(await screen.findByTestId("achievements-claim-btn"));

    expect((await screen.findByTestId("achievements-success")).textContent).toBe("1 шинэ тэмдэг авлаа: 🌱 Анхны алхам");
    expect(screen.getByTestId("achievements-earned-count").textContent).toBe("2 / 2 тэмдэг авсан");
    expect(calls(fetch, "POST").map(([url]) => url)).toEqual(["/api/me/achievements/claim"]);
  });

  it("asks to log in again when the token is rejected (401)", async () => {
    serve({ "GET /api/me/achievements": () => json(401, { message: "Нэвтрээгүй байна" }) });
    renderPage(student);

    expect((await screen.findByTestId("achievements-error")).textContent).toContain("Дахин нэвтэрнэ үү");
    expect(screen.getByTestId("achievements-login-link").getAttribute("href")).toBe("/login");
  });

  it("shows an error state and recovers on retry", async () => {
    let fail = true;
    serve({
      "GET /api/me/achievements": () => (fail ? json(500, { message: "Серверийн алдаа гарлаа" }) : json(200, MINE)),
    });
    renderPage(student);

    expect((await screen.findByTestId("achievements-error")).textContent).toContain("Серверийн алдаа гарлаа");
    fail = false;
    fireEvent.click(screen.getByTestId("achievements-retry-btn"));
    expect(await screen.findByTestId("achievements-list")).toBeTruthy();
  });

  it("shows an empty state when there are no badges", async () => {
    serve({ "GET /api/me/achievements": () => json(200, []) });
    renderPage(student);
    expect(await screen.findByTestId("achievements-empty")).toBeTruthy();
  });
});

describe("Achievements (teacher)", () => {
  it("blocks an invalid form on the client and sends no POST", async () => {
    const fetch = serve(TEACHER_ROUTES);
    renderPage(teacher);
    await screen.findByTestId("achievements-list");

    fireEvent.change(screen.getByTestId("achievement-threshold-input"), { target: { value: "0" } });
    fireEvent.change(screen.getByTestId("achievement-xp-input"), { target: { value: "5000" } });
    fireEvent.change(screen.getByTestId("achievement-code-input"), { target: { value: "Bad Code" } });
    fireEvent.click(screen.getByTestId("achievement-save-btn"));

    expect(screen.getByTestId("achievement-error-title").textContent).toBe("Тэмдгийн нэр оруулна уу");
    expect(screen.getByTestId("achievement-error-threshold")).toBeTruthy();
    expect(screen.getByTestId("achievement-error-xpReward")).toBeTruthy();
    expect(screen.getByTestId("achievement-error-code")).toBeTruthy();
    expect(calls(fetch, "POST")).toHaveLength(0);
  });

  it("creates a badge with POST /api/achievements and shows it in the list", async () => {
    const created = { ...BADGES[0], id: "A05", code: "streak-30", title: "Сарын цуврал", type: "STREAK", threshold: 30, icon: "📅", xpReward: 200 };
    const fetch = serve({ ...TEACHER_ROUTES, "POST /api/achievements": () => json(201, created) });
    renderPage(teacher);
    await screen.findByTestId("achievements-list");

    fireEvent.change(screen.getByTestId("achievement-title-input"), { target: { value: "Сарын цуврал" } });
    fireEvent.change(screen.getByTestId("achievement-type-select"), { target: { value: "STREAK" } });
    fireEvent.change(screen.getByTestId("achievement-threshold-input"), { target: { value: "30" } });
    fireEvent.change(screen.getByTestId("achievement-xp-input"), { target: { value: "200" } });
    fireEvent.change(screen.getByTestId("achievement-icon-input"), { target: { value: "📅" } });
    fireEvent.click(screen.getByTestId("achievement-save-btn"));

    expect((await screen.findByTestId("achievements-success")).textContent).toContain("Сарын цуврал");
    expect(screen.getByTestId("achievement-card-A05")).toBeTruthy();

    const [[url, init]] = calls(fetch, "POST");
    expect(url).toBe("/api/achievements");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ title: "Сарын цуврал", type: "STREAK", threshold: 30, xpReward: 200, icon: "📅" });
    expect(body.code).toMatch(/^badge-[a-z0-9]+$/);
  });

  it("shows the server's 422 field error next to that field", async () => {
    serve({
      ...TEACHER_ROUTES,
      "POST /api/achievements": () => json(422, { message: "Ийм кодтой тэмдэг аль хэдийн байна", field: "code" }),
    });
    renderPage(teacher);
    await screen.findByTestId("achievements-list");

    fireEvent.change(screen.getByTestId("achievement-title-input"), { target: { value: "Давхар" } });
    fireEvent.change(screen.getByTestId("achievement-threshold-input"), { target: { value: "100" } });
    fireEvent.change(screen.getByTestId("achievement-code-input"), { target: { value: "first-steps" } });
    fireEvent.click(screen.getByTestId("achievement-save-btn"));

    expect((await screen.findByTestId("achievement-error-code")).textContent).toBe("Ийм кодтой тэмдэг аль хэдийн байна");
    expect(screen.queryByTestId("achievements-success")).toBeNull();
  });

  it("edits a badge with PUT and deletes one after confirmation", async () => {
    const fetch = serve({
      ...TEACHER_ROUTES,
      "PUT /api/achievements/A01": () => json(200, { ...BADGES[0], title: "Анхны 100 XP" }),
      "DELETE /api/achievements/A02": () => ({ ok: true, status: 204, json: async () => null }),
    });
    renderPage(teacher);
    await screen.findByTestId("achievements-list");

    fireEvent.click(screen.getByTestId("achievement-edit-A01"));
    const title = screen.getByTestId("achievement-title-input");
    expect(title.value).toBe("Анхны алхам");
    fireEvent.change(title, { target: { value: "Анхны 100 XP" } });
    fireEvent.click(screen.getByTestId("achievement-save-btn"));
    await waitFor(() => expect(within(screen.getByTestId("achievement-card-A01")).getByText("Анхны 100 XP")).toBeTruthy());

    fireEvent.click(screen.getByTestId("achievement-delete-A02"));
    fireEvent.click(screen.getByTestId("confirm-delete"));
    await waitFor(() => expect(screen.queryByTestId("achievement-card-A02")).toBeNull());
    expect(calls(fetch, "DELETE").map(([url]) => url)).toEqual(["/api/achievements/A02"]);
  });

  it("awards a badge to a student and reports a 409 duplicate", async () => {
    let duplicate = false;
    const fetch = serve({
      ...TEACHER_ROUTES,
      "POST /api/achievements/A01/award": () =>
        duplicate
          ? json(409, { message: "Энэ хэрэглэгч уг тэмдгийг аль хэдийн авсан", field: "userId" })
          : json(201, { id: "w1", user: { id: "U05", displayName: "Б. Тэмүүлэн" }, achievement: BADGES[0] }),
    });
    renderPage(teacher);
    await screen.findByTestId("achievements-list");

    const award = () => {
      fireEvent.change(screen.getByTestId("achievement-award-select-A01"), { target: { value: "U05" } });
      fireEvent.click(screen.getByTestId("achievement-award-btn-A01"));
    };
    expect(screen.getByTestId("achievement-award-btn-A01").disabled).toBe(true);
    award();
    expect((await screen.findByTestId("achievements-success")).textContent).toBe("🌱 Анхны алхам → Б. Тэмүүлэн олгогдлоо");
    const [[, init]] = calls(fetch, "POST");
    expect(JSON.parse(init.body)).toEqual({ userId: "U05" });

    duplicate = true;
    award();
    expect((await screen.findByTestId("achievements-action-error")).textContent).toContain("аль хэдийн авсан");
  });

  it("shows the server's 403 message when the teacher role was revoked", async () => {
    serve({ ...TEACHER_ROUTES, "POST /api/achievements": () => json(403, { message: "Энэ үйлдлийг хийх эрх танд байхгүй" }) });
    renderPage(teacher);
    await screen.findByTestId("achievements-list");

    fireEvent.change(screen.getByTestId("achievement-title-input"), { target: { value: "Эрхгүй" } });
    fireEvent.change(screen.getByTestId("achievement-threshold-input"), { target: { value: "10" } });
    fireEvent.click(screen.getByTestId("achievement-save-btn"));
    expect((await screen.findByTestId("achievements-save-error")).textContent).toBe("Энэ үйлдлийг хийх эрх танд байхгүй");
  });
});

describe("achievementValidation", () => {
  it("accepts a valid form and normalises values", () => {
    const { errors, value } = validateAchievementForm({
      ...EMPTY_ACHIEVEMENT,
      code: " Streak-30 ",
      title: " Сарын цуврал ",
      type: "STREAK",
      threshold: "30",
      xpReward: "",
    });
    expect(errors).toEqual({});
    expect(value).toMatchObject({ code: "streak-30", title: "Сарын цуврал", threshold: 30, xpReward: 0 });
  });

  it("applies the per-type threshold range", () => {
    const rank = validateAchievementForm({ ...EMPTY_ACHIEVEMENT, title: "Шилдэг", type: "WEEKLY_RANK", threshold: "51" });
    expect(rank.errors.threshold).toContain("1–50");
    expect(validateAchievementForm({ ...EMPTY_ACHIEVEMENT, title: "Шилдэг", type: "WEEKLY_RANK", threshold: "3" }).value).toBeTruthy();
  });

  it("generates a unique-looking code", () => {
    expect(generateCode(1700000000000)).toBe(`badge-${(1700000000000).toString(36)}`);
  });
});
