import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { mockLeaderboard } from "./mock/mockLeaderboard";
import graduationCap from "./assets/leaderboard/graduation-cap.svg";
import crown from "./assets/leaderboard/crown.svg";
import trendingUp from "./assets/leaderboard/trending-up.svg";
import trophy from "./assets/leaderboard/trophy.svg";
import clock from "./assets/leaderboard/clock.svg";
import anujin from "./assets/leaderboard/portrait-anujin.svg";
import saruul from "./assets/leaderboard/portrait-saruul.svg";
import bilguun from "./assets/leaderboard/portrait-bilguun.svg";
import "./Leaderboard.css";

const currentUser = { id: "U05" };
const portraits = { U01: anujin, U02: saruul, U03: bilguun };
const avatarColors = ["#f7eadf", "#eee9ff", "#e3f1ee", "#e7edfa"];
const tabs = [
  ["weekly", "Энэ долоо хоног"],
  ["allTime", "Бүх цаг"],
];

const formatXp = (xp) => `${xp.toLocaleString("en-US")} XP`;
const monthDay = (date) => `${date.getMonth() + 1}-р сарын ${date.getDate()}`;

function currentWeek(now) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  const last = new Date(end - 1);
  const hoursLeft = Math.floor((end - now) / 3600000);
  return {
    range: start.getMonth() === last.getMonth() ? `${monthDay(start)}–${last.getDate()}` : `${monthDay(start)} – ${monthDay(last)}`,
    left: `Дуусахад ${Math.floor(hoursLeft / 24)} өдөр ${hoursLeft % 24} цаг`,
  };
}

function changeText(change) {
  if (change > 0) return `Өнгөрсөн долоо хоногоос ${change} байр урагшиллаа!`;
  if (change < 0) return `Өнгөрсөн долоо хоногоос ${-change} байр ухарлаа.`;
  return "Өнгөрсөн долоо хоногийн байраа хадгаллаа.";
}

function Avatar({ student }) {
  // Өөрийн аватар нь Navbar-ынхтай адилхан (нил ягаан, цагаан үсэг)
  if (student.id === currentUser.id) {
    return <span className="lb-avatar lb-avatar-me">{student.name.split(" ").pop()[0]}</span>;
  }
  return (
    <span className="lb-avatar" style={{ background: avatarColors[Number(student.id.slice(1)) % avatarColors.length] }}>
      {student.name.split(" ").pop()[0]}
    </span>
  );
}

export default function Leaderboard({ user }) {
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [week] = useState(() => currentWeek(new Date()));

  useEffect(() => {
    // Бие даалт 1: mock өгөгдөл (public/mock). Бие даалт 2-т `/api/leaderboard?period=${p}` болгоно.
    const load = (p) =>
      fetch(`/mock/leaderboard-${p}.json`).then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      });
    Promise.all([load("weekly"), load("allTime")])
      .then(([weekly, allTime]) => setData({ weekly, allTime }))
      .catch(() => setError(true));
  }, [attempt]);

  const retry = () => {
    setError(false);
    setAttempt(attempt + 1);
  };

  const rows = data ? data[period] : [];
  const findMe = (list) => list.find((row) => row.id === currentUser.id);
  const me = findMe(rows);
  const weeklyMe = data && findMe(data.weekly);
  const totalMe = data && findMe(data.allTime);
  const ahead = me && rows[me.rank - 2];

  return (
    <div className="lb-page" data-testid="page-leaderboard">
      <Navbar user={user} />

      <main className="lb-content">
        <div className="lb-heading">
          <div className="lb-title">
            <h1>Хамтдаа илүү хол хүрнэ</h1>
            <p>Хичээл бүр ахиц. Ахиц бүр үнэ цэнтэй.</p>
          </div>
          <div className="lb-tabs" role="tablist">
            {tabs.map(([key, label]) => (
              <button key={key} role="tab" aria-selected={period === key} className="lb-tab" onClick={() => setPeriod(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="lb-layout">
          <section className="lb-card">
            <div className="lb-card-top">
              <span className="lb-chip">
                <img src={graduationCap} alt="" />
                ИХ СУРГУУЛИЙН ЛИГ
              </span>
              {period === "weekly" && <span className="lb-range">{week.range}</span>}
            </div>

            {error ? (
              <div className="lb-state" role="alert">
                <p>Чансааг ачаалж чадсангүй.</p>
                <button className="lb-retry" onClick={retry}>Дахин оролдох</button>
              </div>
            ) : !data ? (
              <p className="lb-state">Ачаалж байна…</p>
            ) : rows.length === 0 ? (
              <p className="lb-state">Чансаа бүрдээгүй байна.</p>
            ) : (
              <>
                <ol className="lb-podium" aria-label="Шилдэг гурав">
                  {rows.slice(0, 3).map((row) => (
                    <li key={row.id} className="lb-place">
                      {row.rank === 1 && <img src={crown} alt="" />}
                      {portraits[row.id] ? <img src={portraits[row.id]} alt="" /> : <Avatar student={row} />}
                      <p className="lb-place-name">{row.name}</p>
                      <p className="lb-place-xp">{formatXp(row.xp)}</p>
                      <div className="lb-block">{row.rank}</div>
                    </li>
                  ))}
                </ol>
                <div className="lb-table-head">
                  <span>БАЙР / ОЮУТАН</span>
                  <span>{period === "weekly" ? "ДОЛОО ХОНОГИЙН XP" : "НИЙТ XP"}</span>
                </div>
                <ol className="lb-list" aria-label="Чансааны жагсаалт">
                  {rows.slice(3).map((row) => (
                    <li key={row.id} className="lb-row" aria-current={row.id === currentUser.id || undefined}>
                      <span className="lb-rank">{row.rank}</span>
                      <Avatar student={row} />
                      <div className="lb-student">
                        <p className="lb-name">
                          {row.name}
                          {row.id === currentUser.id && <span className="lb-me">ЧИ</span>}
                        </p>
                        <p className="lb-major">{row.major}</p>
                      </div>
                      <span className="lb-xp">{formatXp(row.xp)}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <aside className="lb-side">
            {me && (
              <>
                <section className="lb-progress">
                  <div className="lb-progress-head">
                    <h2>Чиний ахиц</h2>
                    <img src={trendingUp} alt="" />
                  </div>
                  <p className="lb-my-rank">
                    <strong>{me.rank}</strong> дугаар байр
                  </p>
                  <p className="lb-change">{changeText(weeklyMe.change)}</p>
                  <hr />
                  <p className="lb-stat-line">
                    Энэ долоо хоног <strong>{formatXp(weeklyMe.xp)}</strong>
                  </p>
                  <p className="lb-stat-line">
                    Нийт цуглуулсан <strong>{formatXp(totalMe.xp)}</strong>
                  </p>
                </section>
                <section className="lb-note">
                  <img src={trophy} alt="" />
                  <h2>{ahead ? "Дараагийн байр ойрхон!" : "Чи тэргүүлж байна!"}</h2>
                  <p>
                    {ahead
                      ? `${ahead.xp - me.xp} XP цуглуулбал ${ahead.rank}-р байрт хүрнэ. Нэг хичээлээс эхлээрэй.`
                      : "Байраа хадгалахын тулд дадлагаа үргэлжлүүлээрэй."}
                  </p>
                  <span className="lb-chip">
                    <img src={clock} alt="" />
                    {week.left}
                  </span>
                  <Link to="/practice" className="lb-link">Дадлага хийх →</Link>
                </section>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
