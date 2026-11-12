import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { quizApi } from '../services/api';

export default function QuizQuestion({ user }) {
  const { unitId = 'UN04' } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const list = await quizApi.getQuestions(unitId);
      // Хэрэв тухайн unit-д асуулт олдохгүй бол бүх асуултаас харуулъя
      if (list.length === 0) {
        const all = await quizApi.getQuestions();
        setQuestions(all.slice(0, 4));
      } else {
        setQuestions(list);
      }
      setLoading(false);
    }
    load();
  }, [unitId]);

  if (loading) {
    return (
      <div data-testid="page-quiz" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} />
        <p style={{ textAlign: 'center', marginTop: '60px' }}>Асуулт ачаалж байна...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div data-testid="page-quiz" style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar user={user} />
        <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', background: '#fff', padding: '30px', borderRadius: '12px' }}>
          <h2>Энэ нэгжид асуулт алга байна</h2>
          <button
            onClick={() => navigate('/practice')}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Дадлага руу буцах
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const questionTitle = currentQ.questionText || currentQ.question;

  const handleNext = () => {
    if (selectedOption === null) {
      alert('Хариултаа сонгоно уу!');
      return;
    }

    const chosenAnswer = currentQ.options[selectedOption];
    const newAnswers = [...answers, { questionId: currentQ.id, answer: chosenAnswer }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // Тест дууслаа -> local storage-д түр хадгалаад /quiz/result руу үсэрнэ
      const attemptData = {
        unitId,
        answers: newAnswers,
        totalCount: questions.length,
        submittedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('studyquest.lastAttempt', JSON.stringify(attemptData));
      navigate('/quiz/result');
    }
  };

  return (
    <div data-testid="page-quiz" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar user={user} />
      <div style={{ maxWidth: '680px', margin: '40px auto', background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Асуулт {currentIndex + 1} / {questions.length}
          </span>
          <span style={{ fontSize: '13px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
            +{currentQ.xpReward || 10} XP
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              height: '100%',
              background: '#2563eb',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
          {questionTitle}
        </h2>

        {/* Хэрэв кодын жишээ байгаа бол */}
        {currentQ.codeSnippet && (
          <pre
            style={{
              background: '#1e293b',
              color: '#38bdf8',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              overflowX: 'auto',
            }}
          >
            <code>{currentQ.codeSnippet}</code>
          </pre>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options?.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    background: isSelected ? '#2563eb' : 'transparent',
                    color: isSelected ? '#fff' : '#64748b',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
          <button
            disabled={currentIndex === 0}
            onClick={() => {
              setCurrentIndex((prev) => prev - 1);
              setSelectedOption(null);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: currentIndex === 0 ? '#94a3b8' : '#334155',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Өмнөх
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {currentIndex === questions.length - 1 ? 'Тест дуусгах 🎯' : 'Дараах →'}
          </button>
        </div>
      </div>
    </div>
  );
}
