import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { achievementsApi } from "../services/api";
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

function AchievementCard({ achievement, earned, isTeacher, onEdit, onDelete }) {
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
      <div className="ach-badge-foot">
        <span className="ach-chip">+{achievement.xpReward} XP</span>
        {!isTeacher && <span className={`ach-status ${earned ? "ok" : ""}`}>{earned ? "Авсан ✓" : "Түгжээтэй"}</span>}
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
    </li>
  );
}

export default function Achievements({ user }) {
  const isTeacher = user?.role === "TEACHER";
  const [items, setItems] = useState(null);
  const [earnedIds, setEarnedIds] = useState(() => new Set());
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      achievementsApi.list(),
      isTeacher || !user?.id ? Promise.resolve([]) : achievementsApi.listForUser(user.id),
    ])
      .then(([list, mine]) => {
        if (!active) return;
        setItems(list);
        setEarnedIds(new Set(mine.map((award) => award.achievement.id)));
      })
      .catch((err) => active && setLoadError(err.message || "Тэмдгүүдийг ачаалж чадсангүй"));
    return () => {
      active = false;
    };
  }, [attempt, isTeacher, user?.id]);

  const retry = () => {
    setLoadError("");
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
      setNotice({ type: "error", text: err.message });
    }
  };

  const earnedCount = items ? items.filter((a) => earnedIds.has(a.id)).length : 0;

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
            <span className="ach-chip ach-summary" data-testid="achievements-earned-count">
              {earnedCount} / {items.length} тэмдэг авсан
            </span>
          )}
        </div>

        {notice && (
          <p
            className={`ach-banner ${notice.type === "success" ? "ach-banner-success" : "ach-banner-error"}`}
            role={notice.type === "success" ? "status" : "alert"}
            data-testid={notice.type === "success" ? "achievements-success" : "achievements-action-error"}
          >
            {notice.text}
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
              <p>{loadError}</p>
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
                  earned={earnedIds.has(a.id)}
                  isTeacher={isTeacher}
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
