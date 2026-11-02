/**
 * TASK-03 Mock Path & Progress Service (Тэмүүлэн - Temka)
 * ========================================================
 * Хэвтээ замын нэгжүүд, суралцагчийн ахиц (Progress), сүүлийн сорилын үр дүн.
 * Өгөгдөл: task-03-path/mock/
 */
import defaultUnits from './units.json';
import defaultProgress from './user-progress.json';
import defaultAttempts from './quiz-attempts.json';

const PROGRESS_KEY = 'studyquest.unitProgress';

export const mockPath = {
  /** Хичээлийн бүх нэгж авах */
  async getUnits(courseId = 'C01') {
    try {
      const res = await fetch('/mock/units.json');
      if (res.ok) {
        const data = await res.json();
        return (data.units || defaultUnits.units).filter((u) => u.courseId === courseId);
      }
    } catch (e) {}
    return defaultUnits.units.filter((u) => u.courseId === courseId);
  },

  /** Суралцагчийн замын төлөв авах (LOCKED, CURRENT, COMPLETED) */
  async getLearningPath(userId = 'U05', courseId = 'C01') {
    const units = await this.getUnits(courseId);
    let progressList = [];

    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        progressList = JSON.parse(saved);
      } catch (e) {}
    } else {
      progressList = defaultProgress.progress;
    }

    const userProg = progressList.filter((p) => p.userId === userId);

    return units.map((u, index) => {
      const match = userProg.find((p) => p.unitId === u.id);
      let status = match?.status;
      if (!status) {
        // Default: эхний 3 нь COMPLETED, 4 дэх нь CURRENT, үлдсэн нь LOCKED
        status = index < 3 ? 'COMPLETED' : index === 3 ? 'CURRENT' : 'LOCKED';
      }
      return {
        ...u,
        status,
        score: match?.score || (status === 'COMPLETED' ? 85 : 0),
      };
    });
  },

  /** Сүүлийн тестийн үр дүнг авах */
  async getLatestAttempt(userId = 'U05') {
    // 1. Session-оос сүүлийн өгсөн тестийг шалгах
    const rawSession = sessionStorage.getItem('studyquest.lastAttempt');
    if (rawSession) {
      try {
        const attempt = JSON.parse(rawSession);
        return {
          scorePercent: 100,
          correctCount: attempt.answers?.length || 4,
          totalCount: attempt.totalCount || 4,
          xpEarned: (attempt.answers?.length || 4) * 10,
          weakTopics: [],
          ...attempt,
        };
      } catch (e) {}
    }
    // 2. Default mock attempt
    return defaultAttempts.attempts.find((a) => a.userId === userId) || defaultAttempts.attempts[0];
  },
};

export default mockPath;
