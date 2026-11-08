import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LectureDetail from "../task-05-explore/LectureDetail";
import lectures from "../../public/mock/lectures.json";
import topics from "../../public/mock/topics.json";
import courses from "../../public/mock/courses.json";
import topicProgress from "../../public/mock/topic-progress.json";

const mockFiles = {
  "/mock/lectures.json": lectures,
  "/mock/topics.json": topics,
  "/mock/courses.json": courses,
  "/mock/topic-progress.json": topicProgress,
};

const student = { id: "U05", displayName: "Б. Тэмүүлэн", role: "STUDENT", totalXp: 2480, streakDays: 7, avatar: "Т" };
const teacher = { id: "U10", displayName: "Багш Батбаяр", role: "TEACHER" };

function serveMock(override) {
  const fetch = vi.fn(async (url) => override?.(url) ?? { ok: true, json: async () => mockFiles[url] });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

function renderPage(user = student, path = "/explore/lecture/L05") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/explore/lecture/:id" element={<LectureDetail user={user} />} />
        <Route path="/topics/:courseId" element={<p>Сэдвийн жагсаалт</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

// Node 25-ийн өөрийн (ажиллагаагүй) localStorage нь jsdom-ынхыг дардаг тул санах ойн хувилбар ашиглана
function memoryStorage() {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  };
}

const topicLink = (name) => screen.getByRole("link", { name: new RegExp(name) });
const storedLecture = (id) => JSON.parse(localStorage.getItem("studyquest.lectures")).find((l) => l.id === id);

beforeEach(() => vi.stubGlobal("localStorage", memoryStorage()));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("LectureDetail", () => {
  it("shows the lecture, its course topics with progress, and no teacher controls for a student", async () => {
    serveMock();
    renderPage();

    expect(await screen.findByRole("heading", { level: 1, name: "React Components" })).toBeTruthy();
    expect(screen.getByTestId("page-lecture")).toBeTruthy();
    expect(screen.getByText("3 / 6 сэдэв дууссан")).toBeTruthy();
    expect(topicLink("Client-Server").dataset.status).toBe("DONE");
    expect(topicLink("React Components").getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("App.jsx")).toBeTruthy();
    expect(screen.queryByTestId("lecture-edit-btn")).toBeNull();
    expect(screen.queryByTestId("lecture-delete-btn")).toBeNull();
  });

  it("shows state-not-found for an unknown lecture id", async () => {
    serveMock();
    renderPage(student, "/explore/lecture/NOPE");

    expect(await screen.findByTestId("state-not-found")).toBeTruthy();
    expect(screen.getByTestId("page-lecture")).toBeTruthy();
  });

  it("shows state-error when loading fails and recovers on retry", async () => {
    let fail = true;
    serveMock(() => (fail ? { ok: false, statusText: "Server error" } : undefined));
    renderPage();

    const error = await screen.findByTestId("state-error");
    fail = false;
    fireEvent.click(within(error).getByRole("button", { name: "Дахин оролдох" }));
    expect(await screen.findByRole("heading", { level: 1, name: "React Components" })).toBeTruthy();
  });

  it("marks the topic DONE only after the knowledge check is answered correctly", async () => {
    serveMock();
    renderPage();
    await screen.findByTestId("kc-question-0");

    fireEvent.click(screen.getByTestId("kc-submit"));
    expect(await screen.findByText("Бүх асуултад хариулна уу.")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: /Хурд нэмэхийн тулд/ }));
    fireEvent.click(screen.getByTestId("kc-submit"));
    expect(await screen.findByText(/0 \/ 1 зөв/)).toBeTruthy();
    expect(topicLink("React Components").dataset.status).toBe("NOT_STARTED");

    fireEvent.click(screen.getByRole("radio", { name: /HTML tag-аас ялгахын тулд/ }));
    fireEvent.click(screen.getByTestId("kc-submit"));
    expect(await screen.findByText("Бүх хариулт зөв! Сэдэв дууссан.")).toBeTruthy();
    expect(topicLink("React Components").dataset.status).toBe("DONE");
    expect(screen.getByText("4 / 6 сэдэв дууссан")).toBeTruthy();

    const saved = JSON.parse(localStorage.getItem("studyquest.topicProgress")).find((p) => p.topicId === "TP05");
    expect(saved).toMatchObject({ userId: "U05", status: "DONE" });
  });

  it("plays the render steps App → Header → Content, instantly when reduced motion is preferred", async () => {
    serveMock();
    renderPage();
    const render = await screen.findByTestId("lecture-render");

    fireEvent.click(render);
    expect(render.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelectorAll(".lec-step.is-pending")).toHaveLength(3);

    fireEvent.click(render);
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    fireEvent.click(render);
    expect(screen.getAllByRole("listitem").filter((li) => li.classList.contains("lec-step"))).toHaveLength(3);
    expect(document.querySelectorAll(".lec-step.is-pending")).toHaveLength(0);
  });

  it("lets a teacher edit the lecture with validation, without the student check", async () => {
    serveMock();
    renderPage(teacher);

    fireEvent.click(await screen.findByTestId("lecture-edit-btn"));
    expect(screen.queryByTestId("kc-submit")).toBeNull();

    fireEvent.change(screen.getByTestId("lecture-title-input"), { target: { value: " " } });
    fireEvent.change(screen.getByTestId("lecture-content-input"), { target: { value: "" } });
    fireEvent.click(screen.getByTestId("lecture-save"));
    expect(await screen.findByText("Лекцийн гарчиг оруулна уу")).toBeTruthy();
    expect(screen.getByText("Лекцийн агуулга оруулна уу")).toBeTruthy();
    expect(storedLecture("L05").title).toBe("React Components");

    fireEvent.change(screen.getByTestId("lecture-title-input"), { target: { value: "React компонент" } });
    fireEvent.change(screen.getByTestId("lecture-content-input"), { target: { value: "Шинэ агуулга" } });
    fireEvent.click(screen.getByTestId("lecture-save"));
    expect(await screen.findByRole("heading", { level: 1, name: "React компонент" })).toBeTruthy();
    expect(storedLecture("L05")).toMatchObject({ title: "React компонент", content: "Шинэ агуулга" });
  });

  it("asks for confirmation before a teacher deletes the lecture", async () => {
    serveMock();
    renderPage(teacher);

    fireEvent.click(await screen.findByTestId("lecture-delete-btn"));
    fireEvent.click(within(screen.getByTestId("confirm-dialog")).getByTestId("confirm-cancel"));
    expect(screen.queryByTestId("confirm-dialog")).toBeNull();
    expect(storedLecture("L05")).toBeTruthy();

    fireEvent.click(screen.getByTestId("lecture-delete-btn"));
    fireEvent.click(screen.getByTestId("confirm-delete"));
    expect(await screen.findByText("Сэдвийн жагсаалт")).toBeTruthy();
    expect(storedLecture("L05")).toBeUndefined();
  });
});
