import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HorizontalLearningPath from '../task-03-path/HorizontalLearningPath';
import QuizResult from '../task-03-path/QuizResult';
import { pathApi } from '../services/api';

vi.mock('../services/api', () => ({
  pathApi: {
    getLearningPath: vi.fn(),
    getLatestAttempt: vi.fn(),
  },
}));

const mockUser = { id: 'U05', name: 'Тэмүүжин', role: 'student' };

describe('Task 3: HorizontalLearningPath & QuizResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('HorizontalLearningPath нэгжүүдийг COMPLETED, CURRENT, LOCKED төлөвтэй зөв харуулна', async () => {
    pathApi.getLearningPath.mockResolvedValueOnce([
      { id: 'UN01', title: 'Хувьсагч ба өгөгдлийн төрөл', status: 'COMPLETED', score: 90 },
      { id: 'UN02', title: 'Нөхцөл шалгах оператор', status: 'CURRENT' },
      { id: 'UN03', title: 'Давталт ба массив', status: 'LOCKED' },
    ]);

    render(
      <MemoryRouter initialEntries={['/practice/C01']}>
        <Routes>
          <Route path="/practice/:courseId" element={<HorizontalLearningPath user={mockUser} />} />
          <Route path="/quiz/:unitId" element={<div data-testid="quiz-page">Quiz Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Хувьсагч ба өгөгдлийн төрөл')).toBeInTheDocument();
      // CURRENT нэгж замд болон "Дараагийн хичээл" картад давхар харагдана
      expect(screen.getAllByText('Нөхцөл шалгах оператор')).toHaveLength(2);
    });

    expect(screen.getByTestId('path-completed-count')).toHaveTextContent('1 / 3');
    expect(screen.getByTestId('path-avg-score')).toHaveTextContent('90%');

    // Түгжээтэй нэгж дээр дарахад шилжихгүй
    fireEvent.click(screen.getByTestId('path-node-UN03'));
    expect(screen.queryByTestId('quiz-page')).not.toBeInTheDocument();

    // Идэвхтэй нэгж дээр дарахад /quiz/UN02 руу шилжинэ
    fireEvent.click(screen.getByTestId('path-node-UN02'));
    await waitFor(() => {
      expect(screen.getByTestId('quiz-page')).toBeInTheDocument();
    });
  });

  it('QuizResult оролдлого байхгүй үед state-empty харуулна', async () => {
    pathApi.getLatestAttempt.mockResolvedValueOnce(null);

    render(
      <MemoryRouter>
        <QuizResult user={mockUser} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('state-empty')).toBeInTheDocument();
    });
  });

  it('QuizResult оноо, зөв хариулт, XP болон сул сэдвүүдийг зөв харуулна', async () => {
    pathApi.getLatestAttempt.mockResolvedValueOnce({
      unitId: 'UN04',
      courseId: 'C01',
      scorePercent: 85,
      correctCount: 6,
      totalCount: 7,
      xpEarned: 45,
      weakTopics: ['Рекурсив функц', 'Хоёртын хайлт'],
    });

    render(
      <MemoryRouter>
        <QuizResult user={mockUser} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('result-score')).toHaveTextContent('85%');
      expect(screen.getByTestId('result-correct')).toHaveTextContent('6 / 7');
      expect(screen.getByTestId('result-xp')).toHaveTextContent('+45 XP');
    });

    expect(screen.getByText('Рекурсив функц')).toBeInTheDocument();
    expect(screen.getByText('Хоёртын хайлт')).toBeInTheDocument();
  });
});