// TASK-01 (Lab 6): /register — шинэ оюутан бүртгүүлж JWT-ээр шууд нэвтэрнэ.
import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";
import virtualRoomNight from "./assets/virtualRoomNight.jpg";
import "./Login.css";
import "./Register.css";
import { validateRegister } from "./registerValidation";

function Field({ label, name, type = "text", value, onChange, error, placeholder, autoComplete }) {
  return (
    <div className="input-group">
      <label htmlFor={`register-${name}`}>{label}</label>
      <div className="input-field-wrapper">
        <input
          id={`register-${name}`}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          data-testid={`register-${name}-input`}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(name, e.target.value)}
        />
      </div>
      {error && (
        <span className="register-field-error" data-testid={`register-${name}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ username: "", displayName: "", password: "", confirm: "", gender: "female" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateRegister(form);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setLoading(true);
    try {
      const user = await authApi.register({
        username: form.username.trim(),
        displayName: form.displayName.trim(),
        password: form.password,
        gender: form.gender,
      });
      onLogin(user);
    } catch (err) {
      if (err?.field && ["username", "displayName", "password"].includes(err.field)) {
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      } else {
        setServerError(err?.message || "Бүртгүүлж чадсангүй. Дахин оролдоно уу.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-testid="page-register">
      <div className="login-left-section">
        <div className="brand-header">
          <span className="brand-logo-icon">✨</span>
          <span className="brand-title">StudyQuest</span>
        </div>
        <div className="hero-text-container">
          <span className="subtitle">Шинэ аялал</span>
          <h1 className="hero-title">Өрөөгөө нээгээрэй.</h1>
          <p className="hero-desc">Бүртгүүлээд өөрийн дүрээ тохируулж, XP цуглуулж эхэл.</p>
        </div>
        <div className="room-preview-box">
          <img src={virtualRoomNight} className="room-bg-img" alt="Virtual Room Night" />
        </div>
      </div>

      <div className="login-right-section">
        <div className="top-indicator">
          <span>ШИНЭ ХЭРЭГЛЭГЧ</span>
        </div>

        <div className="form-wrapper">
          <div className="welcome-header">
            <h2>Бүртгүүлэх</h2>
          </div>

          {serverError && (
            <div className="register-error" role="alert" data-testid="register-error">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <Field label="Нэвтрэх нэр" name="username" value={form.username} onChange={update}
              error={errors.username} placeholder="ж: bold.b" autoComplete="username" />
            <Field label="Таны нэр" name="displayName" value={form.displayName} onChange={update}
              error={errors.displayName} placeholder="ж: Б. Болд" autoComplete="name" />
            <Field label="Нууц үг" name="password" type="password" value={form.password} onChange={update}
              error={errors.password} placeholder="6+ тэмдэгт" autoComplete="new-password" />
            <Field label="Нууц үг давтах" name="confirm" type="password" value={form.confirm} onChange={update}
              error={errors.confirm} autoComplete="new-password" />

            <fieldset className="register-gender">
              <legend>Анхны дүр</legend>
              {[["female", "Эмэгтэй"], ["male", "Эрэгтэй"]].map(([value, label]) => (
                <label key={value} className={form.gender === value ? "selected" : ""}>
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={form.gender === value}
                    onChange={() => update("gender", value)}
                    data-testid={`register-gender-${value}`}
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <button type="submit" className="login-btn" data-testid="register-submit-btn" disabled={loading}>
              <span>{loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}</span>
              <span>🚀</span>
            </button>
          </form>

          <p className="register-switch">
            Бүртгэлтэй юу? <Link to="/login" data-testid="go-login-link">Нэвтрэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
