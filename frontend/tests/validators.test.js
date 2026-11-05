import { describe, expect, it } from "vitest";
import {
  validateTitle,
  validateCategory,
  validateDescription,
  validateMaterial,
  validateLectureTitle,
  validateLectureContent,
  validateCourseForm,
} from "../utils/validators";

/* ──────────────────────────────────────────
   validateTitle
   ────────────────────────────────────────── */
describe("validateTitle", () => {
  it("returns error for null / undefined / empty string", () => {
    expect(validateTitle(null)).toBe("Хичээлийн нэр оруулна уу");
    expect(validateTitle(undefined)).toBe("Хичээлийн нэр оруулна уу");
    expect(validateTitle("")).toBe("Хичээлийн нэр оруулна уу");
    expect(validateTitle("   ")).toBe("Хичээлийн нэр оруулна уу");
  });

  it("returns error when title is too short (< 3 chars after trim)", () => {
    expect(validateTitle("AB")).toBe("Нэр хамгийн багадаа 3 тэмдэгт");
    expect(validateTitle("  A ")).toBe("Нэр хамгийн багадаа 3 тэмдэгт");
  });

  it("returns error when title is too long (> 80 chars)", () => {
    const long = "A".repeat(81);
    expect(validateTitle(long)).toBe("Нэр хамгийн ихдээ 80 тэмдэгт");
  });

  it("returns null for valid titles", () => {
    expect(validateTitle("Веб")).toBeNull();
    expect(validateTitle("ABC")).toBeNull();
    expect(validateTitle("A".repeat(80))).toBeNull();
    expect(validateTitle("Веб систем ба технологи")).toBeNull();
  });
});

/* ──────────────────────────────────────────
   validateCategory
   ────────────────────────────────────────── */
describe("validateCategory", () => {
  it("returns error for null / undefined / empty string", () => {
    expect(validateCategory(null)).toBe("Ангилал сонгоно уу");
    expect(validateCategory(undefined)).toBe("Ангилал сонгоно уу");
    expect(validateCategory("")).toBe("Ангилал сонгоно уу");
  });

  it("returns error for invalid category values", () => {
    expect(validateCategory("MATH")).toBe("Зөв ангилал сонгоно уу");
    expect(validateCategory("web")).toBe("Зөв ангилал сонгоно уу");
    expect(validateCategory("Web")).toBe("Зөв ангилал сонгоно уу");
  });

  it("returns null for valid categories", () => {
    expect(validateCategory("WEB")).toBeNull();
    expect(validateCategory("OS")).toBeNull();
    expect(validateCategory("DATABASE")).toBeNull();
    expect(validateCategory("PROGRAMMING")).toBeNull();
  });
});

/* ──────────────────────────────────────────
   validateDescription
   ────────────────────────────────────────── */
describe("validateDescription", () => {
  it("returns error for null / undefined / empty / whitespace", () => {
    expect(validateDescription(null)).toBe("Тайлбар оруулна уу");
    expect(validateDescription(undefined)).toBe("Тайлбар оруулна уу");
    expect(validateDescription("")).toBe("Тайлбар оруулна уу");
    expect(validateDescription("    ")).toBe("Тайлбар оруулна уу");
  });

  it("returns error when description is too short (< 10 chars after trim)", () => {
    expect(validateDescription("Богино")).toBe("Тайлбар хамгийн багадаа 10 тэмдэгт");
    expect(validateDescription("123456789")).toBe("Тайлбар хамгийн багадаа 10 тэмдэгт");
  });

  it("returns error when description is too long (> 500 chars)", () => {
    const long = "Б".repeat(501);
    expect(validateDescription(long)).toBe("Тайлбар хамгийн ихдээ 500 тэмдэгт");
  });

  it("returns null for valid descriptions", () => {
    expect(validateDescription("1234567890")).toBeNull();
    expect(validateDescription("Б".repeat(500))).toBeNull();
    expect(validateDescription("Вебийн архитектур, HTTP, HTML/CSS.")).toBeNull();
  });
});

/* ──────────────────────────────────────────
   validateMaterial
   ────────────────────────────────────────── */
