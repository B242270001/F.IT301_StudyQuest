//Lab3
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { pathApi } from '../services/api';
import './HorizontalLearningPath.css';

const DEFAULT_COURSES = [
  { id: 'C01', title: 'Веб систем ба технологи', progress: 42 },
  { id: 'C02', title: 'Өгөгдлийн бүтэц', progress: 18 },
  { id: 'C03', title: 'Математик II', progress: 8 },
];

const DEFAULT_NODES = [
  { id: 'UN01', title: 'HTML суурь', status: 'COMPLETED', unitGroup: 1, pos: 'up', icon: 'check' },
  { id: 'UN02', title: 'CSS загвар', status: 'COMPLETED', unitGroup: 1, pos: 'down', icon: 'check' },
  { id: 'UN03', title: 'JavaScript', status: 'COMPLETED', unitGroup: 1, pos: 'up', icon: 'check' },
  { id: 'UN04', title: 'Компонент', status: 'CURRENT', unitGroup: 2, pos: 'up', icon: 'code' },
  { id: 'UN05', title: 'Props', status: 'AVAILABLE', unitGroup: 2, pos: 'down', icon: 'play' },
  { id: 'UN06', title: 'State', status: 'LOCKED', unitGroup: 2, pos: 'up', icon: 'lock' },
  { id: 'UN07', title: 'Бататгал', status: 'LOCKED', unitGroup: 2, pos: 'down', icon: 'flag' },
];

