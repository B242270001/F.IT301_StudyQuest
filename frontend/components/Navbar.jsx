import { NavLink } from "react-router-dom";
import "./Navbar.css";

// Dashboard, Leaderboard зэрэг хуудсуудын нийтлэг топ цэс.
// Идэвхтэй цэсийг одоогийн замаас (route) NavLink өөрөө тодорхойлно.
const menuClass = ({ isActive }) => `room-btn ${isActive ? "active" : "inactive"}`;

export default function Navbar({ user }) {
  // user объектоос мэдээлэл авна (mock-оос ирсэн)
  const displayName = user?.displayName || "Хэрэглэгч";
  const firstName = displayName.split(" ").pop(); // "Б. Тэмүүлэн" → "Тэмүүлэн"
  const avatar = user?.avatar || displayName[0];
  const totalXp = user?.totalXp?.toLocaleString("en-US") || "0";
  const streak = user?.streakDays || 0;

  return (
    <header className="navbar">
      <div className="nav-brand">
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/aN0ksSNPo6/h3krnzrs_expires_30_days.png"
          className="brand-logo"
          alt="Logo"
        />
        <span className="brand-name">StudyQuest</span>
      </div>

      {/* Цэсний товчлууруудыг хооронд нь ойртуулах контейнер */}
      <nav className="nav-menu">
        <NavLink to="/dashboard" className={menuClass}>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/aN0ksSNPo6/ym780a9s_expires_30_days.png"
            className="room-icon"
            alt="Room"
          />
          <span>Миний өрөө</span>
        </NavLink>
        <NavLink to="/practice" className={menuClass}>
          <span>Дадлага</span>
        </NavLink>
        <NavLink to="/explore" className={menuClass}>
          <span>Судлах</span>
        </NavLink>
        <NavLink to="/leaderboard" className={menuClass}>
          <span>Чансаа</span>
        </NavLink>
      </nav>

      <div className="nav-stats">
        <div className="stat-item">
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/aN0ksSNPo6/ndp6yrkn_expires_30_days.png"
            alt="XP"
          />
          <span className="stat-text">{totalXp} XP</span>
        </div>
        <div className="stat-item">
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/aN0ksSNPo6/d12a4c24_expires_30_days.png"
            alt="Streak"
          />
          <span className="stat-text">{streak} өдөр</span>
        </div>
        <button
          className="user-avatar-btn"
          onClick={() => alert("Профайл!")}
        >
          <span>{avatar}</span>
        </button>
        <span className="username">{firstName}</span>
      </div>
    </header>
  );
}
