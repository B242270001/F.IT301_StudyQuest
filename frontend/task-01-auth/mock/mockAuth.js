/**
 * TASK-01 Mock Auth Service (А. Төгөлдөр)
 * ========================================
 * Нэвтрэх, гарах, session хадгалах, role шалгах.
 * Өгөгдөл: task-01-auth/mock/users.json
 */
import defaultUsers from './users.json';

const STORAGE_KEY = 'studyquest.currentUser';

export const mockAuth = {
  /** Хэрэглэгчдийн жагсаалт авах */
  async fetchUsers() {
    try {
      const res = await fetch('/mock/users.json');
      if (res.ok) {
        const data = await res.json();
        return data.users || defaultUsers.users;
      }
    } catch (e) {
      // Fallback: local json
    }
    return defaultUsers.users;
  },

  /**
   * Нэвтрэх
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    const users = await this.fetchUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) return null;

    const { password: _pw, ...safeUser } = user;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  /** Системээс гарах */
  logout() {
    sessionStorage.removeItem(STORAGE_KEY);
  },

  /** Нэвтэрсэн хэрэглэгчийг авах */
  getCurrentUser() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /** Нэвтэрсэн эсэх */
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  /** Багш эсэх */
  isTeacher() {
    return this.getCurrentUser()?.role === 'TEACHER';
  },

  /** Оюутан эсэх */
  isStudent() {
    return this.getCurrentUser()?.role === 'STUDENT';
  },
};

export default mockAuth;
