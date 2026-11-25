import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Leaderboard from "../task-06-leaderboard/Leaderboard";
import weekly from "../../public/mock/leaderboard-weekly.json";
import allTime from "../../public/mock/leaderboard-allTime.json";

// Lab 5+: чансаа MongoDB-ээс GET /api/leaderboard-аар ирнэ (хариуны хэлбэр mock-той ижил + avatarConfig)
const mockFiles = {
  "/api/leaderboard?period=weekly": weekly,
  "/api/leaderboard?period=allTime": allTime,
};

function serveMock(override) {
  const fetch = vi.fn(async (url) => override?.(url) ?? { ok: true, json: async () => mockFiles[url] });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/leaderboard"]}>
      <Leaderboard user={{ id: "U05", displayName: "Б. Тэмүүлэн" }} />
    </MemoryRouter>,
  );
}

const podium = () => within(screen.getByRole("list", { name: "Шилдэг гурав" })).getAllByRole("listitem");
const myRow = () => screen.getByText("ЧИ").closest("li");

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Leaderboard", () => {
  it("loads the ranking from the backend /api/leaderboard", async () => {
    const fetch = serveMock();
    renderPage();

    expect(await screen.findByTestId("page-leaderboard")).toBeTruthy();
    await screen.findByRole("list", { name: "Шилдэг гурав" });
    expect(fetch.mock.calls.map(([url]) => url).sort()).toEqual(Object.keys(mockFiles).sort());
  });

  it("shows the weekly podium, my row and my progress", async () => {
    serveMock();
    renderPage();

    await screen.findByRole("list", { name: "Шилдэг гурав" });
    expect(podium().map((li) => li.textContent)).toEqual([
      expect.stringContaining("Д. Анужин780 XP"),
      expect.stringContaining("А. Саруул680 XP"),
      expect.stringContaining("Э. Билгүүн610 XP"),
    ]);
    expect(myRow().textContent).toContain("Б. Тэмүүлэн");
    expect(myRow().textContent).toContain("460 XP");
    expect(screen.getByText("Өнгөрсөн долоо хоногоос 3 байр урагшиллаа!")).toBeTruthy();
    expect(screen.getByText(/60 XP цуглуулбал 4-р байрт хүрнэ/)).toBeTruthy();
  });

  it("switches to the all-time ranking", async () => {
    serveMock();
    renderPage();

    const tab = await screen.findByRole("tab", { name: "Бүх цаг" });
    fireEvent.click(tab);

    expect(tab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("НИЙТ XP")).toBeTruthy();
    expect(podium()[0].textContent).toContain("3,240 XP");
    expect(myRow().textContent).toContain("2,480 XP");
  });

  it("shows an error and recovers on retry", async () => {
    let fail = true;
    serveMock(() => (fail ? { ok: false, statusText: "Not Found" } : undefined));
    renderPage();

    expect((await screen.findByRole("alert")).textContent).toContain("Чансааг ачаалж чадсангүй.");
    fail = false;
    fireEvent.click(screen.getByRole("button", { name: "Дахин оролдох" }));

    expect(await screen.findByRole("list", { name: "Шилдэг гурав" })).toBeTruthy();
  });

  it("shows an empty state when nobody is ranked", async () => {
    serveMock(() => ({ ok: true, json: async () => [] }));
    renderPage();

    expect(await screen.findByText("Чансаа бүрдээгүй байна.")).toBeTruthy();
  });

  // TASK-06 (Lab 3): role-based UI — багшид чансаа харагдахгүй
  it("shows state-forbidden to a teacher and never loads the ranking", async () => {
    const fetch = serveMock();
    render(
      <MemoryRouter initialEntries={["/leaderboard"]}>
        <Leaderboard user={{ id: "U10", role: "TEACHER", displayName: "Багш Дорж" }} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("state-forbidden").textContent).toContain("зөвхөн оюутнуудад");
    expect(screen.getByTestId("leaderboard-goto-teacher").getAttribute("href")).toBe("/teacher");
    expect(screen.queryByTestId("leaderboard-podium")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("marks my own row and progress with stable testIds for E2E", async () => {
    serveMock();
    renderPage();

    expect(await screen.findByTestId("leaderboard-podium")).toBeTruthy();
    expect(screen.getByTestId("leaderboard-row-me").textContent).toContain("ЧИ");
    expect(screen.getByTestId("leaderboard-my-progress").textContent).toContain("5");
    fireEvent.click(screen.getByTestId("leaderboard-tab-allTime"));
    expect(screen.getByTestId("leaderboard-tab-allTime").getAttribute("aria-selected")).toBe("true");
  });
});

describe("Leaderboard avatars", () => {
  it("draws each student's own avatar from avatarConfig", async () => {
    const withAvatar = weekly.map((row) =>
      row.id === "U01" ? { ...row, avatarConfig: { ...row.avatarConfig, hairStyle: "bun", outfit: "deel" } } : row,
    );
    serveMock((url) => (url.includes("weekly") ? { ok: true, json: async () => withAvatar } : undefined));
    renderPage();

    await screen.findByRole("list", { name: "Шилдэг гурав" });
    const first = podium()[0].querySelector("svg");
    expect(first.getAttribute("data-hair")).toBe("bun");
    expect(first.getAttribute("data-outfit")).toBe("deel");
    expect(myRow().querySelector("svg")).toBeTruthy();
  });
});
