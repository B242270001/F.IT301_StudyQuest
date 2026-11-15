import React, { useState } from "react";
import { authApi } from "../services/api";
import virtualRoomNight from "./assets/virtualRoomNight.jpg";
import "./Login.css";

export default function Login({ onLogin }) {
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNameError("");
    setPasswordError("");

    const trimmedCode = (studentCode || "").trim();
    const trimmedPass = (password || "").trim();

    let hasError = false;
    if (!trimmedCode) {
      setNameError("Оюутны код эсвэл нэрээ оруулна уу");
      hasError = true;
    }
    if (!trimmedPass) {
      setPasswordError("Нууц үгээ оруулна уу");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      const user = await authApi.login(trimmedCode, trimmedPass);
      if (!user) {
        setError("Оюутны код эсвэл нууц үг буруу байна. Дахин оролдоно уу.");
        setLoading(false);
        return;
      }
      // Амжилттай нэвтэрсэн — user объектыг App-руу дамжуулна
      onLogin(user);
    } catch (err) {
      setError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container" data-testid="page-login">
      {/* Зүүн талын хэсэг */}
      <div className="login-left-section">
        <div className="brand-header">
          <span className="brand-logo-icon">✨</span>
          <span className="brand-title">StudyQuest</span>
        </div>

        <div className="hero-text-container">
          <span className="subtitle">Ez суралц</span>
          <h1 className="hero-title">Шинэ өдөр. Шинэ боломж.</h1>
          <p className="hero-desc">
            Унтаал байна уу тэ?
          </p>
        </div>

        <div className="room-preview-box">
          <img
            src={virtualRoomNight}
            className="room-bg-img"
            alt="Virtual Room Night"
          />
        </div>

        <div className="footer-quote">
          <span>Өнөөдөр хийсэн нэг тест шалгалтын 1 оноо шүү. Дуслыг хураавал далай гэж.</span>
        </div>
      </div>

      {/* Баруун талын хэсэг */}
      <div className="login-right-section">
        <div className="top-indicator">
          <span>ТАНЫ СУРАЛЦАХ ОРОН ЗАЙ</span>
        </div>

        <div className="form-wrapper">
          <div className="welcome-header">
            <h2>Тавтай морил!</h2>
          </div>

          {error && (
            <div
              className="login-error"
              data-testid="login-error"
              style={{ color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Оюутны код</label>
              <div className="input-field-wrapper">
                <input
                  type="text"
                  placeholder="temuulen/bagsh"
                  data-testid="login-name-input"
                  value={studentCode}
                  onChange={(e) => {
                    setStudentCode(e.target.value);
                    if (nameError) setNameError("");
                    if (error) setError("");
                  }}
                />
              </div>
              {nameError && (
                <span
                  className="login-name-error"
                  data-testid="login-name-error"
                  style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}
                >
                  {nameError}
                </span>
              )}
            </div>

            <div className="input-group">
              <label>Нууц үг</label>
              <div className="input-field-wrapper">
                <input
                  type="password"
                  placeholder="student123/teacher123"
                  data-testid="login-password-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                    if (error) setError("");
                  }}
                />
              </div>
              {passwordError && (
                <span
                  className="login-password-error"
                  data-testid="login-password-error"
                  style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}
                >
                  {passwordError}
                </span>
              )}
            </div>

            <div className="forgot-password">
              <a href="#forgot">Нууц үгээ мартсан уу?</a>
            </div>

            <button type="submit" className="login-btn" data-testid="login-submit-btn" disabled={loading}>
              <span>{loading ? "Нэвтэрж байна..." : "Сэрэх"}</span>
              <span>🚀</span>
            </button>
          </form>
        </div>

        <div className="bottom-links">
          <span>StudyQuest</span>
          <a href="#help">Тусламж</a>
        </div>
      </div>
    </div>
  );
}
