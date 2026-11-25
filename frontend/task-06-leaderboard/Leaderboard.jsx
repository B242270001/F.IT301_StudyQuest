import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { leaderboardApi } from "../services/api";
import graduationCap from "./assets/leaderboard/graduation-cap.svg";
import crown from "./assets/leaderboard/crown.svg";
import trendingUp from "./assets/leaderboard/trending-up.svg";
import trophy from "./assets/leaderboard/trophy.svg";
import clock from "./assets/leaderboard/clock.svg";
import UserAvatar from "../components/avatar/Avatar";
import "./Leaderboard.css";

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

// Мөр бүрт хэрэглэгчийн өөрийн дүрийн толгой (MongoDB-ийн avatarConfig)
function Avatar({ student, isMe }) {
  return (
    <span className={`lb-avatar ${isMe ? "lb-avatar-me" : ""}`}>
      <UserAvatar config={student.avatarConfig} variant="head" title={student.name} />
    </span>
  );
}

// TASK-06 (Lab 3): Багш чансаанд оролцохгүй тул хуудсыг role-оор хаана (WORK_ALLOCATION шалгуур 1).
export default function Leaderboard({ user }) {
  if (user?.role === "TEACHER") {
    return (
      <div className="lb-page" data-testid="page-leaderboard">
        <Navbar user={user} />
        <main className="lb-content">
          <section className="lb-card lb-forbidden" data-testid="state-forbidden" role="alert">
            <img src={trophy} alt="" />
            <h1>Чансаа зөвхөн оюутнуудад харагдана</h1>
            <p>Багш нар XP цуглуулдаггүй тул чансаанд ордоггүй. Суралцагчдын явцыг багшийн өрөөнөөс харна уу.</p>
            <Link to="/teacher" className="lb-link" data-testid="leaderboard-goto-teacher">
              Багшийн өрөө рүү →
            </Link>
          </section>
        </main>
      </div>
    );
  }
  return <Ranking user={user} />;
}

function Ranking({ user }) {
  const currentUser = { id: user?.id };
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [week] = useState(() => currentWeek(new Date()));

  useEffect(() => {
    Promise.all([leaderboardApi.getWeekly(), leaderboardApi.getAllTime()])
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
              <button
                key={key}
                role="tab"
                aria-selected={period === key}
                className="lb-tab"
                data-testid={`leaderboard-tab-${key}`}
                onClick={() => setPeriod(key)}
              >
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
              <div className="lb-state" role="alert" data-testid="leaderboard-error">
                <p>Чансааг ачаалж чадсангүй.</p>
                <button className="lb-retry" data-testid="leaderboard-retry-btn" onClick={retry}>Дахин оролдох</button>
              </div>
            ) : !data ? (
              <p className="lb-state" data-testid="leaderboard-loading">Ачаалж байна…</p>
            ) : rows.length === 0 ? (
              <p className="lb-state" data-testid="leaderboard-empty">Чансаа бүрдээгүй байна.</p>
            ) : (
              <>
                <ol className="lb-podium" aria-label="Шилдэг гурав" data-testid="leaderboard-podium">
                  {rows.slice(0, 3).map((row) => (
                    <li key={row.id} className="lb-place" data-testid={row.id === currentUser.id ? "leaderboard-row-me" : undefined}>
                      {row.rank === 1 && <img src={crown} alt="" />}
                      {/* Podium дээр дүр бүтнээрээ зогсоно */}
                      <span className="lb-podium-avatar">
                        <UserAvatar config={row.avatarConfig} title={row.name} />
                      </span>
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
                <ol className="lb-list" aria-label="Чансааны жагсаалт" data-testid="leaderboard-list">
                  {rows.slice(3).map((row) => (
                    <li
                      key={row.id}
                      className="lb-row"
                      aria-current={row.id === currentUser.id || undefined}
                      data-testid={row.id === currentUser.id ? "leaderboard-row-me" : undefined}
                    >
                      <span className="lb-rank">{row.rank}</span>
                      <Avatar student={row} isMe={row.id === currentUser.id} />
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
                <section className="lb-progress" data-testid="leaderboard-my-progress">
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
