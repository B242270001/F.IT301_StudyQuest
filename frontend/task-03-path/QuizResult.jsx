import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { mockPath } from "./mock/mockPath";

export default function QuizResult({ user }) {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await mockPath.getLatestAttempt(user?.id || "U05");
      setAttempt(data);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar user={user} />
        <p style={{ textAlign: "center", marginTop: "60px" }}>Үр дүн ачаалж байна...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar user={user} />
        <div data-testid="page-quiz-result" style={{ maxWidth: "500px", margin: "60px auto", background: "#fff", padding: "32px", borderRadius: "16px", textAlign: "center" }}>
          <div data-testid="state-empty">
            <h2>Дадлагын үр дүн олдсонгүй</h2>
            <p style={{ color: "#64748b", margin: "12px 0 20px" }}>Эхлээд сорилоо өгч дуусгана уу.</p>
            <button
              onClick={() => navigate("/practice")}
              style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              Дадлага эхлэх
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = attempt.scorePercent ?? 75;
  const isPassed = score >= 60;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar user={user} />
      <div
        data-testid="page-quiz-result"
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          background: "#fff",
          padding: "40px 32px",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "8px" }}>
          {isPassed ? "🎉" : "💪"}
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>
          {isPassed ? "Баяр хүргэе! Амжилттай дууслаа" : "Дахин хичээгээрэй!"}
        </h1>
        <p style={{ color: "#64748b", marginBottom: "28px" }}>
          Нэгж: {attempt.unitId || "UN04"} • Ахиц амжилттай хадгалагдлаа
        </p>

        {/* Үр дүнгийн картууд */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600", display: "block" }}>ОНОО</span>
            <span data-testid="result-score" style={{ fontSize: "28px", fontWeight: "bold", color: "#15803d" }}>
              {score}%
            </span>
          </div>

          <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
            <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: "600", display: "block" }}>ЗӨВ ХАРИУЛТ</span>
            <span data-testid="result-correct" style={{ fontSize: "28px", fontWeight: "bold", color: "#2563eb" }}>
              {attempt.correctCount ?? 3} / {attempt.totalCount ?? 4}
            </span>
          </div>

          <div style={{ background: "#fefce8", padding: "16px", borderRadius: "12px", border: "1px solid #fef08a" }}>
            <span style={{ fontSize: "12px", color: "#854d0e", fontWeight: "600", display: "block" }}>ЦУГЛУУЛСАН XP</span>
            <span data-testid="result-xp" style={{ fontSize: "28px", fontWeight: "bold", color: "#ca8a04" }}>
              +{attempt.xpEarned ?? 30} XP
            </span>
          </div>
        </div>

        {/* Дахин давах сэдвүүд */}
        {attempt.weakTopics?.length > 0 && (
          <div style={{ textAlign: "left", background: "#fef2f2", padding: "16px", borderRadius: "12px", marginBottom: "28px", border: "1px solid #fecaca" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#991b1b", marginBottom: "8px" }}>
              ⚠️ Дахин давтах шаардлагатай сэдвүүд:
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#b91c1c", fontSize: "13px" }}>
              {attempt.weakTopics.map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Үйлдлийн товчнууд */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            data-testid="result-retry"
            onClick={() => navigate(`/quiz/${attempt.unitId || "UN04"}`)}
            style={{ padding: "12px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: "600" }}
          >
            🔄 Дахин оролдох
          </button>
          <button
            data-testid="result-back-path"
            onClick={() => navigate("/practice/C01")}
            style={{ padding: "12px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: "600" }}
          >
            🗺️ Зам руу очих
          </button>
          <button
            data-testid="result-back-room"
            onClick={() => navigate("/dashboard")}
            style={{ padding: "12px 20px", borderRadius: "10px", border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontWeight: "600" }}
          >
            🏠 Өрөө рүү буцах
          </button>
        </div>
      </div>
    </div>
  );
}
