/**
 * TASK-04 Mock Teacher & Course Service (Д. Баттөмөр)
 * ====================================================
 * Багшийн статистик, хичээлийн CRUD үйлдлүүд.
 * Өгөгдөл: task-04-teacher/mock/courses.json
 */
import defaultCourses from './courses.json';

const COURSES_KEY = 'studyquest.courses';

export const mockTeacher = {
  /** Хичээлүүдийг авах */
  async getCourses() {
    const saved = localStorage.getItem(COURSES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    try {
      const res = await fetch('/mock/courses.json');
      if (res.ok) {
        const data = await res.json();
        const list = data.courses || defaultCourses.courses;
        localStorage.setItem(COURSES_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
    return defaultCourses.courses;
  },

  /** Шинэ хичээл үүсгэх (CRUD - Create) */
  async createCourse(courseData) {
    const courses = await this.getCourses();
    const newCourse = {
      id: `C${String(courses.length + 1).padStart(2, '0')}`,
      totalUnits: 0,
      createdAt: new Date().toISOString(),
      ...courseData,
    };
    courses.push(newCourse);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return newCourse;
  },

  /** Хичээл шинэчлэх (CRUD - Update) */
  async updateCourse(id, courseData) {
    const courses = await this.getCourses();
    const idx = courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    courses[idx] = { ...courses[idx], ...courseData };
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return courses[idx];
  },

  /** Хичээл устгах (CRUD - Delete) */
  async deleteCourse(id) {
    const courses = await this.getCourses();
    const filtered = courses.filter((c) => c.id !== id);
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
    return true;
  },
};

export default mockTeacher;
