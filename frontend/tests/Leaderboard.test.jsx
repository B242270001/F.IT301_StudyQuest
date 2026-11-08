import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Leaderboard from "../task-06-leaderboard/Leaderboard";
import weekly from "../../public/mock/leaderboard-weekly.json";
import allTime from "../../public/mock/leaderboard-allTime.json";

const mockFiles = {
  "/mock/leaderboard-weekly.json": weekly,
  "/mock/leaderboard-allTime.json": allTime,
};

function serveMock(override) {
  const fetch = vi.fn(async (url) => override?.(url) ?? { ok: true, json: async () => mockFiles[url] });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/leaderboard"]}>
      <Leaderboard />
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
  it("loads only the mock files, never the backend /api", async () => {
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
});
