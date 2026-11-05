import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeacherCourseForm from "../task-04-teacher/TeacherCourseForm";

/* ── Mock useNavigate ── */
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/teacher/courses/new"]}>
      <TeacherCourseForm />
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
  mockNavigate.mockReset();
});

describe("TeacherCourseForm", () => {
  it("renders page-teacher-course-form", () => {
    renderPage();
    expect(screen.getByTestId("page-teacher-course-form")).toBeTruthy();
  });

  it("shows validation errors when saving with empty fields", async () => {
    renderPage();

    fireEvent.click(screen.getByTestId("course-save"));

    expect(await screen.findByTestId("course-title-error")).toBeTruthy();
    expect(screen.getByTestId("course-title-error").textContent).toBe(
      "Хичээлийн нэр оруулна уу"
    );
    expect(screen.getByTestId("course-category-error").textContent).toBe(
      "Ангилал сонгоно уу"
    );
    expect(screen.getByTestId("course-description-error").textContent).toBe(
      "Тайлбар оруулна уу"
    );
  });

  it("shows validation error for short title", async () => {
    renderPage();

    fireEvent.change(screen.getByTestId("course-title-input"), {
      target: { value: "AB" },
    });
    fireEvent.click(screen.getByTestId("course-save"));

    expect(await screen.findByTestId("course-title-error")).toBeTruthy();
    expect(screen.getByTestId("course-title-error").textContent).toBe(
      "Нэр хамгийн багадаа 3 тэмдэгт"
    );
  });

  it("shows validation error for short description", async () => {
    renderPage();

    fireEvent.change(screen.getByTestId("course-title-input"), {
      target: { value: "Веб систем" },
    });
    fireEvent.change(screen.getByTestId("course-category-select"), {
      target: { value: "Web" },
    });
    fireEvent.change(screen.getByTestId("course-description-input"), {
      target: { value: "Богино" },
    });
    fireEvent.click(screen.getByTestId("course-save"));

    expect(await screen.findByTestId("course-description-error")).toBeTruthy();
    expect(screen.getByTestId("course-description-error").textContent).toBe(
      "Тайлбар хамгийн багадаа 10 тэмдэгт"
    );
  });

  it("saves valid form and navigates to /teacher", async () => {
    renderPage();

    fireEvent.change(screen.getByTestId("course-title-input"), {
      target: { value: "Веб систем ба технологи" },
    });
    fireEvent.change(screen.getByTestId("course-category-select"), {
      target: { value: "Web" },
    });
    fireEvent.change(screen.getByTestId("course-description-input"), {
      target: { value: "Вебийн архитектур, HTTP, HTML/CSS, JavaScript судлах." },
    });

    fireEvent.click(screen.getByTestId("course-save"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/teacher");
    });
  });

  it("shows material file type validation error", () => {
    renderPage();

    const fileInput = screen.getByTestId("material-input");
    const invalidFile = new File(["content"], "test.zip", {
      type: "application/zip",
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByTestId("material-error")).toBeTruthy();
    expect(screen.getByTestId("material-error").textContent).toBe(
      "Зөвхөн pdf, pptx, docx, png, jpg файл"
    );
  });

  it("shows material file size validation error", () => {
    renderPage();

    const fileInput = screen.getByTestId("material-input");
    // Create a file object with a large size
    const largeFile = new File(["x"], "big.pdf", { type: "application/pdf" });
    Object.defineProperty(largeFile, "size", { value: 11 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByTestId("material-error")).toBeTruthy();
    expect(screen.getByTestId("material-error").textContent).toBe(
      "Файл 10 MB-аас их байна"
    );
  });

  it("accepts valid material file", () => {
    renderPage();

    const fileInput = screen.getByTestId("material-input");
    const validFile = new File(["content"], "slides.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.queryByTestId("material-error")).toBeNull();
    expect(screen.getByText(/slides\.pdf/)).toBeTruthy();
  });

  it("cancel button navigates back to /teacher", () => {
    renderPage();

    fireEvent.click(screen.getByTestId("course-cancel"));

    expect(mockNavigate).toHaveBeenCalledWith("/teacher");
  });
});
