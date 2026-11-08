import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeacherRoom from "../task-04-teacher/TeacherRoom";
import coursesData from "../../public/mock/courses.json";
import usersData from "../../public/mock/users.json";

/* ── Mock fetch ── */
const mockFiles = {
  "/mock/courses.json": coursesData,
  "/mock/users.json": usersData,
};

function serveMock(override) {
  const fetch = vi.fn(async (url) =>
    override?.(url) ?? { ok: true, json: async () => mockFiles[url] }
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const teacher = { id: "U10", displayName: "Д. Батбаяр", role: "TEACHER" };
const onLogout = vi.fn();

function renderPage(user = teacher) {
  return render(
    <MemoryRouter initialEntries={["/teacher"]}>
      <TeacherRoom user={user} onLogout={onLogout} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("TeacherRoom", () => {
  it("renders page-teacher-room", async () => {
    serveMock();
    renderPage();

    expect(screen.getByTestId("page-teacher-room")).toBeTruthy();
  });

  it("shows statistics after loading", async () => {
    serveMock();
    renderPage();

    expect(await screen.findByTestId("stat-courses")).toBeTruthy();
    expect(screen.getByTestId("stat-students")).toBeTruthy();
    expect(screen.getByTestId("stat-avg-score")).toBeTruthy();
    expect(screen.getByTestId("stat-attempts")).toBeTruthy();

    // Verify course count matches mock data
    expect(screen.getByTestId("stat-courses").textContent).toContain(
      String(coursesData.courses.length)
    );
  });

  it("shows course table with data from mock", async () => {
    serveMock();
    renderPage();

    // Wait for courses to load
    const rows = await screen.findAllByTestId("course-row");
    expect(rows).toHaveLength(coursesData.courses.length);

    // First course title is visible (bar chart болон table-д давхардах тул getAllByText)
    expect(screen.getAllByText("Веб систем ба технологи").length).toBeGreaterThan(0);
  });

  it("shows student table with student data", async () => {
    serveMock();
    renderPage();

    // Wait for data to load and find student search
    const searchInput = await screen.findByTestId("student-search");
    expect(searchInput).toBeTruthy();

    // Students from mock data should appear (only STUDENT role)
    const students = usersData.users.filter((u) => u.role === "STUDENT");
    expect(screen.getByText(students[0].displayName)).toBeTruthy();
  });

  it("filters students by search input", async () => {
    serveMock();
    renderPage();

    const searchInput = await screen.findByTestId("student-search");

    // Search for a specific student
    fireEvent.change(searchInput, { target: { value: "Анужин" } });

    // Only the matching student should be visible
    expect(screen.getByText("Д. Анужин")).toBeTruthy();
    expect(screen.queryByText("А. Саруул")).toBeNull();
  });

  it("shows empty state when no courses exist", async () => {
    serveMock((url) => {
      if (url === "/mock/courses.json") {
        return { ok: true, json: async () => ({ courses: [] }) };
      }
      return undefined;
    });
    renderPage();

    expect(await screen.findByTestId("state-empty")).toBeTruthy();
    expect(screen.getAllByText(/Хичээл алга/).length).toBeGreaterThan(0);
  });

  it("delete button triggers window.confirm", async () => {
    serveMock();
    const confirmSpy = vi.fn(() => false);
    vi.stubGlobal("confirm", confirmSpy);
    renderPage();

    const deleteButtons = await screen.findAllByTestId("course-delete-btn");
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith("Энэ хичээлийг устгах уу?");
  });

  it("removes course from table when delete is confirmed", async () => {
    serveMock();
    vi.stubGlobal("confirm", () => true);
    renderPage();

    const rowsBefore = await screen.findAllByTestId("course-row");
    const initialCount = rowsBefore.length;

    fireEvent.click(screen.getAllByTestId("course-delete-btn")[0]);

    // After deletion, one fewer row
    await waitFor(() => {
      const rowsAfter = screen.getAllByTestId("course-row");
      expect(rowsAfter).toHaveLength(initialCount - 1);
    });
  });

  it("shows loading state initially", () => {
    serveMock();
    renderPage();

    expect(screen.getByTestId("state-loading")).toBeTruthy();
  });
});
