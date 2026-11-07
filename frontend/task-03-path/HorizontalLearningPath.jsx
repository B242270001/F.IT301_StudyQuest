import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { pathApi } from '../services/api';
import './HorizontalLearningPath.css';

export default function HorizontalLearningPath({ user }) {
  const { courseId = 'C01' } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([
    { id: 'C01', title: 'Веб систем ба технологи', progress: 42 },
    { id: 'C02', title: 'Өгөгдлийн бүтэц', progress: 18 },
    { id: 'C03', title: 'Математик II', progress: 8 },
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId);
  const [pathUnits, setPathUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Жишээ зангилаанууд (Зураг дээрх шиг: HTML, CSS, JS, Component, Props, State, Бататгал)
  const defaultUnits = [
    { id: 'U01', title: 'HTML суурь', status: 'COMPLETED', order: 1 },
    { id: 'U02', title: 'CSS загвар', status: 'COMPLETED', order: 2 },
    { id: 'U03', title: 'JavaScript', status: 'COMPLETED', order: 3 },
    { id: 'U04', title: 'Компонент', status: 'CURRENT', order: 4 },
    { id: 'U05', title: 'Props', status: 'AVAILABLE', order: 5 },
    { id: 'U06', title: 'State', status: 'LOCKED', order: 6 },
    { id: 'U07', title: 'Бататгал', status: 'LOCKED', order: 7 },
  ];

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const units = await pathApi.getLearningPath(user?.id || 'U05', selectedCourseId);
        if (!isMounted) return;
        setPathUnits(Array.isArray(units) && units.length > 0 ? units : defaultUnits);
      } catch {
        if (isMounted) {
          setPathUnits(defaultUnits);
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

  const currentUnit = pathUnits.find((u) => u.status === 'CURRENT') || pathUnits[3] || pathUnits[0];
  const completedCount = pathUnits.filter((u) => u.status === 'COMPLETED').length;
  const totalCount = pathUnits.length;

  return (
    <div className="hlp-page-bg" data-testid="page-learning-path">
      <Navbar user={user} />

      <div className="hlp-main-container">
        {/* Толгой хэсэг */}
        <div className="hlp-top-header">
          <div>
            <h1 className="hlp-main-title">Мэдлэгээ нэг алхмаар ахиул</h1>
            <p className="hlp-main-subtitle">Хичээлээ сонгоод, суралцах замаа үргэлжлүүлээрэй.</p>
          </div>
          <div className="hlp-daily-goal-pill">
            <span className="hlp-goal-dot">◎</span>
            <span>Өдрийн зорилго: 50 XP</span>
          </div>
        </div>

        {/* Хичээл сонгох картууд (Дээд хэсэг) */}
        <div className="hlp-courses-grid">
          {courses.map((c) => {
            const isSelected = c.id === selectedCourseId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`hlp-course-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="hlp-course-card-top">
                  <div className="hlp-folder-icon">📁</div>
                  <span className="hlp-course-title">{c.title}</span>
                </div>
                <div className="hlp-progress-container">
                  <div className="hlp-mini-bar">
                    <div className="hlp-mini-fill" style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="hlp-progress-text">{c.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Үндсэн хэвтээ замналын хэсэг */}
        <div className="hlp-path-card" data-testid="state-loaded">
          <div className="hlp-path-header">
            <div className="hlp-chapter-info">
              <span className="hlp-chapter-tag">2-Р БҮЛЭГ</span>
              <h2>Интерактив веб бүтээх</h2>
            </div>
            <div className="hlp-path-legend">
              <span className="hlp-leg-item">✓ 1 · Веб суурь</span>
              <span className="hlp-leg-item active">2 · React</span>
              <span className="hlp-leg-item locked">3 · API</span>
              <span className="hlp-path-counter">{completedCount} / {totalCount} хичээл дууссан</span>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }} data-testid="state-loading">Зам ачаалж байна...</p>
          ) : (
            <div className="hlp-nodes-scroll-area">
              <div className="hlp-nodes-track">
                {pathUnits.map((unit, index) => {
                  const isCompleted = unit.status === 'COMPLETED';
                  const isCurrent = unit.status === 'CURRENT';
                  const isLocked = unit.status === 'LOCKED';
                  const isAvailable = unit.status === 'AVAILABLE';

                  return (
                    <div key={unit.id || index} className="hlp-node-node-wrapper">
                      {/* Зангилаа товч */}
                      <div className="hlp-node-item-col">
                        {isCurrent && <div className="hlp-speech-bubble">Эндээс эхэл</div>}

                        <div
                          data-testid={`path-node-${unit.id}`}
                          onClick={() => {
                            if (!isLocked) navigate(`/quiz/${unit.id}`);
                          }}
                          className={`hlp-circle-node ${
                            isCompleted
                              ? 'completed'
                              : isCurrent
                              ? 'current'
                              : isAvailable
                              ? 'available'
                              : 'locked'
                          }`}
                        >
                          {isCompleted ? (
                            <span className="hlp-icon-check">✓</span>
                          ) : isCurrent ? (
                            <span className="hlp-icon-code">&lt;/&gt;</span>
                          ) : isAvailable ? (
                            <span className="hlp-icon-play">▶</span>
                          ) : (
                            <span className="hlp-icon-lock">🔒</span>
                          )}
                        </div>

                        <span className={`hlp-node-title-label ${isCurrent ? 'active' : ''}`}>
                          {unit.title}
                        </span>
                      </div>

                      {/* Холбогч тахир шугам (Connector curve) */}
                      {index < pathUnits.length - 1 && (
                        <div className={`hlp-connector-line ${isCompleted ? 'completed' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Доод талын тайлбар легенд */}
          <div className="hlp-legend-footer">
            <span>✓ Дууссан</span>
            <span>◎ Одоогийн</span>
            <span>▶ Нээлттэй</span>
            <span>🔒 Түгжээтэй</span>
          </div>
        </div>

        {/* Доод 2 карт (Дараагийн хичээл ба Өдрийн ялалт) */}
        <div className="hlp-bottom-grid">
          {/* Зүүн талын карт */}
          <div className="hlp-bottom-card hlp-next-lesson-card">
            <div className="hlp-card-left-flex">
              <div className="hlp-purple-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7H20M4 12H20M4 17H12" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="hlp-sub-label">ДАРААГИЙН ХИЧЭЭЛ</span>
                <h3 className="hlp-card-title">{currentUnit?.title || 'React компонент'}</h3>
                <p className="hlp-card-sub">3 асуулт · 5 минут · +50 XP</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/quiz/${currentUnit?.id || 'U04'}`)}
              className="hlp-start-btn"
            >
              Эхлэх →
            </button>
          </div>

          {/* Баруун талын карт */}
          <div className="hlp-bottom-card hlp-streak-card">
            <div className="hlp-streak-card-top">
              <div>
                <span className="hlp-sub-label">ӨДРИЙН ЖИЖИГ ЯЛТ</span>
                <h3 className="hlp-card-title">Цувралаа 8 өдөр болгоход нэг хичээл үлдлээ.</h3>
              </div>
              <div className="hlp-flame-emoji">🔥</div>
            </div>
            <div className="hlp-streak-progress-bg">
              <div className="hlp-streak-progress-fill" style={{ width: '0%' }} />
            </div>
            <div className="hlp-streak-counts">0 / 50 XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}