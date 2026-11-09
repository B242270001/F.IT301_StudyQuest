import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "../services/api";
import "./TeacherRoom.css";

// Assets
import iconBook from "./assets/icon-book.svg";
import iconUsers from "./assets/icon-users.svg";
import iconTarget from "./assets/icon-target.svg";
import iconChart from "./assets/icon-chart.svg";
import iconEdit from "./assets/icon-edit.svg";
import iconTrash from "./assets/icon-trash.svg";
import iconPlus from "./assets/icon-plus.svg";
import iconSearch from "./assets/icon-search.svg";

/**
 * TASK-04 — Д. Баттөмөр
 * /teacher — Багш · Удирдах өрөө
 *
 * Wireframe #11: Статистик, хичээлийн хүснэгт (CRUD),
 * суралцагчийн хүснэгт, bar chart.
 */

const CATEGORIES = [
  { value: "WEB", label: "Веб технологи" },
  { value: "OS", label: "Үйлдлийн систем" },
  { value: "DATABASE", label: "Өгөгдлийн сан" },
  { value: "PROGRAMMING", label: "Програмчлал" },
];

function categoryLabel(val) {
  return CATEGORIES.find((c) => c.value === val)?.label || val;
}

export default function TeacherRoom({ user, onLogout }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  // Edit modal state
  const [editCourse, setEditCourse] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editErrors, setEditErrors] = useState({});

  // Toast state
  const [toast, setToast] = useState(null);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  // Mock өгөгдлийг ачаалах
  // ЗАСВАР: useEffect нь role шалгах эрт буцаалтаас ӨМНӨ байх ёстой
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // localStorage-с хичээлүүд авах, байхгүй бол mock-оос seed
        let courseList = [];
        const stored = localStorage.getItem("studyquest.courses");
        if (stored) {
          try {
            courseList = JSON.parse(stored);
          } catch {
            courseList = [];
          }
        }
        if (courseList.length === 0) {
          courseList = await courseApi.getCourses();
          localStorage.setItem(
            "studyquest.courses",
            JSON.stringify(courseList)
          );
        }
        setCourses(courseList);

        // Оюутнуудын жагсаалт (users.json-аас STUDENT-уудыг татна)
        const usersRes = await fetch("/mock/users.json");
        const usersData = await usersRes.json();
        const studentList = (usersData.users || []).filter(
          (u) => u.role === "STUDENT"
        );
        setStudents(studentList);

        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Auth шалгах (hooks-ийн дараа) ── */
  if (user && user.role !== "TEACHER") {
    return (
      <div data-testid="page-teacher-room" className="tr-page">
        <div className="tr-state" data-testid="state-forbidden">
          <span className="tr-state-icon">🚫</span>
          <h2>Хандах эрхгүй</h2>
          <p>Энэ хуудсыг зөвхөн багш үзэх боломжтой</p>
          <button
            className="tr-btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Өрөө рүү буцах
          </button>
        </div>
      </div>
    );
  }

  /* ── Хичээл устгах ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Энэ хичээлийг устгах уу?")) return;
    await courseApi.deleteCourse(id);
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    localStorage.setItem("studyquest.courses", JSON.stringify(updated));
    showToast("Хичээл устгагдлаа");
  };

  /* ── Хичээл засах ── */
  const handleEditClick = (course) => {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
    setEditCategory(course.category || "");
    setEditErrors({});
  };

  const handleEditSave = () => {
    const errs = {};
    if (!editTitle.trim()) errs.title = "Хичээлийн нэр оруулна уу";
    else if (editTitle.trim().length < 3)
      errs.title = "Нэр хамгийн багадаа 3 тэмдэгт";
    if (!editCategory) errs.category = "Ангилал сонгоно уу";
    if (!editDescription.trim()) errs.description = "Тайлбар оруулна уу";
    else if (editDescription.trim().length < 10)
      errs.description = "Тайлбар хамгийн багадаа 10 тэмдэгт";

    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const updated = courses.map((c) =>
      c.id === editCourse.id
        ? {
            ...c,
            title: editTitle.trim(),
            description: editDescription.trim(),
            category: editCategory,
          }
        : c
    );
    setCourses(updated);
    localStorage.setItem("studyquest.courses", JSON.stringify(updated));
    showToast(`"${editTitle.trim()}" хичээл шинэчлэгдлээ`);
    setEditCourse(null);
  };

  // Оюутан хайх
  const filteredStudents = students.filter((s) =>
    s.displayName.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Статистик тоо
  const stats = {
    courseCount: courses.length,
    studentCount: students.length,
    avgScore: 78,
    attemptCount: 12,
  };

  // Bar chart-ийн XP өгөгдөл
  // ЗАСВАР: Math.random() биш тогтмол утга
  const xpByCourse = courses.map((c) => ({
    courseId: c.id,
    title: c.title,
    xp: c.xp ?? 500 + (c.totalUnits || 1) * 250,
  }));
  const maxXp = Math.max(...xpByCourse.map((x) => x.xp), 1);

  /* ── Ачаалж байна ── */
  if (loading) {
    return (
      <div data-testid="page-teacher-room" className="tr-page">
        <header className="tr-topbar">
          <div className="tr-topbar-brand">
            <span className="tr-topbar-logo">🎓</span>
            <span className="tr-topbar-title">StudyQuest <span>Багш</span></span>
          </div>
        </header>
        <div className="tr-content">
          <div className="tr-state" data-testid="state-loading">
            <div className="tr-spinner" />
            <p>Ачаалж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Алдаа ── */
  if (error) {
    return (
      <div data-testid="page-teacher-room" className="tr-page">
        <header className="tr-topbar">
          <div className="tr-topbar-brand">
            <span className="tr-topbar-logo">🎓</span>
            <span className="tr-topbar-title">StudyQuest <span>Багш</span></span>
          </div>
        </header>
        <div className="tr-content">
          <div className="tr-state" data-testid="state-error">
            <span className="tr-state-icon">⚠️</span>
            <h2>Алдаа гарлаа</h2>
            <p>Өгөгдөл ачаалахад алдаа гарлаа. Дахин оролдоно уу.</p>
            <button
              className="tr-btn-primary"
              onClick={() => {
                setError(false);
                window.location.reload();
              }}
            >
              Дахин оролдох
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Үндсэн агуулга ── */
  return (
    <div data-testid="page-teacher-room" className="tr-page">
      {/* ── Багшийн тусгай топ бар ── */}
      <header className="tr-topbar">
        <div className="tr-topbar-brand">
          <span className="tr-topbar-logo">🎓</span>
          <span className="tr-topbar-title">
            StudyQuest <span className="tr-badge-teacher">Багш</span>
          </span>
        </div>
        <div className="tr-topbar-right">
          <span className="tr-teacher-name">
            👨‍🏫 {user?.displayName || "Багш"}
          </span>
          {onLogout && (
            <button
              className="tr-btn-logout"
              onClick={onLogout}
              type="button"
            >
              Гарах
            </button>
          )}
        </div>
      </header>

      <div className="tr-content">
        {/* ── Header ── */}
        <div className="tr-header">
          <div className="tr-header-left">
            <h1>Багшийн өрөө — {user?.displayName || "Удирдах самбар"}</h1>
            <p>Хичээл ба оюутны удирдлагын хэсэг</p>
          </div>
          <div className="tr-header-actions">
            <button
              data-testid="teacher-add-course"
              className="tr-btn-primary"
              onClick={() => navigate("/teacher/courses/new")}
            >
              <img src={iconPlus} alt="" width="16" height="16" />
              + Хичээл нэмэх
            </button>
          </div>
        </div>

        {/* ── Статистик ── */}
        <div className="tr-stats">
          <div className="tr-stat-card">
            <div className="tr-stat-icon-wrap">
              <img src={iconBook} alt="" width="20" height="20" />
            </div>
            <span className="tr-stat-label">Нийт хичээл</span>
            <span className="tr-stat-value" data-testid="stat-courses">
              {stats.courseCount}
            </span>
          </div>
          <div className="tr-stat-card">
            <div className="tr-stat-icon-wrap">
              <img src={iconUsers} alt="" width="20" height="20" />
            </div>
            <span className="tr-stat-label">Суралцагч</span>
            <span className="tr-stat-value" data-testid="stat-students">
              {stats.studentCount}
            </span>
          </div>
          <div className="tr-stat-card">
            <div className="tr-stat-icon-wrap">
              <img src={iconTarget} alt="" width="20" height="20" />
            </div>
            <span className="tr-stat-label">Дундаж оноо</span>
            <span className="tr-stat-value" data-testid="stat-avg-score">
              {stats.avgScore}%
            </span>
          </div>
          <div className="tr-stat-card">
            <div className="tr-stat-icon-wrap">
              <img src={iconChart} alt="" width="20" height="20" />
            </div>
            <span className="tr-stat-label">Нийт оролдлого</span>
            <span className="tr-stat-value" data-testid="stat-attempts">
              {stats.attemptCount}
            </span>
          </div>
        </div>

        {/* ── Bar Chart: Хичээл тус бүрийн XP ── */}
        <div className="tr-chart-card">
          <h2>Хичээл тус бүрийн XP</h2>
          {courses.length === 0 ? (
            <p style={{ color: "#77778c", fontSize: 14, textAlign: "center", padding: 40 }}>
              Хичээл байхгүй байна
            </p>
          ) : (
            <div className="tr-chart">
              {xpByCourse.map((item) => (
                <div key={item.courseId} className="tr-bar-group">
                  <span className="tr-bar-xp">
                    {item.xp.toLocaleString()} XP
                  </span>
                  <div
                    className="tr-bar"
                    style={{ height: `${(item.xp / maxXp) * 100}%` }}
                  />
                  <span className="tr-bar-label">{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Хичээлийн хүснэгт ── */}
        <div className="tr-section-header">
          <h2>Хичээлүүд</h2>
        </div>

        {courses.length === 0 ? (
          <div className="tr-empty" data-testid="state-empty">
            <span className="tr-state-icon">📚</span>
            <h2>Хичээл алга</h2>
            <p>Хичээл алга. Эхний хичээлээ нэмнэ үү</p>
            <button
              className="tr-btn-primary"
              onClick={() => navigate("/teacher/courses/new")}
            >
              <img src={iconPlus} alt="" width="16" height="16" />
              + Хичээл нэмэх
            </button>
          </div>
        ) : (
          <div className="tr-table-card">
            <table className="tr-table">
              <thead>
                <tr>
                  <th>Нэр</th>
                  <th>Ангилал</th>
                  <th>Нэгж</th>
                  <th>Тайлбар</th>
                  <th>Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    data-testid="course-row"
                    data-course-id={course.id}
                  >
                    <td>
                      <span className="tr-course-title">{course.title}</span>
                    </td>
                    <td>
                      <span className="tr-course-category">
                        {categoryLabel(course.category)}
                      </span>
                    </td>
                    <td>{course.totalUnits || "—"}</td>
                    <td>
                      {course.description?.length > 40
                        ? course.description.substring(0, 40) + "..."
                        : course.description || "—"}
                    </td>
                    <td>
                      <div className="tr-actions-cell">
                        <button
                          data-testid="course-edit-btn"
                          className="tr-btn-secondary"
                          onClick={() => handleEditClick(course)}
                        >
                          <img src={iconEdit} alt="" width="14" height="14" />
                          Засах
                        </button>
                        <button
                          data-testid="course-delete-btn"
                          className="tr-btn-danger"
                          onClick={() => handleDelete(course.id)}
                        >
                          <img src={iconTrash} alt="" width="14" height="14" />
                          Устгах
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Суралцагчийн хүснэгт ── */}
        <div className="tr-section-header">
          <h2>Суралцагчид</h2>
          <div className="tr-search-wrap">
            <img
              src={iconSearch}
              alt=""
              width="16"
              height="16"
              className="tr-search-icon"
            />
            <input
              data-testid="student-search"
              className="tr-search-input"
              placeholder="Нэрээр хайх..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="tr-empty">
            <span className="tr-state-icon">👤</span>
            <p>Суралцагч олдсонгүй</p>
          </div>
        ) : (
          <div className="tr-table-card">
            <table className="tr-table">
              <thead>
                <tr>
                  <th>Нэр</th>
                  <th>XP</th>
                  <th>Streak</th>
                  <th>Сүүлд идэвхтэй</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="tr-student-name">
                        <span className="tr-student-avatar">{s.avatar}</span>
                        {s.displayName}
                      </div>
                    </td>
                    <td>
                      <span className="tr-xp-badge">
                        {s.totalXp?.toLocaleString()} XP
                      </span>
                    </td>
                    <td>🔥 {s.streakDays} өдөр</td>
                    <td>
                      {s.lastActiveAt
                        ? new Date(s.lastActiveAt).toLocaleDateString("mn-MN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Засах modal ── */}
      {editCourse && (
        <div
          className="tr-modal-backdrop"
          onClick={() => setEditCourse(null)}
        >
          <div
            className="tr-modal-card"
            onClick={(e) => e.stopPropagation()}
            data-testid="course-edit-form"
          >
            <h2>Хичээл засах</h2>

            <div className="tr-form-group">
              <label htmlFor="edit-title">Хичээлийн нэр</label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editErrors.title)
                    setEditErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder="Хичээлийн нэр"
              />
              {editErrors.title && (
                <span className="tr-form-error">{editErrors.title}</span>
              )}
            </div>

            <div className="tr-form-group">
              <label htmlFor="edit-category">Ангилал</label>
              <select
                id="edit-category"
                value={editCategory}
                onChange={(e) => {
                  setEditCategory(e.target.value);
                  if (editErrors.category)
                    setEditErrors((p) => ({ ...p, category: undefined }));
                }}
              >
                <option value="">Сонгох...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {editErrors.category && (
                <span className="tr-form-error">{editErrors.category}</span>
              )}
            </div>

            <div className="tr-form-group">
              <label htmlFor="edit-description">Тайлбар</label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => {
                  setEditDescription(e.target.value);
                  if (editErrors.description)
                    setEditErrors((p) => ({ ...p, description: undefined }));
                }}
                placeholder="Хичээлийн товч тайлбар..."
              />
              {editErrors.description && (
                <span className="tr-form-error">
                  {editErrors.description}
                </span>
              )}
            </div>

            <div className="tr-modal-actions">
              <button
                className="tr-btn-secondary"
                data-testid="course-cancel"
                onClick={() => setEditCourse(null)}
              >
                Болих
              </button>
              <button
                className="tr-btn-primary"
                data-testid="course-save"
                onClick={handleEditSave}
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="tr-toast" aria-live="polite" data-testid="toast-success">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}