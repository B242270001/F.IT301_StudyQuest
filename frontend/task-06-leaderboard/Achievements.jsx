import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { achievementsApi, leaderboardApi } from "../services/api";
import {
  ACHIEVEMENT_TYPES,
  EMPTY_ACHIEVEMENT,
  describeGoal,
  generateCode,
  toForm,
  typeInfo,
  validateAchievementForm,
} from "./achievementValidation";
import "./Achievements.css";

// TASK-06 (Lab 5): Тэмдэгүүдийн хуудас — бүх өгөгдөл MongoDB-ээс /api/achievements-аар.
// STUDENT: бүх тэмдэг + өөрийн авсан тэмдгүүд. TEACHER: тэмдэг нэмэх, засах, устгах.
// TASK-06 (Lab 6): STUDENT нь /api/me/achievements (JWT)-ээс явц харж, хүрсэн тэмдгээ авна;
//                  TEACHER тэмдэг олгоно. 401/403 алдааг ойлгомжтой харуулна.

// API алдааг мэдэгдэл болгоно; 401 бол дахин нэвтрэх холбоостой.
function errorNotice(err) {
  if (err?.status === 401) {
    return { type: "error", text: "Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.", login: true };
  }
  return { type: "error", text: err?.message || "Алдаа гарлаа" };
}

function progressText({ type, progress }) {
  const { current, target } = progress;
  if (type === "WEEKLY_RANK") {
    return current === null ? "Чансаанд ороогүй" : `Одоо ${current}-р байр · зорилго ${target}-р байр`;
  }
  const unit = type === "STREAK" ? "өдөр" : "XP";
  return `${current.toLocaleString("en-US")} / ${target.toLocaleString("en-US")} ${unit}`;
}

function Field({ id, label, error, hint, children }) {
  return (
    <label className="ach-field" htmlFor={id}>
      <span className="ach-label">{label}</span>
      {children}
      {hint && !error && <span className="ach-hint">{hint}</span>}
      {error && (
        <span className="ach-field-error" data-testid={`achievement-error-${id.replace("achievement-", "")}`}>
          {error}
        </span>
      )}
    </label>
  );
}

function AchievementForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_ACHIEVEMENT));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const info = typeInfo(form.type);

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    const { errors: found, value } = validateAchievementForm(form);
    setErrors(found);
    if (!value) return;

    setSaving(true);
    try {
      const payload = { ...value, code: value.code || generateCode() };
      const saved = editing
        ? await achievementsApi.update(editing.id, payload)
        : await achievementsApi.create(payload);
      onSaved(saved, Boolean(editing));
      if (!editing) setForm(EMPTY_ACHIEVEMENT);
    } catch (err) {
      // Серверийн 422 талбарын алдааг тухайн талбарт, бусдыг маягтын дээд хэсэгт харуулна
      if (err.field && err.field in EMPTY_ACHIEVEMENT) setErrors({ [err.field]: err.message });
      else setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="ach-card ach-form" onSubmit={submit} noValidate data-testid="achievement-form">
      <div className="ach-form-head">
        <h2>{editing ? `Тэмдэг засах · ${editing.id}` : "Шинэ тэмдэг нэмэх"}</h2>
        {editing && (
          <button type="button" className="ach-btn ach-btn-ghost" onClick={onCancel} data-testid="achievement-cancel-btn">
            Болих
          </button>
        )}
      </div>

      {serverError && (
        <p className="ach-banner ach-banner-error" role="alert" data-testid="achievements-save-error">
          {serverError}
        </p>
      )}

      <div className="ach-form-grid">
        <Field id="achievement-title" label="Нэр *" error={errors.title}>
          <input
            id="achievement-title"
            data-testid="achievement-title-input"
            value={form.title}
            onChange={set("title")}
            placeholder="Жишээ: Сарын цуврал"
            aria-invalid={Boolean(errors.title)}
          />
        </Field>
        <Field id="achievement-icon" label="Дүрс" error={errors.icon} hint="Emoji, жишээ: 🔥">
          <input
            id="achievement-icon"
            data-testid="achievement-icon-input"
            value={form.icon}
            onChange={set("icon")}
            aria-invalid={Boolean(errors.icon)}
          />
        </Field>
        <Field id="achievement-type" label="Төрөл *">
          <select id="achievement-type" data-testid="achievement-type-select" value={form.type} onChange={set("type")}>
            {ACHIEVEMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="achievement-threshold"
          label={`Босго * (${info.unit.trim()})`}
          error={errors.threshold}
          hint={`${info.min}–${info.max.toLocaleString("en-US")}`}
        >
          <input
            id="achievement-threshold"
            data-testid="achievement-threshold-input"
            type="number"
            inputMode="numeric"
            value={form.threshold}
            onChange={set("threshold")}
            aria-invalid={Boolean(errors.threshold)}
          />
        </Field>
        <Field id="achievement-xpReward" label="Шагналын XP" error={errors.xpReward} hint="0–1000">
          <input
            id="achievement-xpReward"
            data-testid="achievement-xp-input"
            type="number"
            inputMode="numeric"
            value={form.xpReward}
            onChange={set("xpReward")}
            aria-invalid={Boolean(errors.xpReward)}
          />
        </Field>
        <Field id="achievement-code" label="Код" error={errors.code} hint="Хоосон бол автоматаар үүснэ">
          <input
            id="achievement-code"
            data-testid="achievement-code-input"
            value={form.code}
            onChange={set("code")}
            placeholder="streak-30"
            aria-invalid={Boolean(errors.code)}
          />
        </Field>
        <Field id="achievement-description" label="Тайлбар" error={errors.description}>
          <textarea
            id="achievement-description"
            data-testid="achievement-description-input"
            rows={2}
            value={form.description}
            onChange={set("description")}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>
      </div>

      <button type="submit" className="ach-btn ach-btn-primary" disabled={saving} data-testid="achievement-save-btn">
        {saving ? "Хадгалж байна…" : editing ? "Өөрчлөлт хадгалах" : "Тэмдэг нэмэх"}
      </button>
    </form>
  );
}

