import { NavLink, useNavigate } from "react-router-dom";
import Avatar from "./avatar/Avatar";
import "./Navbar.css";

// Dashboard, Leaderboard зэрэг хуудсуудын нийтлэг топ цэс.
// Идэвхтэй цэсийг одоогийн замаас (route) NavLink өөрөө тодорхойлно.
const menuClass = ({ isActive }) => `room-btn ${isActive ? "active" : "inactive"}`;

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const displayName = user?.displayName || "Хэрэглэгч";
  const firstName = displayName.split(" ").pop(); // "Б. Тэмүүлэн" → "Тэмүүлэн"
  const totalXp = user?.totalXp?.toLocaleString("en-US") || "0";
  const streak = user?.streakDays || 0;

  return (
    <header className="navbar">
      <div className="nav-brand">
        <span className="brand-name">✨ StudyQuest</span>
      </div>

      {/* Цэсний товчлууруудыг хооронд нь ойртуулах контейнер */}
      <nav className="nav-menu">
        <NavLink to="/dashboard" className={menuClass}>
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
        <NavLink to="/achievements" className={menuClass} data-testid="nav-achievements">
          <span>Тэмдэг</span>
        </NavLink>
      </nav>

      <div className="nav-stats">
        <div className="stat-item">
          <span className="stat-text">⚡ {totalXp} XP</span>
        </div>
        <div className="stat-item">
          <span className="stat-text">🔥 {streak} өдөр</span>
        </div>
        {/* Хэрэглэгчийн дүрийн толгой — дарвал дүр тохируулах хуудас */}
        <button
          type="button"
          className="user-avatar-btn"
          onClick={() => navigate("/profile/avatar")}
          title="Дүрээ өөрчлөх"
          data-testid="nav-avatar-btn"
        >
          <Avatar config={user?.avatarConfig} variant="head" title={displayName} />
        </button>
        <span className="username">{firstName}</span>
      </div>
    </header>
  );
}
