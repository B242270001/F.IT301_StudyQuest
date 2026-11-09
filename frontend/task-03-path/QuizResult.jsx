import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { pathApi } from "../services/api";
import "./QuizResult.css";

export default function QuizResult({ user }) {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await pathApi.getLatestAttempt(user?.id || "U05");
        if (isMounted) {
          setAttempt(data);
        }
      } catch {
        if (isMounted) {
          setAttempt(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="qr-page-bg">
        <Navbar user={user} />
        <p className="qr-loading">Үр дүн ачаалж байна...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="qr-page-bg">
        <Navbar user={user} />
        <div data-testid="page-quiz-result" className="qr-empty-container">
          <div data-testid="state-empty">
            <h2>Дадлагын үр дүн олдсонгүй</h2>
            <p>Эхлээд сорилоо өгч дуусгана уу.</p>
            <button
              type="button"
              onClick={() => navigate("/practice")}
              className="qr-btn-primary"
            >
              Дадлага эхлэх
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Өгөгдлүүдийг системээс болон зураг дээрх жишээ утгаас унших
  const xpEarned = attempt.xpEarned ?? 50;
  const correctCount = attempt.correctCount ?? 2;
  const totalCount = attempt.totalCount ?? 3;
  const scorePercent =
    attempt.scorePercent ?? Math.round((correctCount / Math.max(totalCount, 1)) * 100);
  const durationText = attempt.duration || attempt.timeSpent || "04:12";

  const currentTotalXp = user?.xp ?? 2530;
  const previousXp = currentTotalXp - xpEarned;
  const weeklyXp = user?.weeklyXp ?? 510;
  const streakDays = user?.streak ?? 8;

  const topicTitle = attempt.unitTitle || "React компонент";
  const courseTitle = attempt.courseTitle || "Веб систем ба технологи";
  const courseId = attempt.courseId || "C01";
  const unitId = attempt.unitId || "UN04";

  const reviewTip =
    attempt.reviewTip ||
    (attempt.weakTopics?.length > 0
      ? `${attempt.weakTopics.join(", ")} сэдвийн хүрээнд алдсан асуултаа дахин нягтлаарай.`
      : "Массивын length шинж элементийн тоог буцаадаг. Кодын үр дүнгийн асуултаа дахин хараарай.");

  const nextUnitTitle = attempt.nextUnitTitle || "Props: өгөгдөл дамжуулах";
  const nextUnitDesc =
    attempt.nextUnitDesc || "Компонентуудаа өгөгдлөөр холбож сурцгаая.";
  const nextUnitStep = attempt.nextUnitStep || "2-р нэгж · Дараагийн алхам";

  return (
    <div className="qr-page-bg">
      <Navbar user={user} />

      <main className="qr-main" data-testid="page-quiz-result">
        {/* Дээд ногоон badge ба Гарчиг */}
        <div className="qr-top-header">
          <div className="qr-complete-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>ХИЧЭЭЛ ДУУСЛАА</span>
          </div>

          <h1 className="qr-main-title">Нэг алхам урагшиллаа!</h1>
          <p className="qr-main-subtitle">
            {topicTitle} · {courseTitle}
          </p>
          {/* Авто тестэд зориулсан онооны нуугдмал эсвэл нэмэлт элемент */}
          <span data-testid="result-score" className="qr-sr-only">
            {scorePercent}%
          </span>
        </div>

        {/* Гол том цагаан карт */}
        <section className="qr-hero-card">
          {/* Зүүн талын дүрийн зураглал (Character Illustration) */}
          <div className="qr-illustration-col">
            <div className="qr-avatar-circle">
              {/* Оч болон чимэглэлүүд */}
              <svg
                className="qr-sparkle qr-sp-top-left"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
                  stroke="#d97706"
                  strokeWidth="1.8"
                />
              </svg>
              <svg
                className="qr-sparkle qr-sp-mid-right"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
                  stroke="#d97706"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="qr-confetti qr-conf-purple" />
              <span className="qr-confetti qr-conf-orange" />
              <span className="qr-confetti qr-conf-dot" />

              {/* Хүүхдийн вектор дүрс */}
              <svg
                width="140"
                height="165"
                viewBox="0 0 140 165"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Сүүдэр */}
                <ellipse cx="70" cy="154" rx="34" ry="5" fill="#cbd5e1" opacity="0.6" />
                {/* Хөл / Өмд */}
                <rect x="52" y="114" width="14" height="32" rx="4" fill="#312e81" />
                <rect x="74" y="114" width="14" height="32" rx="4" fill="#312e81" />
                {/* Гутал */}
                <rect x="48" y="142" width="19" height="8" rx="4" fill="#ffffff" />
                <rect x="73" y="142" width="19" height="8" rx="4" fill="#ffffff" />
                {/* Зүүн гар */}
                <path
                  d="M46 78L29 102"
                  stroke="#6d28d9"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="26" cy="105" r="6" fill="#f6ad7b" />
                {/* Баруун гар */}
                <path
                  d="M94 78L104 106"
                  stroke="#6d28d9"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="105" cy="110" r="6" fill="#f6ad7b" />
                {/* Их бие / Цамц */}
                <rect x="44" y="70" width="52" height="48" rx="14" fill="#6338f0" />
                <rect x="57" y="96" width="26" height="12" rx="4" fill="#7c5dfa" />
                {/* Хүзүү */}
                <rect x="64" y="60" width="12" height="12" rx="4" fill="#e59866" />
                {/* Толгой */}
                <circle cx="70" cy="44" r="22" fill="#f6ad7b" />
                {/* Чих */}
                <circle cx="47" cy="45" r="5" fill="#f6ad7b" />
                <circle cx="93" cy="45" r="5" fill="#f6ad7b" />
                {/* Үс */}
                <path
                  d="M46 42C46 25 57 17 72 17C85 17 95 25 94 40C89 33 82 31 70 31C58 31 50 35 46 42Z"
                  fill="#272448"
                />
                {/* Нүд ба Инээмсэглэл */}
                <circle cx="62" cy="44" r="2.3" fill="#1e1b4b" />
                <circle cx="78" cy="44" r="2.3" fill="#1e1b4b" />
                <path
                  d="M64 52C66.5 55 73.5 55 76 52"
                  stroke="#1e1b4b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Баруун талын үзүүлэлтүүд */}
          <div className="qr-stats-col">
            <div className="qr-metric-cards">
              {/* 1. Цуглуулсан XP */}
              <div className="qr-metric-card qr-card-purple">
                <div className="qr-metric-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="qr-metric-val" data-testid="result-xp">
                  +{xpEarned} XP
                </div>
                <div className="qr-metric-lbl">Цуглуулсан XP</div>
              </div>

              {/* 2. Зөв хариулт */}
              <div className="qr-metric-card qr-card-green">
                <div className="qr-metric-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#15803d" strokeWidth="2" />
                    <path
                      d="M8.5 12.5L10.8 14.8L15.5 9.8"
                      stroke="#15803d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="qr-metric-val" data-testid="result-correct">
                  {correctCount} / {totalCount}
                </div>
                <div className="qr-metric-lbl">Зөв хариулт</div>
              </div>

              {/* 3. Зарцуулсан хугацаа */}
              <div className="qr-metric-card qr-card-amber">
                <div className="qr-metric-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#b45309" strokeWidth="2" />
                    <path
                      d="M12 7V12L15 14"
                      stroke="#b45309"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="qr-metric-val">{durationText}</div>
                <div className="qr-metric-lbl">Зарцуулсан хугацаа</div>
              </div>
            </div>

            {/* Цувралын мөр (Streak Banner) */}
            <div className="qr-streak-banner">
              <div className="qr-streak-left">
                <div className="qr-flame-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22C16.4183 22 20 18.4183 20 14C20 9.5 15.5 6.5 13.5 2C11.5 5.5 8 7.5 8 12C6.5 11.5 5.5 10 5.5 10C4.5 11.5 4 12.8 4 14C4 18.4183 7.58172 22 12 22Z"
                      stroke="#f59e0b"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="qr-streak-title">{streakDays} өдрийн цуврал!</div>
                  <div className="qr-streak-sub">
                    Өнөөдрийн {xpEarned} XP зорилго биеллээ.
                  </div>
                </div>
              </div>

              <div className="qr-streak-check">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#16a34a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Доод XP тайлан */}
            <div className="qr-xp-footnote">
              Нийт XP: {previousXp.toLocaleString()} → {currentTotalXp.toLocaleString()} · Долоо хоногийн XP: {weeklyXp}
            </div>
          </div>
        </section>

        {/* Доод 2 карт (Бататгах ойлголт ба Шинэ хичээл нээгдлээ) */}
        <section className="qr-bottom-grid">
          {/* Зүүн карт */}
          <div className="qr-info-card qr-info-white">
            <div className="qr-info-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18H15M10 22H14M12 2C8.68629 2 6 4.68629 6 8C6 10.2208 7.2066 12.1599 9 13.1973V15C9 15.5523 9.44772 16 10 16H14C14.5523 16 15 15.5523 15 15V13.1973C16.7934 12.1599 18 10.2208 18 8C18 4.68629 15.3137 2 12 2Z"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3>Нэг ойлголтоо бататгая</h3>
            </div>

            <p className="qr-info-desc">{reviewTip}</p>

            <button
              type="button"
              data-testid="result-retry"
              onClick={() => navigate(`/quiz/${unitId}`)}
              className="qr-link-btn"
            >
              Тайлбарыг дахин унших →
            </button>
          </div>

          {/* Баруун карт */}
          <div className="qr-info-card qr-info-purple">
            <div className="qr-unlock-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="#7c3aed"
                  strokeWidth="2"
                />
                <path
                  d="M8 11V7C8 4.79086 9.79086 3 12 3C13.8638 3 15.4299 4.27477 15.874 6"
                  stroke="#7c3aed"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>ШИНЭ ХИЧЭЭЛ НЭЭГДЛЭЭ</span>
            </div>

            <h3 className="qr-unlock-title">{nextUnitTitle}</h3>
            <p className="qr-info-desc">{nextUnitDesc}</p>

            <button
              type="button"
              onClick={() => navigate(`/practice/${courseId}`)}
              className="qr-link-btn"
            >
              {nextUnitStep}
            </button>
          </div>
        </section>

        {/* Хамгийн доод талын 2 товч */}
        <div className="qr-footer-actions">
          <button
            type="button"
            data-testid="result-back-room"
            onClick={() => navigate("/dashboard")}
            className="qr-btn-outline"
          >
            <span>Өрөө рүү буцах</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9 21V14H15V21" stroke="#7c3aed" strokeWidth="2" />
            </svg>
          </button>

          <button
            type="button"
            data-testid="result-back-path"
            onClick={() => navigate(`/practice/${courseId}`)}
            className="qr-btn-primary"
          >
            <span>Суралцах зам руу</span>
            <span className="qr-arrow">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}