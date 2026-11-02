import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { mockPath } from './mock/mockPath';

export default function HorizontalLearningPath({ user }) {
  const { courseId = 'C01' } = useParams();
  const navigate = useNavigate();

  const [pathUnits, setPathUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const units = await mockPath.getLearningPath(user?.id || 'U05', courseId);
      setPathUnits(units);
      setLoading(false);
    }
    load();
  }, [courseId, user]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>Сургалтын замнал</h1>
            <p style={{ color: '#64748b' }}>Нэгжүүдийг дарааллын дагуу давж, дараагийн түвшнийг нээгээрэй.</p>
          </div>
          <button
            onClick={() => navigate('/practice')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            ← Хичээл солих
          </button>
        </div>

        {loading ? (
          <p>Зам ачаалж байна...</p>
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px 24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              overflowX: 'auto',
            }}
          >
            {/* Хэвтээ чиглэлтэй зангилаанууд */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', minWidth: '700px', padding: '20px 10px' }}>
              {pathUnits.map((unit, index) => {
                const isCompleted = unit.status === 'COMPLETED';
                const isCurrent = unit.status === 'CURRENT';
                const isLocked = unit.status === 'LOCKED';

                return (
                  <div key={unit.id} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {/* Зангилаа карт */}
                    <div
                      onClick={() => {
                        if (!isLocked) navigate(`/quiz/${unit.id}`);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.6 : 1,
                        transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Тойрог icon */}
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#fff',
                          background: isCompleted
                            ? '#22c55e'
                            : isCurrent
                            ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                            : '#94a3b8',
                          boxShadow: isCurrent
                            ? '0 0 0 6px rgba(37, 99, 235, 0.2), 0 8px 16px rgba(37, 99, 235, 0.3)'
                            : 'none',
                        }}
                      >
                        {isCompleted ? '✓' : isLocked ? '🔒' : '▶'}
                      </div>

                      {/* Текст мэдээлэл */}
                      <div style={{ textAlign: 'center', marginTop: '12px', width: '130px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                          Нэгж {index + 1}
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginTop: '2px' }}>
                          {unit.title}
                        </div>
                        {isCompleted && (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                            {unit.score}% авсан
                          </span>
                        )}
                        {isCurrent && (
                          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>
                            Идэвхтэй сорил
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Холбогч шугам */}
                    {index < pathUnits.length - 1 && (
                      <div
                        style={{
                          width: '40px',
                          height: '4px',
                          background: isCompleted ? '#22c55e' : '#cbd5e1',
                          margin: '0 8px',
                          marginBottom: '40px',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
