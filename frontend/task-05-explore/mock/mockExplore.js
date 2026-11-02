/**
 * TASK-05 Mock Explore & Lecture Service (Хүслэн О.)
 * ===================================================
 * Лекцийн сан, хайлт, сэдэв шүүлтүүр, дэлгэрэнгүй харах, засах, устгах.
 * Өгөгдөл: task-05-explore/mock/
 */
import defaultLectures from './lectures.json';
import defaultTopics from './topics.json';

const LECTURES_KEY = 'studyquest.lectures';
const TOPIC_PROGRESS_KEY = 'studyquest.topicProgress';

export const mockLectures = {
  async _seed() {
    const existing = localStorage.getItem(LECTURES_KEY);
    if (existing) {
      try { return JSON.parse(existing); } catch (e) {}
    }
    try {
      const res = await fetch('/mock/lectures.json');
      if (res.ok) {
        const data = await res.json();
        const list = data.lectures || defaultLectures.lectures;
        localStorage.setItem(LECTURES_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
    return defaultLectures.lectures;
  },

  _save(list) {
    localStorage.setItem(LECTURES_KEY, JSON.stringify(list));
  },

  async getAll() {
    return this._seed();
  },

  async getById(id) {
    const list = await this.getAll();
    return list.find((l) => l.id === id) || list[0] || null;
  },

  async getByCourse(courseId) {
    const list = await this.getAll();
    return list.filter((l) => l.courseId === courseId);
  },

  async update(id, changes) {
    const list = await this.getAll();
    const idx = list.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    this._save(list);
    return list[idx];
  },

  async remove(id) {
    const list = await this.getAll();
    const filtered = list.filter((l) => l.id !== id);
    this._save(filtered);
    return true;
  },

  async search(query = '', category = '') {
    const list = await this.getAll();
    return list.filter((item) => {
      const matchQ =
        !query ||
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.summary?.toLowerCase().includes(query.toLowerCase());
      const matchCat = !category || item.category === category;
      return matchQ && matchCat;
    });
  },
};

export const mockTopics = {
  async getAll() {
    try {
      const res = await fetch('/mock/topics.json');
      if (res.ok) {
        const data = await res.json();
        return data.topics || defaultTopics.topics;
      }
    } catch (e) {}
    return defaultTopics.topics;
  },

  async getByCourse(courseId) {
    const list = await this.getAll();
    return list.filter((t) => t.courseId === courseId).sort((a, b) => a.order - b.order);
  },
};

export const mockCourses = {
  async getById(id) {
    try {
      const res = await fetch('/mock/courses.json');
      if (res.ok) {
        const data = await res.json();
        return (data.courses || []).find((c) => c.id === id) || null;
      }
    } catch (e) {}
    return { id, title: 'Веб систем ба технологи' };
  },
};

export const mockProgress = {
  async getTopicProgress(studentId) {
    const saved = localStorage.getItem(TOPIC_PROGRESS_KEY);
    if (saved) {
      try {
        const list = JSON.parse(saved);
        return list.filter((p) => p.userId === studentId);
      } catch (e) {}
    }
    return [
      { userId: studentId, topicId: 'TP01', status: 'DONE', knowledgeScore: 100 },
      { userId: studentId, topicId: 'TP02', status: 'DONE', knowledgeScore: 80 },
    ];
  },

  async completeTopic(studentId, topicId, score) {
    let list = [];
    const saved = localStorage.getItem(TOPIC_PROGRESS_KEY);
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }
    const idx = list.findIndex((p) => p.userId === studentId && p.topicId === topicId);
    if (idx >= 0) {
      list[idx].status = 'DONE';
      list[idx].knowledgeScore = Math.max(list[idx].knowledgeScore || 0, score);
    } else {
      list.push({ userId: studentId, topicId, status: 'DONE', knowledgeScore: score });
    }
    localStorage.setItem(TOPIC_PROGRESS_KEY, JSON.stringify(list));
    return true;
  },
};

export default {
  mockLectures,
  mockTopics,
  mockCourses,
  mockProgress,
};
