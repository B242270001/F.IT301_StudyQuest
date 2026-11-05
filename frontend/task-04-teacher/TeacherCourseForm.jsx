import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "../services/api";
import "./TeacherCourseForm.css";

/**
 * TASK-04 — Д. Баттөмөр
 * /teacher/courses/new — Багш · Хичээл нэмэх
 *
 * Wireframe #12: Хичээлийн мэдээлэл form, материал upload,
 * лекц (заавал биш), knowledge check, validation, хадгалах/болих.
 */

const CATEGORIES = [
  { value: "WEB", label: "Веб технологи" },
  { value: "Web", label: "Веб технологи" },
  { value: "OS", label: "Үйлдлийн систем" },
  { value: "DATABASE", label: "Өгөгдлийн сан" },
  { value: "PROGRAMMING", label: "Програмчлал" },
];

const ICONS = [
  { value: "web", label: "🌐 Web" },
  { value: "os", label: "🖥️ OS" },
  { value: "db", label: "🗄️ Database" },
  { value: "code", label: "💻 Code" },
  { value: "mobile", label: "📱 Mobile" },
  { value: "ai", label: "🤖 AI" },
];

const DEMO_TYPES = [
  { value: "REACT_RENDER", label: "React Render" },
  { value: "HTML_PREVIEW", label: "HTML Preview" },
  { value: "CODE_RUN", label: "Code Run" },
  { value: "NONE", label: "Байхгүй" },
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Файлын өргөтгөлөөр icon сонгох */
function fileIcon(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (ext === "pptx") return "📊";
  if (ext === "docx") return "📝";
  if (["png", "jpg", "jpeg"].includes(ext)) return "🖼️";
  return "📎";
}

/** Файлын хэмжээг хүний уншигдахуйц болгох */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Хоосон knowledge check асуулт үүсгэх */
function emptyQuestion() {
  return {
    question: "",
    options: ["", "", "", ""],
  };
}

export default function TeacherCourseForm({ user }) {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  // ── Form state: A. Course info ──
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");

  // ── Form state: B. Materials ──
  const [materials, setMaterials] = useState([]);

  // ── Form state: C. Lecture ──
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureTopic, setLectureTopic] = useState("");
  const [lectureSummary, setLectureSummary] = useState("");
  const [lectureContent, setLectureContent] = useState("");
  const [lectureCode, setLectureCode] = useState("");
  const [lectureDemo, setLectureDemo] = useState("");

  // ── Knowledge Check ──
  const [kcOpen, setKcOpen] = useState(false);
  const [kcQuestions, setKcQuestions] = useState([]);

  // ── Validation errors ──
  const [errors, setErrors] = useState({});

  // Refs: анхны алдаатай талбарт focus хийхэд ашиглана
  const titleRef = useRef(null);
  const categoryRef = useRef(null);
  const descriptionRef = useRef(null);
  const lectureTitleRef = useRef(null);
  const lectureContentRef = useRef(null);

  /* ── Auth шалгах ── */
  if (user && user.role !== "TEACHER") {
    return (
      <div data-testid="page-teacher-course-form" className="tcf-page">
        <div className="tcf-state" data-testid="state-forbidden">
          <span className="tcf-state-icon">🚫</span>
          <p>Энэ хуудсыг үзэх эрхгүй</p>
          <button
            className="tcf-btn tcf-btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Өрөө рүү буцах
          </button>
        </div>
      </div>
    );
  }

  /* ── Validation ── */
  const validate = () => {
    const errs = {};

    // A. Course info
    if (!title.trim()) {
      errs.title = "Хичээлийн нэр оруулна уу";
    } else if (title.trim().length < 3) {
      errs.title = "Нэр хамгийн багадаа 3 тэмдэгт";
    }

    if (!category) {
      errs.category = "Ангилал сонгоно уу";
    }

    if (!description.trim()) {
      errs.description = "Тайлбар оруулна уу";
    } else if (description.trim().length < 10) {
      errs.description = "Тайлбар хамгийн багадаа 10 тэмдэгт";
    }

    // C. Лекцийн аль нэг талбар бөглөгдсөн бол гарчиг, агуулга заавал
    const hasLecture =
      lectureTitle ||
      lectureTopic ||
      lectureSummary ||
      lectureContent ||
      lectureCode ||
      lectureDemo;
    if (hasLecture) {
      if (!lectureTitle.trim()) {
        errs.lectureTitle = "Лекцийн гарчиг оруулна уу";
      }
      if (!lectureContent.trim()) {
        errs.lectureContent = "Лекцийн агуулга оруулна уу";
      }
    }

    setErrors(errs);

    // Анхны алдаатай талбар руу focus хийх
    if (Object.keys(errs).length > 0) {
      const refMap = {
        title: titleRef,
        category: categoryRef,
        description: descriptionRef,
        lectureTitle: lectureTitleRef,
        lectureContent: lectureContentRef,
      };
      const firstKey = Object.keys(errs)[0];
      refMap[firstKey]?.current?.focus();
    }

    return Object.keys(errs).length === 0;
  };

  /* ── Хадгалах ── */
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      // localStorage-д хичээлүүдийг хадгалах
      let courses = [];
      const stored = localStorage.getItem("studyquest.courses");
      if (stored) {
        try {
          courses = JSON.parse(stored);
        } catch {
          courses = [];
        }
      }

      // localStorage хоосон бол mock-оос seed хийх
      if (courses.length === 0) {
        try {
          const res = await fetch("/mock/courses.json");
          const data = await res.json();
          courses = data.courses || [];
        } catch {
          courses = [];
        }
      }

      // Шинэ хичээл үүсгэх
      const newCourse = {
        id: `C${Date.now()}`,
        title: title.trim(),
        category,
        icon: icon || "code",
        description: description.trim(),
        totalUnits: 0,
        createdBy: user?.id || "U10",
        createdAt: new Date().toISOString(),
      };

      // Лекц нэмэгдсэн бол
      const hasLecture =
        lectureTitle ||
        lectureTopic ||
        lectureSummary ||
        lectureContent ||
        lectureCode ||
        lectureDemo;
      if (hasLecture && lectureTitle.trim() && lectureContent.trim()) {
        newCourse.lecture = {
          title: lectureTitle.trim(),
          topic: lectureTopic || "Шинэ сэдэв",
          summary: lectureSummary.trim(),
          content: lectureContent.trim(),
          code: lectureCode.trim(),
          demoType: lectureDemo || "NONE",
        };

        // Knowledge check асуултууд
        if (kcQuestions.length > 0) {
          newCourse.lecture.knowledgeCheck = kcQuestions
            .filter((q) => q.question.trim())
            .map((q) => ({
              question: q.question.trim(),
              options: q.options.map((o) => o.trim()).filter(Boolean),
            }));
        }
      }

      // Материалын нэрс (файл upload mock)
      if (materials.length > 0) {
        newCourse.materials = materials.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        }));
      }

      courses.push(newCourse);
      localStorage.setItem("studyquest.courses", JSON.stringify(courses));

      // API-д ч мөн илгээх (mock)
      await courseApi.createCourse(newCourse);

      navigate("/teacher");
    } catch (err) {
      console.error("Хадгалах үед алдаа:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Болих ── */
  const handleCancel = () => {
    navigate("/teacher");
  };

  /* ── Материал файл сонгох ── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value
    e.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        material: "Зөвхөн pdf, pptx, docx, png, jpg файл",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        material: "Файл 10 MB-аас их байна",
      }));
      return;
    }

    setMaterials((prev) => [...prev, file]);
    setErrors((prev) => {
      const { material, ...rest } = prev;
      return rest;
    });
  };

  /* ── Материал хасах ── */
  const removeMaterial = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Knowledge Check ── */
  const addKcQuestion = () => {
    if (kcQuestions.length >= 2) return;
    setKcQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeKcQuestion = (index) => {
    setKcQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateKcQuestion = (index, value) => {
    setKcQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question: value } : q))
    );
  };

  const updateKcOption = (qIndex, oIndex, value) => {
    setKcQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) => (j === oIndex ? value : o)),
            }
          : q
      )
    );
  };

  return (
    <div data-testid="page-teacher-course-form" className="tcf-page">
      {/* ── Багшийн топ бар (суралцагчийн navbar байхгүй) ── */}
      <header className="tcf-topbar">
        <div className="tcf-topbar-brand">
          <span className="tcf-topbar-logo">🎓</span>
          <span className="tcf-topbar-title">
            StudyQuest <span className="tcf-badge-teacher">Багш</span>
          </span>
        </div>
        <div className="tcf-topbar-right">
          <button
            className="tcf-topbar-back"
            onClick={() => navigate("/teacher")}
            type="button"
          >
            ← Багшийн өрөө
          </button>
        </div>
      </header>

      <div className="tcf-container">
        <h1 className="tcf-page-title">Хичээл нэмэх</h1>

        {/* ══════════════════════════════════════════════
            A. Хичээлийн мэдээлэл
            ══════════════════════════════════════════════ */}
        <section className="tcf-section">
          <h2 className="tcf-section-title">
            <span className="tcf-section-badge">A</span>
            Хичээлийн мэдээлэл
          </h2>

          {/* Нэр */}
          <div className="tcf-field">
            <label className="tcf-label" htmlFor="course-title">
              Хичээлийн нэр
            </label>
            <input
              id="course-title"
              ref={titleRef}
              data-testid="course-title-input"
              className={`tcf-input${errors.title ? " is-error" : ""}`}
              type="text"
              placeholder="Жишээ: Веб технологийн үндэс"
              maxLength={80}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
            />
            <span className="tcf-char-count">{title.length}/80</span>
            {errors.title && (
              <span data-testid="course-title-error" className="tcf-error">
                {errors.title}
              </span>
            )}
          </div>

          {/* Ангилал + Дүрс */}
          <div className="tcf-row">
            <div className="tcf-field">
              <label className="tcf-label" htmlFor="course-category">
                Ангилал
              </label>
              <select
                id="course-category"
                ref={categoryRef}
                data-testid="course-category-select"
                className={`tcf-select${errors.category ? " is-error" : ""}`}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category)
                    setErrors((p) => ({ ...p, category: undefined }));
                }}
              >
                <option value="">Сонгох...</option>
                {CATEGORIES.filter((c, idx, arr) => arr.findIndex(x => x.value.toUpperCase() === c.value.toUpperCase()) === idx || c.value === "Web").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span
                  data-testid="course-category-error"
                  className="tcf-error"
                >
                  {errors.category}
                </span>
              )}
            </div>

            <div className="tcf-field">
              <label className="tcf-label" htmlFor="course-icon">
                Дүрс
                <span className="tcf-label-optional">(заавал биш)</span>
              </label>
              <select
                id="course-icon"
                data-testid="course-icon-select"
                className="tcf-select"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="">Сонгох...</option>
                {ICONS.map((ic) => (
                  <option key={ic.value} value={ic.value}>
                    {ic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Тайлбар */}
          <div className="tcf-field">
            <label className="tcf-label" htmlFor="course-description">
              Тайлбар
            </label>
            <textarea
              id="course-description"
              ref={descriptionRef}
              data-testid="course-description-input"
              className={`tcf-textarea${errors.description ? " is-error" : ""}`}
              placeholder="Хичээлийн товч тайлбар..."
              maxLength={500}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((p) => ({ ...p, description: undefined }));
              }}
            />
            <span className="tcf-char-count">{description.length}/500</span>
            {errors.description && (
              <span
                data-testid="course-description-error"
                className="tcf-error"
              >
                {errors.description}
              </span>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            B. Материал upload
            ══════════════════════════════════════════════ */}
        <section className="tcf-section">
          <h2 className="tcf-section-title">
            <span className="tcf-section-badge">B</span>
            Материал upload
          </h2>

          <div className="tcf-upload-area">
            <input
              data-testid="material-input"
              type="file"
              accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            <span className="tcf-upload-icon">📁</span>
            <span className="tcf-upload-text">
              <strong>Файл сонгох</strong> — pdf, pptx, docx, png, jpg
            </span>
          </div>
          <p className="tcf-upload-hint">Дээд хэмжээ: 10 MB</p>

          {errors.material && (
            <span data-testid="material-error" className="tcf-error">
              {errors.material}
            </span>
          )}

          {materials.length > 0 && (
            <ul className="tcf-file-list">
              {materials.map((f, i) => (
                <li key={i} className="tcf-file-item">
                  <span className="tcf-file-icon">{fileIcon(f.name)}</span>
                  <span className="tcf-file-name">{f.name}</span>
                  <span className="tcf-file-size">{formatSize(f.size)}</span>
                  <button
                    className="tcf-file-remove"
                    onClick={() => removeMaterial(i)}
                    type="button"
                  >
                    Хасах
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ══════════════════════════════════════════════
            C. Лекц (заавал биш)
            ══════════════════════════════════════════════ */}
        <section className="tcf-section">
          <h2 className="tcf-section-title">
            <span className="tcf-section-badge">C</span>
            Лекц
            <span className="tcf-label-optional">(заавал биш)</span>
          </h2>

          {/* Гарчиг + Сэдэв */}
          <div className="tcf-row">
            <div className="tcf-field">
              <label className="tcf-label" htmlFor="lecture-title">
                Лекцийн гарчиг
              </label>
              <input
                id="lecture-title"
                ref={lectureTitleRef}
                data-testid="lecture-title-input"
                className={`tcf-input${errors.lectureTitle ? " is-error" : ""}`}
                type="text"
                placeholder="Лекцийн нэр"
                value={lectureTitle}
                onChange={(e) => {
                  setLectureTitle(e.target.value);
                  if (errors.lectureTitle)
                    setErrors((p) => ({ ...p, lectureTitle: undefined }));
                }}
              />
              {errors.lectureTitle && (
                <span className="tcf-error">{errors.lectureTitle}</span>
              )}
            </div>

            <div className="tcf-field">
              <label className="tcf-label" htmlFor="lecture-topic">
                Сэдэв
              </label>
              <select
                id="lecture-topic"
                data-testid="lecture-topic-input"
                className="tcf-select"
                value={lectureTopic}
                onChange={(e) => setLectureTopic(e.target.value)}
              >
                <option value="">Шинэ сэдэв</option>
              </select>
            </div>
          </div>

          {/* Хураангуй */}
          <div className="tcf-field">
            <label className="tcf-label" htmlFor="lecture-summary">
              Хураангуй
              <span className="tcf-label-optional">(заавал биш)</span>
            </label>
            <input
              id="lecture-summary"
              data-testid="lecture-summary-input"
              className="tcf-input"
              type="text"
              placeholder="Лекцийн товч хураангуй"
              value={lectureSummary}
              onChange={(e) => setLectureSummary(e.target.value)}
            />
          </div>

          {/* Агуулга */}
          <div className="tcf-field">
            <label className="tcf-label" htmlFor="lecture-content">
              Агуулга
            </label>
            <textarea
              id="lecture-content"
              ref={lectureContentRef}
              data-testid="lecture-content-input"
              className={`tcf-textarea${
                errors.lectureContent ? " is-error" : ""
              }`}
              placeholder="Лекцийн үндсэн агуулга..."
              value={lectureContent}
              onChange={(e) => {
                setLectureContent(e.target.value);
                if (errors.lectureContent)
                  setErrors((p) => ({ ...p, lectureContent: undefined }));
              }}
            />
            {errors.lectureContent && (
              <span className="tcf-error">{errors.lectureContent}</span>
            )}
          </div>

          {/* Кодын жишээ */}
          <div className="tcf-field">
            <label className="tcf-label" htmlFor="lecture-code">
              Кодын жишээ
              <span className="tcf-label-optional">(заавал биш)</span>
            </label>
            <textarea
              id="lecture-code"
              data-testid="lecture-code-input"
              className="tcf-textarea tcf-textarea-code"
              placeholder="// Кодын жишээ энд бичнэ..."
              value={lectureCode}
              onChange={(e) => setLectureCode(e.target.value)}
            />
          </div>

          {/* Демо */}
          <div className="tcf-field">
            <label className="tcf-label" htmlFor="lecture-demo">
              Демо төрөл
              <span className="tcf-label-optional">(заавал биш)</span>
            </label>
            <select
              id="lecture-demo"
              data-testid="lecture-demo-select"
              className="tcf-select"
              value={lectureDemo}
              onChange={(e) => setLectureDemo(e.target.value)}
            >
              <option value="">Сонгох...</option>
              {DEMO_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* ── Knowledge Check (collapsible) ── */}
          <button
            type="button"
            className="tcf-collapse-toggle"
            onClick={() => setKcOpen((prev) => !prev)}
          >
            <span
              className={`tcf-collapse-chevron${kcOpen ? " is-open" : ""}`}
            >
              ▼
            </span>
            Knowledge Check асуултууд
            {kcQuestions.length > 0 && ` (${kcQuestions.length})`}
          </button>

          {kcOpen && (
            <div className="tcf-kc-section">
              {kcQuestions.map((q, qi) => (
                <div key={qi} className="tcf-kc-card">
                  <div className="tcf-kc-header">
                    <span className="tcf-kc-title">Асуулт #{qi + 1}</span>
                    <button
                      type="button"
                      className="tcf-kc-remove"
                      onClick={() => removeKcQuestion(qi)}
                    >
                      Хасах
                    </button>
                  </div>

                  <div className="tcf-field">
                    <input
                      className="tcf-input"
                      type="text"
                      placeholder="Асуултын текст..."
                      value={q.question}
                      onChange={(e) => updateKcQuestion(qi, e.target.value)}
                    />
                  </div>

                  <div className="tcf-kc-options">
                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        className="tcf-input"
                        type="text"
                        placeholder={`Хариулт ${String.fromCharCode(
                          65 + oi
                        )}`}
                        value={opt}
                        onChange={(e) =>
                          updateKcOption(qi, oi, e.target.value)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="tcf-kc-add"
                disabled={kcQuestions.length >= 2}
                onClick={addKcQuestion}
              >
                + Асуулт нэмэх
                {kcQuestions.length >= 2 && " (хамгийн ихдээ 2)"}
              </button>
            </div>
          )}
        </section>

        {/* ── Хадгалах / Болих товчнууд (sticky footer) ── */}
        <div className="tcf-actions">
          <button
            data-testid="course-cancel"
            className="tcf-btn tcf-btn-secondary"
            onClick={handleCancel}
            type="button"
          >
            Болих
          </button>
          <button
            data-testid="course-save"
            className="tcf-btn tcf-btn-primary"
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? "Хадгалж байна…" : "Хадгалах"}
          </button>
        </div>
      </div>
    </div>
  );
}
