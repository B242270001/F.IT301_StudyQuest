import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockTeacher } from "./mock/mockTeacher";

/**
 * TASK-04 — Д. Баттөмөр
 * /teacher/courses/new — Багш · Хичээл нэмэх
 *
 * Wireframe #12: Хичээлийн мэдээлэл form, материал upload,
 * лекц (заавал биш), validation, хадгалах/болих.
 */
export default function TeacherCourseForm() {
  const navigate = useNavigate();

  // TODO: auth шалгах
  const [isTeacher] = useState(true);
  const [isLoggedIn] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Form state ──
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureTopic, setLectureTopic] = useState("");
  const [lectureSummary, setLectureSummary] = useState("");
  const [lectureContent, setLectureContent] = useState("");
  const [lectureCode, setLectureCode] = useState("");
  const [lectureDemo, setLectureDemo] = useState("");

  // ── Validation errors ──
  const [errors, setErrors] = useState({});

  /* ── Нэвтрээгүй ── */
  if (!isLoggedIn) {
    return (
      <div data-testid="page-teacher-course-form">
        <div data-testid="state-login-required">
          <p>Нэвтэрнэ үү</p>
          <button onClick={() => navigate("/login")}>Нэвтрэх</button>
        </div>
      </div>
    );
  }

  /* ── Эрхгүй ── */
  if (!isTeacher) {
    return (
      <div data-testid="page-teacher-course-form">
        <div data-testid="state-forbidden">
          <p>Энэ хуудсыг үзэх эрхгүй</p>
          <button onClick={() => navigate("/dashboard")}>Өрөө рүү буцах</button>
        </div>
      </div>
    );
  }

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Хичээлийн нэр оруулна уу";
    else if (title.trim().length < 3) errs.title = "Нэр хамгийн багадаа 3 тэмдэгт";
    if (!category) errs.category = "Ангилал сонгоно уу";
    if (!description.trim()) errs.description = "Тайлбар оруулна уу";
    else if (description.trim().length < 10) errs.description = "Тайлбар хамгийн багадаа 10 тэмдэгт";

    // Лекцийн аль нэг талбар бөглөгдсөн бол гарчиг, агуулга заавал
    const hasLecture = lectureTitle || lectureTopic || lectureSummary || lectureContent || lectureCode || lectureDemo;
    if (hasLecture) {
      if (!lectureTitle.trim()) errs.lectureTitle = "Лекцийн гарчиг оруулна уу";
      if (!lectureContent.trim()) errs.lectureContent = "Лекцийн агуулга оруулна уу";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Хадгалах ── */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await mockTeacher.createCourse({
      title,
      category,
      icon,
      description,
    });
    setSaving(false);
    navigate("/teacher");
  };

  /* ── Болих ── */
  const handleCancel = () => {
    // TODO: өөрчлөлттэй бол баталгаажуулах modal
    navigate("/teacher");
  };

  /* ── Материал файл сонгох ── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, material: "Зөвхөн pdf, pptx, docx, png, jpg файл" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, material: "Файл 10 MB-аас их байна" }));
      return;
    }
    setMaterials((prev) => [...prev, file]);
    setErrors((prev) => {
      const { material, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div data-testid="page-teacher-course-form">
      {/* Толгой */}
      <button onClick={() => navigate("/teacher")}>← Багшийн өрөө</button>
      <h1>Хичээл нэмэх</h1>

      {/* ── A. Хичээлийн мэдээлэл ── */}
      <section>
        <h2>A. Хичээлийн мэдээлэл</h2>

        <div>
          <label>Нэр</label>
          <input
            data-testid="course-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <span data-testid="course-title-error">{errors.title}</span>}
        </div>

        <div>
          <label>Ангилал</label>
          <select
            data-testid="course-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Сонгох</option>
            <option value="Web">Web</option>
            <option value="OS">OS</option>
            <option value="Database">Өгөгдлийн сан</option>
            <option value="Programming">Програмчлал</option>
          </select>
          {errors.category && <span data-testid="course-category-error">{errors.category}</span>}
        </div>

        <div>
          <label>Дүрс</label>
          <select
            data-testid="course-icon-select"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            <option value="">Сонгох</option>
            {/* TODO: icon options */}
          </select>
        </div>

        <div>
          <label>Тайлбар</label>
          <textarea
            data-testid="course-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <span data-testid="course-description-error">{errors.description}</span>}
        </div>
      </section>

      {/* ── B. Материал upload ── */}
      <section>
        <h2>B. Материал upload</h2>
        <input
          data-testid="material-input"
          type="file"
          accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
        {errors.material && <span data-testid="material-error">{errors.material}</span>}
        <ul>
          {materials.map((f, i) => (
            <li key={i}>
              {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)
              <button onClick={() => setMaterials((prev) => prev.filter((_, j) => j !== i))}>
                Хасах
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── C. Лекц (заавал биш) ── */}
      <section>
        <h2>C. Лекц (заавал биш)</h2>

        <div>
          <label>Гарчиг</label>
          <input
            data-testid="lecture-title-input"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
          />
          {errors.lectureTitle && <span>{errors.lectureTitle}</span>}
        </div>

        <div>
          <label>Сэдэв</label>
          <select
            data-testid="lecture-topic-input"
            value={lectureTopic}
            onChange={(e) => setLectureTopic(e.target.value)}
          >
            <option value="">Шинэ сэдэв</option>
            {/* TODO: topic options */}
          </select>
        </div>

        <div>
          <label>Хураангуй</label>
          <input
            data-testid="lecture-summary-input"
            value={lectureSummary}
            onChange={(e) => setLectureSummary(e.target.value)}
          />
        </div>

        <div>
          <label>Агуулга</label>
          <textarea
            data-testid="lecture-content-input"
            value={lectureContent}
            onChange={(e) => setLectureContent(e.target.value)}
          />
          {errors.lectureContent && <span>{errors.lectureContent}</span>}
        </div>

        <div>
          <label>Кодын жишээ</label>
          <textarea
            data-testid="lecture-code-input"
            value={lectureCode}
            onChange={(e) => setLectureCode(e.target.value)}
          />
        </div>

        <div>
          <label>Демо</label>
          <select
            data-testid="lecture-demo-select"
            value={lectureDemo}
            onChange={(e) => setLectureDemo(e.target.value)}
          >
            <option value="">Сонгох</option>
            {/* TODO: demo options */}
          </select>
        </div>

        {/* TODO: Knowledge Check асуултууд */}
      </section>

      {/* ── Товчнууд ── */}
      <div>
        <button data-testid="course-save" onClick={handleSave} disabled={saving}>
          {saving ? "Хадгалж байна…" : "Хадгалах"}
        </button>
        <button data-testid="course-cancel" onClick={handleCancel}>
          Болих
        </button>
      </div>
    </div>
  );
}
