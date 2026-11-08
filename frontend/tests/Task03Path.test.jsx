import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HorizontalLearningPath from '../task-03-path/HorizontalLearningPath';
import QuizResult from '../task-03-path/QuizResult';
import { validatePathUnitInput, validateStudyNoteInput } from '../utils/validators';
import { pathApi } from '../services/api';

vi.mock('../services/api', () => ({
  pathApi: {
    getLearningPath: vi.fn(),
    getLatestAttempt: vi.fn(),
  },
}));

const studentUser = { id: 'U05', name: 'Тэмүүжин', role: 'student', xp: 2480, streak: 7 };
const teacherUser = { id: 'T01', name: 'Багш Бат', role: 'teacher', xp: 5000, streak: 15 };

describe('Task 03 (Г. Тэмүүжин) - Routing, State, Mock CRUD, Validation & Role Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Validation: validatePathUnitInput болон validateStudyNoteInput буруу утгыг барина', () => {
    const invalidUnit = validatePathUnitInput({ title: '', unitGroup: 0, xp: 5 });
    expect(invalidUnit.isValid).toBe(false);
    expect(invalidUnit.errors.title).toBeDefined();
    expect(invalidUnit.errors.unitGroup).toBeDefined();
    expect(invalidUnit.errors.xp).toBeDefined();

    const validUnit = validatePathUnitInput({ title: 'Custom Hooks', unitGroup: 2, xp: 60 });
    expect(validUnit.isValid).toBe(true);

    expect(validateStudyNoteInput('').isValid).toBe(false);
    expect(validateStudyNoteInput('Массивын уртыг length буцаана').isValid).toBe(true);
  });

  it('2. Routing & Read: /practice/C01 замналаар шууд ороход зангилаануудыг зөв рендерлэнэ', async () => {
    pathApi.getLearningPath.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/practice/C01']}>
        <Routes>
          <Route path="/practice/:courseId" element={<HorizontalLearningPath user={studentUser} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-learning-path')).toBeInTheDocument();
      expect(screen.getByText('HTML суурь')).toBeInTheDocument();
      expect(screen.getByText('Компонент')).toBeInTheDocument();
    });
  });

  it('3. Role-based UI: Оюутан эрх дээр CRUD самбар харагдахгүй, Багш эрх дээр харагдана', async () => {
    pathApi.getLearningPath.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/practice/C01']}>
        <Routes>
          <Route path="/practice/:courseId" element={<HorizontalLearningPath user={studentUser} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('teacher-path-controls')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('role-toggle-btn'));
    expect(screen.getByTestId('teacher-path-controls')).toBeInTheDocument();
  });

  it('4. Form Validation UI: Хоосон нэр болон буруу XP оруулахад алдааны мессеж харуулна', async () => {
    pathApi.getLearningPath.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/practice/C01']}>
        <Routes>
          <Route path="/practice/:courseId" element={<HorizontalLearningPath user={teacherUser} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('open-create-unit-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('open-create-unit-btn'));
    fireEvent.change(screen.getByTestId('unit-xp-input'), { target: { value: '2' } });
    fireEvent.click(screen.getByTestId('save-unit-btn'));

    expect(screen.getByTestId('error-unit-title')).toBeInTheDocument();
    expect(screen.getByTestId('error-unit-xp')).toBeInTheDocument();
  });

  it('5. Mock CRUD бүрэн урсгал: Create -> Read -> Update -> Delete ажиллагаа', async () => {
    pathApi.getLearningPath.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={['/practice/C01']}>
        <Routes>
          <Route path="/practice/:courseId" element={<HorizontalLearningPath user={teacherUser} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('open-create-unit-btn')).toBeInTheDocument();
    });

    // CREATE
    fireEvent.click(screen.getByTestId('open-create-unit-btn'));
    fireEvent.change(screen.getByTestId('unit-title-input'), {
      target: { value: 'Redux Toolkit' },
    });
    fireEvent.change(screen.getByTestId('unit-xp-input'), {
      target: { value: '80' },
    });
    fireEvent.click(screen.getByTestId('save-unit-btn'));

    // READ
    expect(screen.getByText('Redux Toolkit')).toBeInTheDocument();

    // UPDATE (UN01-ийг засах)
    fireEvent.click(screen.getByTestId('edit-unit-UN01'));
    fireEvent.change(screen.getByTestId('unit-title-input'), {
      target: { value: 'HTML5 Семантик' },
    });
    fireEvent.click(screen.getByTestId('save-unit-btn'));
    expect(screen.getByText('HTML5 Семантик')).toBeInTheDocument();

    // DELETE
    fireEvent.click(screen.getByTestId('delete-unit-UN01'));
    expect(screen.queryByText('HTML5 Семантик')).not.toBeInTheDocument();
  });

  it('6. QuizResult хуудас оноо, XP болон зөв хариултыг зөв харуулна', async () => {
    pathApi.getLatestAttempt.mockResolvedValueOnce({
      unitId: 'UN04',
      courseId: 'C01',
      scorePercent: 67,
      correctCount: 2,
      totalCount: 3,
      xpEarned: 50,
    });

    render(
      <MemoryRouter>
        <QuizResult user={studentUser} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-quiz-result')).toBeInTheDocument();
      expect(screen.getByTestId('result-xp')).toHaveTextContent('+50');
      expect(screen.getByTestId('result-correct')).toHaveTextContent('2 / 3');
    });
  });
});