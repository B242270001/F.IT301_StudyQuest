import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../task-01-auth/Dashboard";

const studentUser = {
  id: "U05",
  username: "temuulen",
  displayName: "Б. Тэмүүлэн",
  role: "STUDENT",
  streakDays: 7,
  totalXp: 2480,
  notes: [
    { id: "n1", content: "Анхны тэмдэглэл" },
  ],
};

const teacherUser = {
  id: "U10",
  username: "bagsh",
  displayName: "Д. Батбаяр",
  role: "TEACHER",
  streakDays: 0,
  totalXp: 0,
};

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});

describe("TASK-01: ProtectedRoute (Role Guard)", () => {
  it("renders state-login-required when user is not logged in", () => {
    render(
      <MemoryRouter>
        <ProtectedRoute user={null}>
          <div data-testid="protected-content">Нууц агуулга</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("state-login-required")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children when student accesses general protected page", () => {
    render(
      <MemoryRouter>
        <ProtectedRoute user={studentUser}>
          <div data-testid="protected-content">Оюутны хуудас</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("state-login-required")).not.toBeInTheDocument();
    expect(screen.queryByTestId("state-forbidden")).not.toBeInTheDocument();
  });

  it("renders state-forbidden when student tries to access teacher-only page", () => {
    render(
      <MemoryRouter>
        <ProtectedRoute user={studentUser} requiredRole="TEACHER">
          <div data-testid="teacher-content">Багшийн өрөө</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("state-forbidden")).toBeInTheDocument();
    expect(screen.queryByTestId("teacher-content")).not.toBeInTheDocument();
  });

  it("renders teacher content when teacher accesses teacher-only page", () => {
    render(
      <MemoryRouter>
        <ProtectedRoute user={teacherUser} requiredRole="TEACHER">
          <div data-testid="teacher-content">Багшийн өрөө</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("teacher-content")).toBeInTheDocument();
    expect(screen.queryByTestId("state-forbidden")).not.toBeInTheDocument();
  });
});

describe("TASK-01: Dashboard Role simulation & Note CRUD", () => {
  it("shows room-computer for STUDENT and hides room-board", () => {
    render(
      <MemoryRouter>
        <Dashboard user={studentUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("page-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("room-computer")).toBeInTheDocument();
    expect(screen.queryByTestId("room-board")).not.toBeInTheDocument();
  });

  it("shows room-board for TEACHER and hides room-computer", () => {
    render(
      <MemoryRouter>
        <Dashboard user={teacherUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("page-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("room-board")).toBeInTheDocument();
    expect(screen.queryByTestId("room-computer")).not.toBeInTheDocument();
  });

  it("clicking bed opens logout confirmation modal and confirming calls onLogout", () => {
    const handleLogout = vi.fn();
    render(
      <MemoryRouter>
        <Dashboard user={studentUser} onLogout={handleLogout} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("room-bed"));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("confirm-delete"));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("supports Note CRUD: creates, edits, and deletes sticky notes on dashboard", () => {
    render(
      <MemoryRouter>
        <Dashboard user={studentUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    // READ: existing note
    expect(screen.getByText("Анхны тэмдэглэл")).toBeInTheDocument();

    // CREATE: open modal, write note, save
    fireEvent.click(screen.getByTestId("add-note-interactive-btn"));
    expect(screen.getByTestId("note-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("note-textarea"), {
      target: { value: "Шинэ зорилт: Лаб 3 100%" },
    });
    fireEvent.click(screen.getByTestId("save-note-btn"));

    expect(screen.getByText("Шинэ зорилт: Лаб 3 100%")).toBeInTheDocument();

    // UPDATE: click note to edit
    fireEvent.click(screen.getByText("Шинэ зорилт: Лаб 3 100%"));
    expect(screen.getByTestId("note-modal")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("note-textarea"), {
      target: { value: "Шинэчилсэн зорилт: Лаб 3 бүрэн оноо!" },
    });
    fireEvent.click(screen.getByTestId("save-note-btn"));

    expect(screen.getByText("Шинэчилсэн зорилт: Лаб 3 бүрэн оноо!")).toBeInTheDocument();

    // DELETE: click delete button
    const deleteBtn = screen.getByTestId("delete-note-btn-n1");
    fireEvent.click(deleteBtn);

    expect(screen.queryByText("Анхны тэмдэглэл")).not.toBeInTheDocument();
  });
});
