/**
 * Central API & Mock Service — StudyQuest
 * ========================================
 * Одоогоор: public/mock/*.json-оос fetch хийж ажиллана.
 * Сүүлд: Backend API бэлэн болоход энд байгаа endpoint URL-уудыг
 *        /mock/*.json -> /api/... болгоход л бүх систем шууд DB-тэй холбогдоно.
 */

// 1. Auth & User Service (TASK-01)
export const authApi = {
  async login(username, password) {
    const res = await fetch('/mock/users.json');
    const data = await res.json();
    const user = data.users.find((u) => u.username === username && u.password === password);
    if (!user) return null;

    const { password: _p, ...safeUser } = user;
    sessionStorage.setItem('studyquest.currentUser', JSON.stringify(safeUser));
    return safeUser;
  },

  logout() {
    sessionStorage.removeItem('studyquest.currentUser');
  },

  getCurrentUser() {
    const raw = sessionStorage.getItem('studyquest.currentUser');
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
export const exploreApi = {
  async getLectures() {
    const res = await fetch('/mock/lectures.json');
    const data = await res.json();
    return data.lectures || [];
  },

  async getLectureById(id) {
    const lectures = await this.getLectures();
    return lectures.find((l) => l.id === id) || lectures[0] || null;
  },

  async getByCourse(courseId) {
    const lectures = await this.getLectures();
    return lectures.filter((l) => l.courseId === courseId);
  },

  async updateLecture(id, changes) {
    return { id, ...changes };
  },

  async deleteLecture(id) {
    return true;
  },

  async getTopics(courseId) {
    const res = await fetch('/mock/topics.json');
    const data = await res.json();
    const list = data.topics || [];
    return courseId ? list.filter((t) => t.courseId === courseId) : list;
  },

  async getTopicProgress(studentId) {
    return [
      { userId: studentId, topicId: 'TP01', status: 'DONE', knowledgeScore: 100 },
      { userId: studentId, topicId: 'TP02', status: 'DONE', knowledgeScore: 80 },
    ];
  },

  async completeTopic(studentId, topicId, score) {
    return true;
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