describe("validateMaterial", () => {
  it("returns error for disallowed file types", () => {
    expect(validateMaterial({ type: "application/zip", size: 1000 })).toBe(
      "Зөвхөн pdf, pptx, docx, png, jpg файл"
    );
    expect(validateMaterial({ type: "text/plain", size: 1000 })).toBe(
      "Зөвхөн pdf, pptx, docx, png, jpg файл"
    );
    expect(validateMaterial({ type: "video/mp4", size: 1000 })).toBe(
      "Зөвхөн pdf, pptx, docx, png, jpg файл"
    );
  });

  it("returns error when file exceeds 10 MB", () => {
    const overSize = 10 * 1024 * 1024 + 1;
    expect(validateMaterial({ type: "application/pdf", size: overSize })).toBe(
      "Файл 10 MB-аас их байна"
    );
  });

  it("returns null for allowed types within size limit", () => {
    expect(validateMaterial({ type: "application/pdf", size: 5000 })).toBeNull();
    expect(
      validateMaterial({
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: 1024 * 1024,
      })
    ).toBeNull();
    expect(
      validateMaterial({
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1024,
      })
    ).toBeNull();
    expect(validateMaterial({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
    expect(validateMaterial({ type: "image/jpeg", size: 100 })).toBeNull();
  });

  it("returns null for file exactly at the 10 MB boundary", () => {
    expect(validateMaterial({ type: "application/pdf", size: 10 * 1024 * 1024 })).toBeNull();
  });
});

/* ──────────────────────────────────────────
   validateLectureTitle
   ────────────────────────────────────────── */
describe("validateLectureTitle", () => {
  it("returns error for empty / null / undefined", () => {
    expect(validateLectureTitle(null)).toBe("Лекцийн гарчиг оруулна уу");
    expect(validateLectureTitle(undefined)).toBe("Лекцийн гарчиг оруулна уу");
    expect(validateLectureTitle("")).toBe("Лекцийн гарчиг оруулна уу");
    expect(validateLectureTitle("   ")).toBe("Лекцийн гарчиг оруулна уу");
  });

  it("returns null for any non-empty string", () => {
    expect(validateLectureTitle("React Components")).toBeNull();
    expect(validateLectureTitle("A")).toBeNull();
  });
});

/* ──────────────────────────────────────────
   validateLectureContent
   ────────────────────────────────────────── */
describe("validateLectureContent", () => {
  it("returns error for empty / null / undefined", () => {
    expect(validateLectureContent(null)).toBe("Лекцийн агуулга оруулна уу");
    expect(validateLectureContent(undefined)).toBe("Лекцийн агуулга оруулна уу");
    expect(validateLectureContent("")).toBe("Лекцийн агуулга оруулна уу");
    expect(validateLectureContent("  ")).toBe("Лекцийн агуулга оруулна уу");
  });

  it("returns null for any non-empty string", () => {
    expect(validateLectureContent("Агуулга")).toBeNull();
  });
});

/* ──────────────────────────────────────────
   validateCourseForm (integration)
   ────────────────────────────────────────── */
describe("validateCourseForm", () => {
  const validForm = {
    title: "Веб систем",
    category: "WEB",
    description: "Вебийн архитектур судлах хичээл.",
    lectureTitle: "",
    lectureTopic: "",
    lectureSummary: "",
    lectureContent: "",
    lectureCode: "",
    lectureDemo: "",
  };

  it("returns isValid: true when all required fields are valid and no lecture", () => {
    const result = validateCourseForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns all errors for a completely empty form", () => {
    const result = validateCourseForm({
      title: "",
      category: "",
      description: "",
      lectureTitle: "",
      lectureTopic: "",
      lectureSummary: "",
      lectureContent: "",
      lectureCode: "",
      lectureDemo: "",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe("Хичээлийн нэр оруулна уу");
    expect(result.errors.category).toBe("Ангилал сонгоно уу");
    expect(result.errors.description).toBe("Тайлбар оруулна уу");
    // No lecture errors because no lecture field is filled
    expect(result.errors.lectureTitle).toBeUndefined();
    expect(result.errors.lectureContent).toBeUndefined();
  });

  it("requires lectureTitle and lectureContent when any lecture field is filled", () => {
    const result = validateCourseForm({
      ...validForm,
      lectureTopic: "Сэдэв 1",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.lectureTitle).toBe("Лекцийн гарчиг оруулна уу");
    expect(result.errors.lectureContent).toBe("Лекцийн агуулга оруулна уу");
  });

  it("returns isValid: true when lecture fields are properly filled", () => {
    const result = validateCourseForm({
      ...validForm,
      lectureTitle: "React Components",
      lectureTopic: "TP01",
      lectureContent: "Компонентийн тухай",
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("validates title length in form context", () => {
    const result = validateCourseForm({ ...validForm, title: "AB" });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe("Нэр хамгийн багадаа 3 тэмдэгт");
  });

  it("validates description length in form context", () => {
    const result = validateCourseForm({ ...validForm, description: "Богино" });
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe("Тайлбар хамгийн багадаа 10 тэмдэгт");
  });

  it("validates category value in form context", () => {
    const result = validateCourseForm({ ...validForm, category: "INVALID" });
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBe("Зөв ангилал сонгоно уу");
  });
});
