import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

// Lab 5: Dashboard тэмдэглэл бодит /api/notes-руу хүсэлт илгээдэг тул fetch-ийг жижиг fake backend-ээр орлуулна.
function serveNotesApi(initial = [{ id: "n1", content: "Анхны тэмдэглэл" }], { failList = false } = {}) {
  let notes = initial.map((n) => ({ ...n }));
  let seq = 100;
  const json = (status, body) => ({ ok: status < 400, status, json: async () => body });
  const fetchMock = vi.fn(async (url, options = {}) => {
    const path = String(url);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    if (path === "/api/notes" && method === "GET") {
      return failList ? json(500, { message: "Серверийн алдаа гарлаа" }) : json(200, notes.map((n) => ({ ...n })));
    }
    if (path === "/api/notes" && method === "POST") {
      const note = { id: `n${seq++}`, content: body.content };
      notes.push(note);
      return json(201, note);
    }
    const id = path.split("/").pop();
    if (method === "PUT") {
      notes = notes.map((n) => (n.id === id ? { ...n, content: body.content } : n));
      return json(200, notes.find((n) => n.id === id));
    }
    if (method === "DELETE") {
      notes = notes.filter((n) => n.id !== id);
      return { ok: true, status: 204, json: async () => null };
    }
    return json(404, {});
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderDashboard(onLogout = vi.fn()) {
  sessionStorage.setItem("studyquest.currentUser", JSON.stringify({ ...studentUser, token: "tok-test" }));
  return render(
    <MemoryRouter>
      <Dashboard user={studentUser} onLogout={onLogout} />
    </MemoryRouter>
  );
}

describe("TASK-01: Dashboard Role simulation & Note CRUD", () => {
  it("shows room-computer on dashboard", () => {
    serveNotesApi();
    renderDashboard();
    expect(screen.getByTestId("room-computer")).toBeInTheDocument();
  });

  it("clicking bed opens logout confirmation modal and confirming calls onLogout", () => {
    serveNotesApi();
    const handleLogout = vi.fn();
    renderDashboard(handleLogout);

    fireEvent.click(screen.getByTestId("room-bed"));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("confirm-delete"));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("loads notes from GET /api/notes with a loading state and Bearer token", async () => {
    const fetchMock = serveNotesApi();
    renderDashboard();

    expect(screen.getByTestId("notes-loading")).toBeInTheDocument();
    expect(await screen.findByText("Анхны тэмдэглэл")).toBeInTheDocument();
    expect(screen.queryByTestId("notes-loading")).not.toBeInTheDocument();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/notes");
    expect(options.headers.Authorization).toBe("Bearer tok-test");
  });

  it("shows notes-error with retry when the API fails", async () => {
    serveNotesApi([], { failList: true });
    renderDashboard();

    expect(await screen.findByTestId("notes-error")).toHaveTextContent("Серверийн алдаа гарлаа");
    expect(screen.getByTestId("notes-retry-btn")).toBeInTheDocument();
  });

  it("supports Note CRUD through /api/notes: creates, edits, and deletes sticky notes", async () => {
    const fetchMock = serveNotesApi();
    renderDashboard();

    // READ
    expect(await screen.findByText("Анхны тэмдэглэл")).toBeInTheDocument();

    // CREATE → POST /api/notes
    fireEvent.click(screen.getByTestId("add-note-interactive-btn"));
    expect(screen.getByTestId("note-modal")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("note-textarea"), {
      target: { value: "Шинэ зорилт: Лаб 5 100%" },
    });
    fireEvent.click(screen.getByTestId("save-note-btn"));
    // Modal хаагдтал хүлээнэ (textarea-ийн текстийг note гэж андуурахгүйн тулд)
    await waitFor(() => expect(screen.queryByTestId("note-modal")).not.toBeInTheDocument());

    expect(screen.getByText("Шинэ зорилт: Лаб 5 100%")).toBeInTheDocument();
    expect(screen.getByTestId("notes-success")).toHaveTextContent("хадгалагдлаа");
    expect(fetchMock).toHaveBeenCalledWith("/api/notes", expect.objectContaining({ method: "POST" }));

    // UPDATE → PUT /api/notes/:id
    fireEvent.click(screen.getByText("Шинэ зорилт: Лаб 5 100%"));
    fireEvent.change(screen.getByTestId("note-textarea"), {
      target: { value: "Шинэчилсэн зорилт: Лаб 5 бүрэн оноо!" },
    });
    fireEvent.click(screen.getByTestId("save-note-btn"));
    await waitFor(() => expect(screen.queryByTestId("note-modal")).not.toBeInTheDocument());
    expect(screen.getByText("Шинэчилсэн зорилт: Лаб 5 бүрэн оноо!")).toBeInTheDocument();

    // DELETE → DELETE /api/notes/n1
    fireEvent.click(screen.getByTestId("delete-note-btn-n1"));
    await waitFor(() => {
      expect(screen.queryByText("Анхны тэмдэглэл")).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/notes/n1", expect.objectContaining({ method: "DELETE" }));
  });

  it("shows a validation error for an empty note without calling the API", async () => {
    const fetchMock = serveNotesApi();
    renderDashboard();
    await screen.findByText("Анхны тэмдэглэл");

    fireEvent.click(screen.getByTestId("add-note-interactive-btn"));
    fireEvent.click(screen.getByTestId("save-note-btn"));

    expect(screen.getByTestId("note-error")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1); // зөвхөн эхний GET
  });
});
