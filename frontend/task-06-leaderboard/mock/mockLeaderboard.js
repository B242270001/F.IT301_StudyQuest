/**
 * TASK-06 Mock Leaderboard Service (Цогжавхлан Б.)
 * =================================================
 * Долоо хоног болон Бүх цагийн чансааны өгөгдөл.
 * Өгөгдөл: task-06-leaderboard/mock/
 */
import defaultWeekly from './leaderboard-weekly.json';
import defaultAllTime from './leaderboard-allTime.json';

export const mockLeaderboard = {
  /** Долоо хоногийн чансаа */
  async getWeekly() {
    try {
      const res = await fetch('/mock/leaderboard-weekly.json');
      if (res.ok) return await res.json();
    } catch (e) {}
    return defaultWeekly;
  },

  /** Бүх цагийн чансаа */
  async getAllTime() {
    try {
      const res = await fetch('/mock/leaderboard-allTime.json');
      if (res.ok) return await res.json();
    } catch (e) {}
    return defaultAllTime;
  },

  /** Хоёуланг нь татах */
  async getAll() {
    const [weekly, allTime] = await Promise.all([
      this.getWeekly(),
      this.getAllTime(),
    ]);
    return { weekly, allTime };
  },
};

export default mockLeaderboard;
