import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PracticeCourses({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. API оролдох, байхгүй бол public/mock/courses.json унших
    fetch('/api/courses/practice')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCourses(data.data || data || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock
        fetch('/mock/courses.json')
          .then((res) => res.json())
          .then((data) => {
            setCourses(data.courses || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  return (
    <div className="practice-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
          Дадлага хичээл сонгох
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Мэдлэгээ баталгаажуулж, интерактив тестийг шийдэж XP цуглуулаарай.
        </p>

        {loading ? (
          <p>Ачаалж байна...</p>
        ) : courses.length === 0 ? (
          <p>Дадлага хичээл одоогоор алга байна.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '12px',
                    }}
                  >
                    {course.category || 'PROGRAMMING'}
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                    {course.title}
                  </h2>
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                    {course.description}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {course.totalUnits ? `${course.totalUnits} нэгж` : 'Бүлэг хичээл'}
                  </span>
                  <Link
                    to={`/practice/${course.id}`}
                    style={{
                      background: '#eb6e25',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    Зам руу очих →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
