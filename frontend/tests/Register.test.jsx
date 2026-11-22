// TASK-01 (Lab 6): /register — validation, POST /api/auth/register, алдааны төлөв
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../task-01-auth/Register";
import { validateRegister } from "../task-01-auth/registerValidation";

function serve({ registerStatus = 201, body } = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    if (url === "/api/auth/register") {
      const sent = JSON.parse(options.body);
      if (registerStatus !== 201) {
        return { ok: false, status: registerStatus, json: async () => body };
      }
      return {
        ok: true,
        status: 201,
        json: async () => ({
          token: "a.b.c",
          tokenType: "Bearer",
          user: { id: "U11", username: sent.username, displayName: sent.displayName, role: "STUDENT" },
        }),
      };
    }
    if (url === "/api/user/profile") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: "U11", username: "bold.b", displayName: "Б. Болд", role: "STUDENT", totalXp: 0 }),
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderPage(onLogin = vi.fn()) {
  render(
    <MemoryRouter>
      <Register onLogin={onLogin} />
    </MemoryRouter>,
  );
  return onLogin;
}

function fill(values) {
  for (const [name, value] of Object.entries(values)) {
    fireEvent.change(screen.getByTestId(`register-${name}-input`), { target: { value } });
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("TASK-01: Register", () => {
  it("validateRegister mirrors the backend rules", () => {
    expect(validateRegister({ username: "", displayName: "", password: "", confirm: "" })).toMatchObject({
      username: expect.any(String),
      displayName: expect.any(String),
      password: expect.any(String),
    });
    expect(validateRegister({ username: "ab", displayName: "A", password: "123", confirm: "1" })).toMatchObject({
      username: expect.any(String),
      displayName: expect.any(String),
      password: expect.any(String),
      confirm: expect.any(String),
    });
    expect(validateRegister({ username: "bold.b", displayName: "Б. Болд", password: "secret1", confirm: "secret1" })).toEqual({});
  });

  it("shows field errors and does not call the API for invalid input", () => {
    const fetchMock = serve();
    renderPage();
    fireEvent.click(screen.getByTestId("register-submit-btn"));
    expect(screen.getByTestId("register-username-error")).toBeInTheDocument();
    expect(screen.getByTestId("register-password-error")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("registers via POST /api/auth/register, stores the JWT session and calls onLogin", async () => {
    const fetchMock = serve();
    const onLogin = renderPage();
    fill({ username: "bold.b", displayName: "Б. Болд", password: "secret1", confirm: "secret1" });
    fireEvent.click(screen.getByTestId("register-gender-male"));
    fireEvent.click(screen.getByTestId("register-submit-btn"));

    expect(screen.getByTestId("register-submit-btn")).toHaveTextContent("Бүртгэж байна");
    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));

    const [, options] = fetchMock.mock.calls.find(([url]) => url === "/api/auth/register");
    expect(JSON.parse(options.body)).toEqual({
      username: "bold.b",
      displayName: "Б. Болд",
      password: "secret1",
      gender: "male",
    });
    expect(onLogin.mock.calls[0][0]).toMatchObject({ username: "bold.b", token: "a.b.c" });
    expect(JSON.parse(sessionStorage.getItem("studyquest.currentUser")).token).toBe("a.b.c");
  });

  it("shows the server's field error for a taken username (409)", async () => {
    serve({ registerStatus: 409, body: { message: "Энэ нэр аль хэдийн бүртгэлтэй байна", field: "username" } });
    const onLogin = renderPage();
    fill({ username: "temuulen", displayName: "Давхар", password: "secret1", confirm: "secret1" });
    fireEvent.click(screen.getByTestId("register-submit-btn"));

    expect(await screen.findByTestId("register-username-error")).toHaveTextContent("бүртгэлтэй");
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("shows a general error when the server fails", async () => {
    serve({ registerStatus: 500, body: { message: "Серверийн алдаа гарлаа" } });
    renderPage();
    fill({ username: "bold.b", displayName: "Б. Болд", password: "secret1", confirm: "secret1" });
    fireEvent.click(screen.getByTestId("register-submit-btn"));
    expect(await screen.findByTestId("register-error")).toHaveTextContent("Серверийн алдаа");
  });
});
