import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute — TASK-01 (А. Төгөлдөр)
 *
 * Хандалтын шалгалт (Role guard):
 * - Нэвтрээгүй бол: state-login-required карт харуулна эсвэл /login руу шилжүүлнэ
 * - Шаардлагатай role таарахгүй бол: state-forbidden карт харуулна
 */
export default function ProtectedRoute({ user, requiredRole, children }) {
  const location = useLocation();

  if (!user) {
    return (
      <div
        className="state-card state-login-required"
        data-testid="state-login-required"
        style={{
          maxWidth: "480px",
          margin: "80px auto",
          padding: "32px",
          background: "#1f1838",
          border: "1px solid #7c5cfc",
          borderRadius: "16px",
          textAlign: "center",
          color: "#f3f4f6",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Нэвтрэх шаардлагатай</h2>
        <p style={{ color: "#c4b5fd", fontSize: "14px", marginBottom: "20px" }}>
          Энэ хуудсыг үзэхийн тулд системд нэвтэрнэ үү.
        </p>
        <a
          href="/login"
          data-testid="goto-login-btn"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#7c3aed",
            color: "#ffffff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Нэвтрэх хуудас руу очих
        </a>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div
        className="state-card state-forbidden"
        data-testid="state-forbidden"
        style={{
          maxWidth: "480px",
          margin: "80px auto",
          padding: "32px",
          background: "#1f1838",
          border: "1px solid #ef4444",
          borderRadius: "16px",
          textAlign: "center",
          color: "#f3f4f6",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚫</div>
        <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "#f87171" }}>
          403 - Хандах эрх хүрэлцэхгүй
        </h2>
        <p style={{ color: "#c4b5fd", fontSize: "14px", marginBottom: "20px" }}>
          Энэ хуудас зөвхөн {requiredRole === "TEACHER" ? "Багш" : requiredRole} эрхтэй
          хэрэглэгчид зориулагдсан байна.
        </p>
        <a
          href="/dashboard"
          data-testid="goto-dashboard-btn"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#4b5563",
            color: "#ffffff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Миний өрөө рүү буцах
        </a>
      </div>
    );
  }

  return children;
}
