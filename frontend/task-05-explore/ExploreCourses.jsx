import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { exploreApi } from '../services/api';

export default function ExploreCourses({ user }) {
  const [lectures, setLectures] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await exploreApi.getLectures();
      setLectures(list);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = lectures.filter(
    (l) =>
      !query ||
      l.title?.toLowerCase().includes(query.toLowerCase()) ||
      l.summary?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
          Мэдлэгийн сан · Судлах
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Бүх интерактив лекц, кодын жишээ, демо туршилтуудыг судалж үзээрэй.
        </p>

        {/* Хайлтын талбар */}
        <div style={{ marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="🔍 Сэдэв эсвэл түлхүүр үгээр хайх..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <p>Лекцүүд ачаалж байна...</p>
        ) : filtered.length === 0 ? (
          <p>Илэрц олдсонгүй.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                      {item.demoType || 'LECTURE'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.id}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
                    {item.summary || item.content?.substring(0, 80) + '...'}
                  </p>
                </div>

                <Link
                  to={`/explore/lecture/${item.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '10px 16px',
                    background: '#0284c7',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginTop: '12px',
                  }}
                >
                  Лекц үзэх 📖
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
