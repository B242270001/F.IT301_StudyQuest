// TASK-01: /profile/avatar — дүрийн тохиргоо GET/PUT /api/user/avatar
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AvatarEditor from "../task-01-auth/AvatarEditor";
import Avatar from "../components/avatar/Avatar";
import { normalizeAvatar } from "../components/avatar/avatarCatalog";

const user = { id: "U05", displayName: "Б. Тэмүүлэн", role: "STUDENT", token: "tok-test" };
const stored = {
  body: "male",
  skinTone: "#eec19a",
  hairStyle: "curly",
  hairColor: "#2b1d14",
  outfit: "hoodie",
  outfitColor: "#f59e0b",
  accessory: "headphones",
};

function serve({ failGet = false, failPut = false } = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method || "GET";
    if (url === "/api/user/avatar" && method === "GET") {
      return failGet
        ? { ok: false, status: 500, json: async () => ({ message: "Серверийн алдаа гарлаа" }) }
        : { ok: true, status: 200, json: async () => ({ avatarConfig: stored }) };
    }
    if (url === "/api/user/avatar" && method === "PUT") {
      if (failPut) return { ok: false, status: 422, json: async () => ({ message: "Хувцас буруу байна" }) };
      return { ok: true, status: 200, json: async () => ({ avatarConfig: JSON.parse(options.body) }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderEditor(props = {}) {
  return render(
    <MemoryRouter>
      <AvatarEditor user={user} {...props} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  sessionStorage.setItem("studyquest.currentUser", JSON.stringify(user));
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("TASK-01: Avatar component", () => {
  it("draws the layers from avatarConfig", () => {
    const { container } = render(<Avatar config={stored} />);
    const svg = container.querySelector("svg");
    expect(svg.getAttribute("data-hair")).toBe("curly");
    expect(svg.getAttribute("data-accessory")).toBe("headphones");
  });

  it("falls back to defaults for missing or unknown values", () => {
    expect(normalizeAvatar({ outfit: "spacesuit", hairColor: "red" })).toMatchObject({
      outfit: "hoodie",
      hairColor: "#2b1d14",
    });
    expect(normalizeAvatar(null).body).toBe("female");
  });
});

describe("TASK-01: AvatarEditor", () => {
  it("shows loading, then the stored avatar from GET /api/user/avatar", async () => {
    const fetchMock = serve();
    renderEditor();

    expect(screen.getByTestId("avatar-loading")).toBeInTheDocument();
    expect(await screen.findByTestId("avatar-outfit-hoodie")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("avatar-preview").getAttribute("data-hair")).toBe("curly");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer tok-test");
  });

  it("previews a change and saves it with PUT /api/user/avatar", async () => {
    const fetchMock = serve();
    const onUserUpdate = vi.fn();
    renderEditor({ onUserUpdate });

    fireEvent.click(await screen.findByTestId("avatar-outfit-deel"));
    expect(screen.getByTestId("avatar-preview").getAttribute("data-outfit")).toBe("deel");

    fireEvent.click(screen.getByTestId("avatar-save-btn"));
    expect(await screen.findByTestId("avatar-success")).toHaveTextContent("хадгалагдлаа");

    const put = fetchMock.mock.calls.find(([, o]) => o?.method === "PUT");
    expect(JSON.parse(put[1].body)).toMatchObject({ outfit: "deel", hairStyle: "curly" });
    expect(onUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ avatarConfig: expect.objectContaining({ outfit: "deel" }) }),
    );
    expect(JSON.parse(sessionStorage.getItem("studyquest.currentUser")).avatarConfig.outfit).toBe("deel");
  });

  it("keeps Save disabled until something changes", async () => {
    serve();
    renderEditor();
    await screen.findByTestId("avatar-outfit-hoodie");
    expect(screen.getByTestId("avatar-save-btn")).toBeDisabled();
  });

  it("shows an error with retry when loading fails", async () => {
    serve({ failGet: true });
    renderEditor();
    expect(await screen.findByTestId("avatar-error")).toHaveTextContent("Серверийн алдаа гарлаа");
  });

  it("shows the API error when saving fails", async () => {
    serve({ failPut: true });
    renderEditor();
    fireEvent.click(await screen.findByTestId("avatar-hairStyle-bun"));
    fireEvent.click(screen.getByTestId("avatar-save-btn"));
    await waitFor(() => expect(screen.getByTestId("avatar-save-error")).toHaveTextContent("Хувцас буруу байна"));
  });
});