export default function HorizontalLearningPath({ user }) {
  const { courseId = 'C01' } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [selectedCourseId, setSelectedCourseId] = useState(courseId);
  const [pathUnits, setPathUnits] = useState(DEFAULT_NODES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const units = await pathApi.getLearningPath(user?.id || 'U05', selectedCourseId);
        if (!isMounted) return;

        if (Array.isArray(units) && units.length > 0) {
          // API-аас ирсэн нэгжүүдийг долгионтой байрлалд (up/down) хөрвүүлэх
          const mapped = units.map((u, idx) => {
            const fallback = DEFAULT_NODES[idx] || {};
            const positions = ['up', 'down', 'up', 'up', 'down', 'up', 'down'];
            let iconType = 'lock';
            if (u.status === 'COMPLETED') iconType = 'check';
            else if (u.status === 'CURRENT') iconType = 'code';
            else if (u.status === 'AVAILABLE' || idx === 4) iconType = 'play';
            else if (idx === units.length - 1 && units.length >= 6) iconType = 'flag';

            return {
              ...fallback,
              ...u,
              pos: positions[idx % positions.length],
              unitGroup: idx < 3 ? 1 : 2,
              icon: iconType,
            };
          });
          setPathUnits(mapped);
        } else {
          setPathUnits(DEFAULT_NODES);
        }
      } catch {
        if (isMounted) {
          setPathUnits(DEFAULT_NODES);
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
  }, [selectedCourseId, user]);

  const currentUnit =
    pathUnits.find((u) => u.status === 'CURRENT') || pathUnits[3] || pathUnits[0];
  const completedCount = pathUnits.filter((u) => u.status === 'COMPLETED').length;
  const totalCount = pathUnits.length || 7;

  const handleCourseSelect = (id) => {
    setSelectedCourseId(id);
    navigate(`/practice/${id}`);
  };

  const handleNodeClick = (unit) => {
    if (unit.status !== 'LOCKED') {
      navigate(`/quiz/${unit.id}`);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const renderNodeIcon = (unit) => {
    if (unit.status === 'COMPLETED' || unit.icon === 'check') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17L4 12"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (unit.status === 'CURRENT' || unit.icon === 'code') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 9L4 12L8 15M16 9L20 12L16 15M13.5 6L10.5 18"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (unit.status === 'AVAILABLE' || unit.icon === 'play') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polygon
            points="8,5 19,12 8,19"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    }
    if (unit.icon === 'flag') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 21V4M5 4H19L17 9L19 14H5"
            stroke="#a1a1aa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect
          x="5"
          y="11"
          width="14"
          height="10"
          rx="2"
          stroke="#a1a1aa"
          strokeWidth="2"
        />
        <path
          d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
          stroke="#a1a1aa"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="sq-path-page" data-testid="page-learning-path">
      <Navbar user={user} />

      <main className="sq-path-container">
        {/* 1. Дээд гарчиг ба Зорилго */}
        <header className="sq-top-bar">
          <div>
            <h1 className="sq-page-title">Мэдлэгээ нэг алхмаар ахиул</h1>
            <p className="sq-page-subtitle">
              Хичээлээ сонгоод, суралцах замаа үргэлжлүүлээрэй.
            </p>
          </div>

          <div className="sq-goal-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" stroke="#7c3aed" strokeWidth="2" />
              <circle cx="12" cy="12" r="1.5" fill="#7c3aed" />
            </svg>
            <span>Өнөөдрийн зорилго: 50 XP</span>
          </div>
        </header>

        {/* 2. Хичээл сонгох 3 карт */}
        <section className="sq-courses-row">
          {DEFAULT_COURSES.map((course) => {
            const isSelected = course.id === selectedCourseId;
            return (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className={`sq-course-item ${isSelected ? 'active' : ''}`}
              >
                <div className={`sq-folder-box ${isSelected ? 'active' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                      stroke={isSelected ? '#ffffff' : '#71717a'}
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="sq-course-details">
                  <div className="sq-course-name">{course.title}</div>
                  <div className="sq-course-prog-row">
                    <div className="sq-course-prog-track">
                      <div
                        className="sq-course-prog-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="sq-course-prog-pct">{course.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* 3. Хэвтээ суралцах замын үндсэн карт */}
        <section className="sq-roadmap-card">
          {/* Бүлгийн нил ягаан толгой мөр */}
          <div className="sq-roadmap-header">
            <div className="sq-roadmap-header-left">
              <div className="sq-branch-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="6" cy="6" r="3" stroke="#7c3aed" strokeWidth="2" />
                  <circle cx="18" cy="12" r="3" stroke="#7c3aed" strokeWidth="2" />
                  <circle cx="6" cy="18" r="3" stroke="#7c3aed" strokeWidth="2" />
                  <path
                    d="M9 6H13C14.6569 6 16 7.34315 16 9V9M9 18H13C14.6569 18 16 16.6569 16 15V15"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <span className="sq-chapter-overline">2-Р БҮЛЭГ</span>
                <h2 className="sq-chapter-heading">Интерактив веб бүтээх</h2>
              </div>
            </div>

            <div className="sq-chapter-pills">
              <span className="sq-ch-pill done">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#52525b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                1 · Веб суурь
              </span>
              <span className="sq-ch-pill current">2 · React</span>
              <span className="sq-ch-pill locked">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="#71717a"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
                    stroke="#71717a"
                    strokeWidth="2"
                  />
                </svg>
                3 · API
              </span>
            </div>

            <div className="sq-chapter-count">
              {completedCount} / {totalCount} хичээл дууссан
            </div>
          </div>

          {/* Замналын их бие */}
          {loading ? (
            <div className="sq-loading-box" data-testid="state-loading">
              Зам ачаалж байна...
            </div>
          ) : (
            <div className="sq-roadmap-body" ref={scrollRef}>
              <div className="sq-wave-canvas">
                {/* Босоо тусгаарлагч шугам (Нэгж 1 ба Нэгж 2-ын хооронд) */}
                <div className="sq-unit-divider" />

                {/* НЭГЖ 1 ба НЭГЖ 2 гарчгууд */}
                <div className="sq-unit-headers-row">
                  <div className="sq-unit-header-item unit-1">
                    <span className="sq-unit-pill green">НЭГЖ 1</span>
                    <span className="sq-unit-name">Вебийн үндэс</span>
                  </div>

                  <div className="sq-unit-header-item unit-2">
                    <span className="sq-unit-pill purple">НЭГЖ 2</span>
                    <span className="sq-unit-name">React эхлэл</span>
                  </div>
                </div>

                {/* Ар талын тахирласан долгионтой зам (SVG) */}
                <svg
                  className="sq-wave-svg"
                  viewBox="0 0 960 150"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  {/* Дууссан болон идэвхтэй хэсгийн нил ягаан зам (Node 1 -> Node 4) */}
                  <path
                    d="M 85 56 C 145 56, 155 100, 215 100 C 275 100, 285 56, 345 56 L 505 56"
                    stroke="#c4b5fd"
                    strokeWidth="15"
                    strokeLinecap="round"
                  />
                  {/* Цааш үргэлжлэх бүдэг зам (Node 4 -> Node 7) */}
                  <path
                    d="M 505 56 C 565 56, 575 100, 635 100 C 695 100, 705 56, 765 56 C 825 56, 835 100, 885 100"
                    stroke="#eceaf6"
                    strokeWidth="15"
                    strokeLinecap="round"
                  />
                </svg>

                {/* 7 Зангилаа (Nodes) */}
                <div className="sq-nodes-flex">
                  {pathUnits.map((unit, index) => {
                    const isCompleted = unit.status === 'COMPLETED';
                    const isCurrent = unit.status === 'CURRENT';
                    const isAvailable =
                      unit.status === 'AVAILABLE' || (!isCompleted && !isCurrent && index === 4);
                    const isLocked = !isCompleted && !isCurrent && !isAvailable;
                    const posClass = unit.pos === 'down' ? 'pos-down' : 'pos-up';

                    return (
                      <div
                        key={unit.id || index}
                        className={`sq-node-slot ${posClass} ${index === 3 ? 'after-divider' : ''}`}
                      >
                        {isCurrent && (
                          <div className="sq-start-here-pill">ЭНДЭЭС ЭХЭЛ</div>
                        )}

                        <div
                          data-testid={`path-node-${unit.id}`}
                          onClick={() => handleNodeClick(unit)}
                          className={`sq-node-btn-wrap ${isCurrent ? 'current-ring' : ''}`}
                        >
                          <div
                            className={`sq-node-3d-circle ${
                              isCompleted
                                ? 'node-completed'
                                : isCurrent
                                ? 'node-current'
                                : isAvailable
                                ? 'node-available'
                                : 'node-locked'
                            }`}
                          >
                            {renderNodeIcon(unit)}
                          </div>
                        </div>

                        <span
                          className={`sq-node-caption ${
                            isLocked ? 'caption-locked' : ''
                          }`}
                        >
                          {unit.title}
                        </span>
                      </div>
                    );
                  })}

                  {/* Баруун талын сум */}
                  <button
                    type="button"
                    onClick={handleScrollRight}
                    className="sq-wave-next-arrow"
                    aria-label="Дараагийн хэсэг"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. Доод 2 карт (Дараагийн хичээл & Өдрийн жижиг ялалт) */}
        <section className="sq-bottom-cards">
          {/* Зүүн карт */}
          <div className="sq-next-card">
            <div className="sq-next-left">
              <div className="sq-next-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="9"
                    rx="2"
                    stroke="#7c3aed"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="5"
                    rx="1.5"
                    stroke="#7c3aed"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="14"
                    y="12"
                    width="7"
                    height="9"
                    rx="2"
                    stroke="#7c3aed"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="3"
                    y="16"
                    width="7"
                    height="5"
                    rx="1.5"
                    stroke="#7c3aed"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>

              <div>
                <span className="sq-next-tag">ДАРААГИЙН ХИЧЭЭЛ</span>
                <h3 className="sq-next-title">
                  {currentUnit?.title === 'Компонент'
                    ? 'React компонент'
                    : currentUnit?.title || 'React компонент'}
                </h3>
                <p className="sq-next-meta">3 асуулт · 5 минут · +50 XP</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/quiz/${currentUnit?.id || 'UN04'}`)}
              className="sq-start-cta"
            >
              <span>Эхлэх</span>
              <span>→</span>
            </button>
          </div>

          {/* Баруун карт */}
          <div className="sq-win-card">
            <div className="sq-win-header">
              <h3 className="sq-win-title">Өдрийн жижиг ялалт</h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C16.4183 22 20 18.4183 20 14C20 9.5 15.5 6.5 13.5 2C11.5 5.5 8 7.5 8 12C6.5 11.5 5.5 10 5.5 10C4.5 11.5 4 12.8 4 14C4 18.4183 7.58172 22 12 22Z"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="sq-win-desc">
              Цувралаа 8 өдөр болгоход нэг хичээл үлдлээ.
            </p>

            <div className="sq-win-prog-row">
              <div className="sq-win-prog-track">
                <div className="sq-win-prog-fill" style={{ width: '0%' }} />
              </div>
              <span className="sq-win-xp-label">0 / 50 XP</span>
            </div>
          </div>
        </section>

        {/* 5. Доод талын төлөвийн тайлбар (Footer Legend) */}
        <footer className="sq-bottom-legend">
          <div className="sq-legend-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="#71717a"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Дууссан</span>
          </div>

          <div className="sq-legend-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="#71717a" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="#71717a" />
            </svg>
            <span>Одоогийн</span>
          </div>

          <div className="sq-legend-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polygon
                points="8,5 19,12 8,19"
                stroke="#71717a"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span>Нээлттэй</span>
          </div>

          <div className="sq-legend-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="11"
                width="14"
                height="10"
                rx="2"
                stroke="#71717a"
                strokeWidth="2"
              />
              <path
                d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
                stroke="#71717a"
                strokeWidth="2"
              />
            </svg>
            <span>Түгжээтэй</span>
          </div>
        </footer>
      </main>
    </div>
  );
}