import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockTeacher } from "./mock/mockTeacher";

/**
 * TASK-04 — Д. Баттөмөр
 * /teacher — Багш · Удирдах өрөө
 *
 * Wireframe #11: Статистик, хичээлийн хүснэгт (CRUD),
 * суралцагчийн хүснэгт, bar chart.
 */
export default function TeacherRoom({ user, onLogout }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  // Mock өгөгдлийг ачаалах
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Хичээлүүд
        const allCourses = await mockTeacher.getCourses();
        setCourses(allCourses);

        // Оюутнуудын жагсаалт (users.json-аас STUDENT-уудыг татна)
        const usersRes = await fetch("/mock/users.json");
        const usersData = await usersRes.json();
        const studentList = usersData.users.filter(
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

  // Хичээл устгах
  const handleDelete = async (id) => {
    if (!window.confirm("Энэ хичээлийг устгах уу?")) return;
    await mockTeacher.deleteCourse(id);
    setCourses(courses.filter((c) => c.id !== id));
  };

  // Оюутан хайх
  const filteredStudents = students.filter((s) =>
    s.displayName.toLowerCase().includes(studentSearch.toLowerCase())
  );

  /* ── Ачаалж байна ── */
  if (loading) {
    return (
      <div data-testid="page-teacher-room">
        <div data-testid="state-loading">Ачаалж байна...</div>
      </div>
    );
  }

  /* ── Алдаа ── */
  if (error) {
    return (
      <div data-testid="page-teacher-room">
        <div data-testid="state-error">
          <p>Алдаа гарлаа</p>
          <button onClick={() => { setError(false); window.location.reload(); }}>Дахин оролдох</button>
        </div>
      </div>
    );
  }

  /* ── Үндсэн агуулга ── */
  return (
    <div data-testid="page-teacher-room">
      <h1>Багшийн өрөө — {user?.displayName}</h1>

      {/* Гарах товч */}
      <button onClick={onLogout} style={{ float: "right" }}>
        Гарах
      </button>

      {/* + Хичээл нэмэх товч */}
      <button
        data-testid="teacher-add-course"
        onClick={() => navigate("/teacher/courses/new")}
      >
        + Хичээл нэмэх
      </button>

      {/* ── Статистик ── */}
      <div>
        <span data-testid="stat-courses">Хичээл: {courses.length}</span>
        {" · "}
        <span data-testid="stat-students">Суралцагч: {students.length}</span>
        {" · "}
        <span data-testid="stat-avg-score">Дундаж оноо: —%</span>
        {" · "}
        <span data-testid="stat-attempts">Оролдлого: 0</span>
      </div>

      {/* TODO: хичээл тус бүрийн XP bar chart */}

      {/* ── Хичээлийн хүснэгт ── */}
      {courses.length === 0 ? (
        <div data-testid="state-empty">
          <p>Хичээл алга. Эхний хичээлээ нэмнэ үү</p>
          <button onClick={() => navigate("/teacher/courses/new")}>+ Хичээл нэмэх</button>
        </div>
      ) : (
        <table>
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
              <tr key={course.id} data-testid="course-row" data-course-id={course.id}>
                <td>{course.title}</td>
                <td>{course.category}</td>
                <td>{course.totalUnits || "—"}</td>
                <td>{course.description?.substring(0, 40)}...</td>
                <td>
                  <button data-testid="course-edit-btn">Засах</button>
                  <button
                    data-testid="course-delete-btn"
                    onClick={() => handleDelete(course.id)}
                  >
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Суралцагчийн хүснэгт ── */}
      <div>
        <h2>Суралцагчид</h2>
        <input
          data-testid="student-search"
          placeholder="Нэрээр хайх"
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
        />
        {filteredStudents.length === 0 ? (
          <p>Суралцагч олдсонгүй</p>
        ) : (
          <table>
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
                  <td>{s.displayName}</td>
                  <td>{s.totalXp?.toLocaleString()} XP</td>
                  <td>{s.streakDays} өдөр</td>
                  <td>{s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString("mn-MN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Устгах баталгаажуулах modal (TODO) ── */}
      {/* confirm-dialog, confirm-delete, confirm-cancel */}

      {/* ── Засах modal (TODO) ── */}
      {/* course-edit-form, course-save, course-cancel */}
    </div>
  );
}
