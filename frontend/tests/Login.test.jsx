import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../task-01-auth/Login";
import usersData from "../../public/mock/users.json";

/* ── Mock fetch for /mock/users.json ── */
const mockFiles = {
  "/mock/users.json": usersData,
};

function serveMock(failing = false) {
  const fetchMock = vi.fn(async (url) => {
    if (failing) {
      return { ok: false, status: 500, json: async () => ({}) };
    }
    return { ok: true, json: async () => mockFiles[url] || { users: [] } };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});

describe("TASK-01: Login component validation and authentication", () => {
  it("renders page-login, input fields, and submit button", () => {
    serveMock();
    render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("page-login")).toBeInTheDocument();
    expect(screen.getByTestId("login-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit-btn")).toBeInTheDocument();
  });

  it("shows login-name-error and login-password-error when submitted empty", async () => {
    const fetchMock = serveMock();
    const handleLogin = vi.fn();

    render(
      <MemoryRouter>
        <Login onLogin={handleLogin} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("login-submit-btn"));

    expect(screen.getByTestId("login-name-error")).toBeInTheDocument();
    expect(screen.getByTestId("login-name-error")).toHaveTextContent("Оюутны код эсвэл нэрээ оруулна уу");
    expect(screen.getByTestId("login-password-error")).toBeInTheDocument();
    expect(screen.getByTestId("login-password-error")).toHaveTextContent("Нууц үгээ оруулна уу");
    expect(handleLogin).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows login-password-error when only student code is entered", async () => {
    serveMock();
    const handleLogin = vi.fn();

    render(
      <MemoryRouter>
        <Login onLogin={handleLogin} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("login-name-input"), {
      target: { value: "temuulen" },
    });
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    expect(screen.queryByTestId("login-name-error")).not.toBeInTheDocument();
    expect(screen.getByTestId("login-password-error")).toBeInTheDocument();
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it("shows login-error message on invalid credentials", async () => {
    serveMock();
    const handleLogin = vi.fn();

    render(
      <MemoryRouter>
        <Login onLogin={handleLogin} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("login-name-input"), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByTestId("login-password-input"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("login-error")).toBeInTheDocument();
    });
    expect(screen.getByTestId("login-error")).toHaveTextContent("буруу байна");
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it("logs in successfully as STUDENT and triggers onLogin with user info", async () => {
    serveMock();
    const handleLogin = vi.fn();

    render(
      <MemoryRouter>
        <Login onLogin={handleLogin} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("login-name-input"), {
      target: { value: "temuulen" },
    });
    fireEvent.change(screen.getByTestId("login-password-input"), {
      target: { value: "student123" },
    });
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledTimes(1);
    });

    const loggedInUser = handleLogin.mock.calls[0][0];
    expect(loggedInUser.username).toBe("temuulen");
    expect(loggedInUser.role).toBe("STUDENT");
    expect(loggedInUser.displayName).toBe("Б. Тэмүүлэн");
  });

  it("logs in successfully as TEACHER and triggers onLogin", async () => {
    serveMock();
    const handleLogin = vi.fn();

    render(
      <MemoryRouter>
        <Login onLogin={handleLogin} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("login-name-input"), {
      target: { value: "bagsh" },
    });
    fireEvent.change(screen.getByTestId("login-password-input"), {
      target: { value: "teacher123" },
    });
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledTimes(1);
    });

    const loggedInUser = handleLogin.mock.calls[0][0];
    expect(loggedInUser.username).toBe("bagsh");
    expect(loggedInUser.role).toBe("TEACHER");
  });
});
