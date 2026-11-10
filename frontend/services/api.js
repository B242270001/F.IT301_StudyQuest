/**
 * Central API & Mock Service — StudyQuest
 * ========================================
 * TASK-01 Auth: Express `/api/auth/login`, `/api/user/profile` (Lab 4).
 * Бусад модуль Lab 5 хүртэл public/mock/*.json ашиглана.
 */

const SESSION_KEY = "studyquest.currentUser";

// 1. Auth & User Service (TASK-01)
export const authApi = {
  async login(username, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.status === 401 || res.status === 422) return null;
    if (!res.ok) throw new Error("login failed");

    const data = await res.json();
    const profileRes = await fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const profile = profileRes.ok ? await profileRes.json() : { ...data.user, username };
    const session = {
      ...profile,
      username: profile.username || username,
      token: data.token,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

// 2. Practice & Quiz Service (TASK-02)
export const quizApi = {
  async getQuestions(unitId) {
    const res = await fetch('/mock/quiz-questions.json');
    const data = await res.json();
    const list = data.questions || [];
    return unitId ? list.filter((q) => q.unitId === unitId) : list;
  },

  async addQuestion(questionData) {
    console.log('Question added to DB:', questionData);
    return { success: true, ...questionData };
  },
};

// 3. Learning Path & Progress Service (TASK-03)
export const pathApi = {
  async getUnits(courseId = 'C01') {
    const res = await fetch('/mock/units.json');
    const data = await res.json();
    return (data.units || []).filter((u) => u.courseId === courseId);
  },

  async getLearningPath(userId = 'U05', courseId = 'C01') {
    const [unitsRes, progRes] = await Promise.all([
      fetch('/mock/units.json'),
      fetch('/mock/user-progress.json'),
    ]);
    const { units } = await unitsRes.json();
    const { progress } = await progRes.json();

    const courseUnits = units.filter((u) => u.courseId === courseId);
    const userProg = progress.filter((p) => p.userId === userId);

    return courseUnits.map((u, idx) => {
      const match = userProg.find((p) => p.unitId === u.id);
      return {
        ...u,
        status: match?.status || (idx < 3 ? 'COMPLETED' : idx === 3 ? 'CURRENT' : 'LOCKED'),
        score: match?.score || (idx < 3 ? 85 : 0),
      };
    });
  },

  async getLatestAttempt(userId = 'U05') {
    const sessionAttempt = sessionStorage.getItem('studyquest.lastAttempt');
    if (sessionAttempt) {
      try { return JSON.parse(sessionAttempt); } catch (e) {}
    }
    const res = await fetch('/mock/quiz-attempts.json');
    const data = await res.json();
    return data.attempts?.find((a) => a.userId === userId) || data.attempts?.[0];
  },
};

// 4. Course & Teacher Management Service (TASK-04)
export const courseApi = {
  async getCourses() {
    const res = await fetch('/mock/courses.json');
    const data = await res.json();
    return data.courses || [];
  },

  async getById(id) {
    const list = await this.getCourses();
    return list.find((c) => c.id === id) || { id, title: 'Веб систем ба технологи' };
  },

  async createCourse(courseData) {
    console.log('Course created in DB:', courseData);
    return { success: true, id: `C${Date.now()}`, ...courseData };
  },

  async deleteCourse(id) {
    console.log('Course deleted in DB:', id);
    return { success: true, id };
  },
};

// 5. Explore & Lectures Service (TASK-05)
// Лекц болон сэдвийн ахицыг анх /mock-оос татаж localStorage-д хадгална,
// ингэснээр багшийн засвар/устгал, оюутны дуусгасан сэдэв хуудас солиход хадгалагдана.
const LECTURES_KEY = 'studyquest.lectures';
const TOPIC_PROGRESS_KEY = 'studyquest.topicProgress';

async function loadStored(key, url, field) {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  const list = (await res.json())[field] || [];
  localStorage.setItem(key, JSON.stringify(list));
  return list;
}

export const exploreApi = {
  // GET /api/courses/explore?search=&category= (docs/04-api-pages.md)
  // search: нэр/тайлбараар, том жижгийг ялгахгүй. category: enum (WEB, OS, DATABASE).
  async searchCourses({ search = '', category = '' } = {}) {
    const [courses, topics, lectures] = await Promise.all([
      courseApi.getCourses(),
      this.getTopics(),
      this.getLectures(),
    ]);
    const q = search.trim().toLowerCase();
    return courses
      .filter((c) => !category || c.category === category)
      .filter((c) => !q || `${c.title} ${c.description || ''}`.toLowerCase().includes(q))
      .map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        topicCount: topics.filter((t) => t.courseId === c.id).length,
        lectureCount: lectures.filter((l) => l.courseId === c.id).length,
      }));
  },

  async getLectures() {
    return loadStored(LECTURES_KEY, '/mock/lectures.json', 'lectures');
  },

  async getLectureById(id) {
    const lectures = await this.getLectures();
    return lectures.find((l) => l.id === id) || null;
  },

  async getByCourse(courseId) {
    const lectures = await this.getLectures();
    return lectures.filter((l) => l.courseId === courseId);
  },

  async updateLecture(id, changes) {
    const lectures = await this.getLectures();
    const idx = lectures.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    lectures[idx] = { ...lectures[idx], ...changes };
    localStorage.setItem(LECTURES_KEY, JSON.stringify(lectures));
    return lectures[idx];
  },

  async deleteLecture(id) {
    const lectures = await this.getLectures();
    const remaining = lectures.filter((l) => l.id !== id);
    localStorage.setItem(LECTURES_KEY, JSON.stringify(remaining));
    return remaining.length < lectures.length;
  },

  async getTopics(courseId) {
    const res = await fetch('/mock/topics.json');
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const list = (data.topics || []).sort((a, b) => a.order - b.order);
    return courseId ? list.filter((t) => t.courseId === courseId) : list;
  },

  async getTopicProgress(studentId) {
    const progress = await loadStored(TOPIC_PROGRESS_KEY, '/mock/topic-progress.json', 'topicProgress');
    return progress.filter((p) => p.userId === studentId);
  },

  async completeTopic(studentId, topicId, score) {
    const progress = await loadStored(TOPIC_PROGRESS_KEY, '/mock/topic-progress.json', 'topicProgress');
    const entry = { userId: studentId, topicId, status: 'DONE', knowledgeScore: score };
    const idx = progress.findIndex((p) => p.userId === studentId && p.topicId === topicId);
    if (idx === -1) progress.push(entry);
    else progress[idx] = entry;
    localStorage.setItem(TOPIC_PROGRESS_KEY, JSON.stringify(progress));
    return entry;
  },
};

// 6. Leaderboard Service (TASK-06)
export const leaderboardApi = {
  async getWeekly() {
    const res = await fetch('/mock/leaderboard-weekly.json');
    return res.json();
  },

  async getAllTime() {
    const res = await fetch('/mock/leaderboard-allTime.json');
    return res.json();
  },
};
