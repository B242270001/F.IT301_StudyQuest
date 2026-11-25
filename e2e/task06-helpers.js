import { expect } from "@playwright/test";

// TASK-06 (Lab 3): smoke / responsive / role E2E-ийн нийтлэг туслах функцүүд.
// Backend (`npm run start:grader`, MONGODB_URI) болон Vite dev server (/api proxy) ажиллаж байх ёстой.

export const USERS = {
  student: { username: "temuulen", password: "student123" },
  teacher: { username: "bagsh", password: "teacher123" },
};

// team-spec.json-ийн бүх route + хуудас бүрийн data-testid.
// as: нэвтрэх хэрэглэгч (null = нэвтрэхгүй), landsOn: redirect хийдэг route-ийн эцсийн зам.
export const ROUTES = [
  { path: "/login", as: null, testId: "page-login" },
  { path: "/register", as: null, testId: "page-register" },
  { path: "/dashboard", as: "student", testId: "page-dashboard" },
  { path: "/profile/avatar", as: "student", testId: "page-avatar-editor" },
  { path: "/practice", as: "student", testId: "page-practice" },
  { path: "/practice/C01", as: "student", testId: "page-learning-path" },
  { path: "/topics", as: "student", testId: "page-explore", landsOn: "/explore" },
  { path: "/quiz/UN01", as: "student", testId: "page-quiz" },
  { path: "/quiz/result", as: "student", testId: "page-quiz-result" },
  { path: "/explore", as: "student", testId: "page-explore" },
  { path: "/explore/lecture/L01", as: "student", testId: "page-lecture" },
  { path: "/leaderboard", as: "student", testId: "page-leaderboard" },
  { path: "/ui-states", as: null, testId: "page-ui-states" },
  { path: "/teacher", as: "teacher", testId: "page-teacher-room" },
  { path: "/teacher/courses/new", as: "teacher", testId: "page-teacher-course-form" },
  { path: "/admin/courses", as: "teacher", testId: "page-teacher-room" },
  { path: "/admin/questions", as: "teacher", testId: "page-admin-questions" },
];

// Backend-ээс JWT аваад App ачаалахаас өмнө sessionStorage-д session-ийг хадгална
// (frontend/services/api.js-ийн startSession-тэй ижил хэлбэр). Login хуудсыг тест бүрт давтахгүй.
export async function loginAs(page, who) {
  const { username, password } = USERS[who];
  const login = await page.request.post("/api/auth/login", { data: { username, password } });
  expect(login.status(), `login as ${username}`).toBe(200);
  const { token } = await login.json();

  const profileRes = await page.request.get("/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profile = profileRes.ok() ? await profileRes.json() : {};
  const session = { ...profile, username: profile.username || username, token };

  await page.addInitScript((s) => {
    sessionStorage.setItem("studyquest.currentUser", JSON.stringify(s));
  }, session);
  return session;
}

// Нэвтрэх хуудсаар (UI) нэвтрэх — team-spec-ийн role scenario-той ижил алхам.
export async function loginThroughForm(page, who) {
  const { username, password } = USERS[who];
  await page.goto("/login");
  await page.getByTestId("login-name-input").fill(username);
  await page.getByTestId("login-password-input").fill(password);
  await page.getByTestId("login-submit-btn").click();
  await expect(page).not.toHaveURL(/\/login$/);
}

// Хуудсыг нээж, өгөгдөл ачаалж дуустал хүлээнэ.
export async function openRoute(page, route) {
  if (route.as) await loginAs(page, route.as);
  await page.goto(route.path);
  await page.waitForLoadState("networkidle");
  await page.getByTestId(route.testId).first().waitFor();
}
