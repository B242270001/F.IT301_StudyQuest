/**
 * TASK-02 Mock Quiz Service (Мөнхбаяр)
 * =====================================
 * Quiz асуулт татах, хариулт шалгах, асуултын банкны CRUD.
 * Өгөгдөл: task-02-quiz/mock/quiz-questions.json
 */
import defaultQuestions from './quiz-questions.json';

const QUESTIONS_KEY = 'studyquest.quizQuestions';

export const mockQuiz = {
  /** Асуултуудыг авах (localStorage эсвэл json) */
  async fetchAllQuestions() {
    const saved = localStorage.getItem(QUESTIONS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    try {
      const res = await fetch('/mock/quiz-questions.json');
      if (res.ok) {
        const data = await res.json();
        const list = data.questions || defaultQuestions.questions;
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
    return defaultQuestions.questions;
  },

  /** Нэгжийн (Unit) асуултуудыг татах */
  async getByUnit(unitId) {
    const list = await this.fetchAllQuestions();
    return list
      .filter((q) => q.unitId === unitId)
      .map(({ correctAnswer: _c, ...rest }) => rest); // Нууц хариултыг хэрэглэгчээс нуух
  },

  /** Асуулт нэмэх (Багшийн CRUD) */
  async createQuestion(questionData) {
    const list = await this.fetchAllQuestions();
    const newQ = {
      id: `Q${String(list.length + 1).padStart(2, '0')}`,
      ...questionData,
    };
    list.push(newQ);
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(list));
    return newQ;
  },

  /** Асуулт засах */
  async updateQuestion(id, updateData) {
    const list = await this.fetchAllQuestions();
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updateData };
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(list));
    return list[idx];
  },
};

export default mockQuiz;