function AwardControl({ achievement, students, onAwarded, onError }) {
  const [userId, setUserId] = useState("");
  const [busy, setBusy] = useState(false);

  const award = async () => {
    setBusy(true);
    try {
      const result = await achievementsApi.award(achievement.id, userId);
      onAwarded(result);
      setUserId("");
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ach-award">
      <select
        aria-label={`${achievement.title} тэмдэг олгох суралцагч`}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        data-testid={`achievement-award-select-${achievement.id}`}
      >
        <option value="">Суралцагч сонгох…</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="ach-btn ach-btn-ghost"
        disabled={!userId || busy}
        onClick={award}
        data-testid={`achievement-award-btn-${achievement.id}`}
      >
        Олгох
      </button>
    </div>
  );
}

function AchievementCard({ achievement, earned, isTeacher, students, onEdit, onDelete, onAwarded, onError }) {
  const progress = !isTeacher ? achievement.progress : null;
  const ready = progress?.reached && !earned;
  return (
    <li
      className={`ach-badge ${earned ? "is-earned" : ""}`}
      data-testid={`achievement-card-${achievement.id}`}
      data-earned={isTeacher ? undefined : String(earned)}
    >
      <span className="ach-icon" aria-hidden="true">
        {achievement.icon}
      </span>
      <div className="ach-badge-body">
        <h3>{achievement.title}</h3>
        {achievement.description && <p className="ach-desc">{achievement.description}</p>}
        <p className="ach-goal">{describeGoal(achievement)}</p>
      </div>
      {progress && (
        <div className="ach-progress" data-testid={`achievement-progress-${achievement.id}`}>
          <div
            className="ach-progress-bar"
            role="progressbar"
            aria-label={`${achievement.title} биелэлт`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
          >
            <span style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="ach-progress-text">{progressText(achievement)}</span>
        </div>
      )}
      <div className="ach-badge-foot">
        <span className="ach-chip">+{achievement.xpReward} XP</span>
        {!isTeacher && (
          <span className={`ach-status ${earned ? "ok" : ready ? "ready" : ""}`}>
            {earned ? "Авсан ✓" : ready ? "Авах боломжтой" : "Түгжээтэй"}
          </span>
        )}
        {isTeacher && (
          <span className="ach-actions">
            <button
              type="button"
              className="ach-btn ach-btn-ghost"
              onClick={() => onEdit(achievement)}
              data-testid={`achievement-edit-${achievement.id}`}
            >
              Засах
            </button>
            <button
              type="button"
              className="ach-btn ach-btn-danger"
              onClick={() => onDelete(achievement)}
              data-testid={`achievement-delete-${achievement.id}`}
            >
              Устгах
            </button>
          </span>
        )}
      </div>
      {isTeacher && students.length > 0 && (
        <AwardControl achievement={achievement} students={students} onAwarded={onAwarded} onError={onError} />
      )}
    </li>
  );
}

export default function Achievements({ user }) {
  const isTeacher = user?.role === "TEACHER";
  const [items, setItems] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    // STUDENT: нэг хүсэлтээр бүх тэмдэг + авсан эсэх + явц. TEACHER: жагсаалт + олгох суралцагчид.
    const load = isTeacher
      ? Promise.all([achievementsApi.list(), leaderboardApi.getAllTime().catch(() => [])]).then(
          ([list, ranking]) => ({ list, people: ranking.map(({ id, name }) => ({ id, name })) }),
        )
      : achievementsApi.mine().then((list) => ({ list, people: [] }));
    load
      .then(({ list, people }) => {
        if (!active) return;
        setItems(list);
        setStudents(people);
      })
      .catch((err) => active && setLoadError(errorNotice(err)));
    return () => {
      active = false;
    };
  }, [attempt, isTeacher]);

  const retry = () => {
    setLoadError(null);
    setItems(null);
    setAttempt((n) => n + 1);
  };

  const handleSaved = useCallback((saved, wasEdit) => {
    setItems((list) => (wasEdit ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved]));
    setEditing(null);
    setNotice({ type: "success", text: wasEdit ? `"${saved.title}" шинэчлэгдлээ` : `"${saved.title}" тэмдэг нэмэгдлээ` });
  }, []);

  const confirmDelete = async () => {
    const target = deleting;
    setDeleting(null);
    try {
      await achievementsApi.remove(target.id);
      setItems((list) => list.filter((a) => a.id !== target.id));
      if (editing?.id === target.id) setEditing(null);
      setNotice({ type: "success", text: `"${target.title}" устгагдлаа` });
    } catch (err) {
      setNotice(errorNotice(err));
    }
  };

  const claim = async () => {
    setClaiming(true);
    setNotice(null);
    try {
      const { awarded, achievements } = await achievementsApi.claim();
      setItems(achievements);
      setNotice(
        awarded.length > 0
          ? { type: "success", text: `${awarded.length} шинэ тэмдэг авлаа: ${awarded.map((a) => `${a.icon} ${a.title}`).join(", ")}` }
          : { type: "info", text: "Шинэ тэмдэг алга. Дадлагаа үргэлжлүүлээрэй!" },
      );
    } catch (err) {
      setNotice(errorNotice(err));
    } finally {
      setClaiming(false);
    }
  };

  const handleAwarded = useCallback((award) => {
    setNotice({
      type: "success",
      text: `${award.achievement.icon} ${award.achievement.title} → ${award.user.displayName} олгогдлоо`,
    });
  }, []);

  const handleError = useCallback((err) => setNotice(errorNotice(err)), []);

  const earnedCount = items ? items.filter((a) => a.earned).length : 0;
  const readyCount = items ? items.filter((a) => a.progress?.reached && !a.earned).length : 0;

  return (
    <div className="ach-page" data-testid="page-achievements">
      <Navbar user={user} />

      <main className="ach-content">
        <div className="ach-heading">
          <div>
            <h1>Тэмдэгүүд</h1>
            <p>
              {isTeacher
                ? "Суралцагчдыг урамшуулах тэмдгүүдийг удирдана."
                : "XP, цуврал, чансаагаараа тэмдэг цуглуул."}
            </p>
          </div>
          {!isTeacher && items && items.length > 0 && (
            <div className="ach-heading-actions">
              <span className="ach-chip ach-summary" data-testid="achievements-earned-count">
                {earnedCount} / {items.length} тэмдэг авсан
              </span>
              <button
                type="button"
                className="ach-btn ach-btn-primary"
                onClick={claim}
                disabled={claiming}
                data-testid="achievements-claim-btn"
              >
                {claiming ? "Шалгаж байна…" : readyCount > 0 ? `Тэмдэг авах (${readyCount})` : "Тэмдэг шалгах"}
              </button>
            </div>
          )}
        </div>

        {notice && (
          <p
            className={`ach-banner ach-banner-${notice.type}`}
            role={notice.type === "error" ? "alert" : "status"}
            data-testid={
              notice.type === "success"
                ? "achievements-success"
                : notice.type === "info"
                  ? "achievements-info"
                  : "achievements-action-error"
            }
          >
            {notice.text}
            {notice.login && (
              <>
                {" "}
                <Link to="/login" data-testid="achievements-login-link">
                  Нэвтрэх
                </Link>
              </>
            )}
          </p>
        )}

        {isTeacher && (
          <AchievementForm
            key={editing?.id || "new"}
            editing={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        )}

        <section className="ach-card ach-list-card" aria-label="Тэмдгийн жагсаалт">
          {loadError ? (
            <div className="ach-state" role="alert" data-testid="achievements-error">
              <p>{loadError.text}</p>
              {loadError.login && (
                <Link to="/login" className="ach-btn ach-btn-ghost" data-testid="achievements-login-link">
                  Дахин нэвтрэх
                </Link>
              )}
              <button type="button" className="ach-btn ach-btn-primary" onClick={retry} data-testid="achievements-retry-btn">
                Дахин оролдох
              </button>
            </div>
          ) : !items ? (
            <p className="ach-state" data-testid="achievements-loading">
              Ачаалж байна…
            </p>
          ) : items.length === 0 ? (
            <p className="ach-state" data-testid="achievements-empty">
              Одоогоор тэмдэг алга.
            </p>
          ) : (
            <ul className="ach-grid" data-testid="achievements-list">
              {items.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  earned={Boolean(a.earned)}
                  isTeacher={isTeacher}
                  students={students}
                  onAwarded={handleAwarded}
                  onError={handleError}
                  onEdit={(item) => {
                    setNotice(null);
                    setEditing(item);
                  }}
                  onDelete={setDeleting}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      {deleting && (
        <ConfirmDialog
          title="Тэмдэг устгах уу?"
          name={`${deleting.icon} ${deleting.title}`}
          message="Энэ тэмдгийг авсан суралцагчдаас мөн хасагдана."
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
