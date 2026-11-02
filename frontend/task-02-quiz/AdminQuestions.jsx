import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { mockQuiz } from './mock/mockQuiz';

export default function AdminQuestions({ user }) {
  const [formData, setFormData] = useState({
    unitId: 'UN04',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    xpReward: 10,
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      alert('Асуултын текст оруулна уу');
      return;
    }
    await mockQuiz.createQuestion(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setFormData({
      unitId: 'UN04',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      xpReward: 10,
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: '700px', margin: '40px auto', background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
          Багш: Асуулт үүсгэх (CRUD)
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Дадлагын нэгжид зориулан шинэ сорил асуулт нэмнэ.
        </p>

        {success && (
          <div style={{ padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '16px' }}>
            ✓ Асуулт амжилттай нэмэгдлээ!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Нэгжийн код (Unit ID)
            </label>
            <input
              type="text"
              value={formData.unitId}
              onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              placeholder="жишээ: UN04, UN05"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Асуултын текст
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '80px' }}
              placeholder="Асуултаа энд бичнэ үү..."
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Сонголтууд (4 сонголт)
            </label>
            {formData.options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Сонголт ${String.fromCharCode(65 + idx)}`}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...formData.options];
                  newOpts[idx] = e.target.value;
                  setFormData({ ...formData, options: newOpts });
                }}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '8px' }}
                required
              />
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Зөв хариулт
            </label>
            <input
              type="text"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              placeholder="Дээрх 4 сонголтын нэгийг яг таг хуулж бичнэ үү"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '12px',
            }}
          >
            + Асуулт хадгалах
          </button>
        </form>
      </div>
    </div>
  );
}
