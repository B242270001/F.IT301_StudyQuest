# Ажлын хуваарилалт — StudyQuest

Нийт гишүүд: 6 · Төсөл: StudyQuest (Gamified University Learning Platform)
Баримтууд: [docs/01-idea.md](docs/01-idea.md), [docs/02-wireframes.md](docs/02-wireframes.md), [docs/03-data-model.md](docs/03-data-model.md), [docs/04-api-pages.md](docs/04-api-pages.md), [team-spec.json](team-spec.json)

> **Төлөв:** Багшаар батлуулах хүлээгдэж байна. `REPLACE_*` гэсэн утгуудыг гишүүн бүр өөрийн бодит мэдээллээр солино.

## 1. Гишүүд

| taskId | Гишүүн | Оюутны код | Git email | Хэсэг |
|---|---|---|---|---|
| TASK-01 | А. Төгөлдөр | B242270001 | B242270001@must.edu.mn | Auth, Dashboard, Router, Role guard |
| TASK-02 | Мөнхбаяр | B242270058| B242270058@must.edu.mn  | Practice, Quiz engine |
| TASK-03 | Г. Тэмүүжин | B242270046 | temkagg1117@gmail.com | Learning path, Quiz result, Mock store |
| TASK-04 | Д. Баттөмөр | B242270025 | b242270025@must.edu.mn | Багшийн өрөө, Course CRUD, Upload |
| TASK-05 | Хүслэн О. | REPLACE_WITH_STUDENT_CODE | otgoohuslen0918@gmail.com | Explore, Topics, Lecture |
| TASK-06 | Цогжавхлан Б. | B222270838 | b222270838@must.edu.mn | Leaderboard, UI states, E2E, Docker |

## 2. Модулийн эзэмшил (12 хуудас, 22 endpoint)

| taskId | Route (хуудас) | API method ба path | Entity |
|---|---|---|---|
| TASK-01 | `/login`, `/dashboard` | `GET /api/health`, `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `POST /api/auth/login`, `GET /api/user/profile` | User |
| TASK-02 | `/practice`, `/quiz/:unitId` | `GET /api/courses/practice`, `GET /api/quiz/:unitId`, `POST /api/quiz/check`, `POST /api/quiz/submit` | QuizQuestion, QuizAttempt |
| TASK-03 | `/practice/:courseId`, `/quiz/result` | `GET /api/units/path/:courseId`, `GET /api/attempts/latest` | Unit, UserProgress |
| TASK-04 | `/teacher`, `/teacher/courses/new` | `GET /api/teacher/overview`, `POST/PUT/DELETE /api/teacher/courses[/:id]`, `POST /api/teacher/lectures`, `POST /api/uploads/material` | Course (CRUD), Lecture (Create) |
| TASK-05 | `/explore`, `/topics/:courseId`, `/explore/lecture/:id` | `GET /api/courses/explore`, `GET /api/courses/:courseId/topics`, `GET/PUT/DELETE /api/lectures/:id`, `POST /api/lectures/:id/knowledge-check` | Topic, TopicProgress, Lecture (Read/Update/Delete) |
| TASK-06 | `/leaderboard` | `GET /api/leaderboard` | Leaderboard view |

Нэг route-ийн ижил үйлдэл, ижил API method+path, ижил тест хоёр гишүүнд давхар оноогдоогүй. Lecture entity-ийн Create (TASK-04) болон Read/Update/Delete (TASK-05) нь ялгаатай taskId, ялгаатай шалгуурт хуваагдсан.

## 3. Хамтын файлын эзэмшил

| Файл | Үндсэн эзэн | Тайлбар |
|---|---|---|
| `frontend/src/App.jsx`, `router.jsx` | TASK-01 | Route бүртгэл, static `/quiz/result`-ыг `/quiz/:unitId`-ээс өмнө тодорхойлно |
| `frontend/src/auth/AuthContext.jsx`, `ProtectedRoute.jsx` | TASK-01 | Role guard, `state-login-required`/`state-forbidden` |
| `frontend/src/components/TopHUD.jsx` | TASK-01 | HUD-ыг бусад хуудас дахин ашиглана |
| `frontend/src/mock/db.js`, `MockStoreContext.jsx` | TASK-03 | Seed + CRUD action. Өөрчлөх бол issue дээр тохирно |
| `frontend/src/utils/validators.js` | TASK-04 | Нэр, тайлбар, файл төрөл/хэмжээний validation |
| `frontend/src/components/states/*`, `Toast`, `ConfirmDialog` | TASK-06 | Нийтлэг төлөвүүд |
| `frontend/src/styles/*` (token, responsive layout) | TASK-06 | [design.md](docs/design.md)-ийн token |
| `e2e/*`, `playwright.config.js` | TASK-06 (`crud.spec.js` → TASK-04, `role.spec.js` → TASK-01) | Scenario бүр нэг эзэнтэй |
| `docker-compose.yml`, `backend/Dockerfile` (Lab 6) | TASK-06 | |
| `backend/` Express суурь, `start:grader` (Lab 4) | TASK-01 | Сервер, `GET /api/health`. Бусад гишүүн өөрийн router-оо `app.js`-д холбоно |
| `backend/src/middleware/auth.js` (Lab 4) | TASK-01 | Бусад модуль өөрийн endpoint-д холбож тестлэнэ |

Дүрэм: хамтын файлыг өөрчлөхөөс өмнө эзэнтэй issue дээр хүрээг тохирч, тусдаа branch/MR ашиглана. Дахин ашигласан код нь хэрэглэгчийн шинэ ажил гэж тооцогдохгүй.

### TASK-01 · А. Төгөлдөр · Reviewer: TASK-02
- **Хэсэг:** Login, Dashboard, AuthContext, ProtectedRoute, router, mock login/role
- **Routes:** `/login`, `/dashboard`
- **Файл:** `frontend/task-01-auth/Login.jsx`, `frontend/task-01-auth/Dashboard.jsx`, `frontend/components/ProtectedRoute.jsx`, `frontend/components/AuthContext.jsx`, `frontend/App.jsx`, `frontend/components/Navbar.jsx`
- **Тест:** `frontend/tests/Login.test.jsx`, `frontend/tests/ProtectedRoute.test.jsx`, `e2e/role.spec.js` (tag `role`)
- **Хамаарал:** TASK-03-ийн mock store (хэрэглэгчийн өгөгдөл), TASK-06-ийн state component
- **Хүлээн авах шалгуур:**
  1. Зөв нэр/нууц үгээр нэвтэрч `/dashboard` нээгдэнэ; reload хийхэд session хэвээр.
  2. Хоосон/буруу оролтод `login-name-error`, `login-password-error`, `login-error` харагдана.
  3. Student-д `room-computer`, Teacher-д `room-board` харагдана; Ор → гарах modal → `/login`.
  4. `role` scenario бүх алхамдаа амжилттай.

#### Lab 4 (Express REST) — TASK-01
- **Хэсэг:** Express server суурь, User entity, login/profile, auth middleware
- **Endpoint:** `GET /api/health` (200), `GET /api/users` (200), `GET /api/users/:id` (200/404), `POST /api/users` (201/422), `POST /api/auth/login` (200/401/422), `GET /api/user/profile` (200/401)
- **Файл:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/store/users.js`, `backend/src/routes/{health,users,auth}.js`, `backend/src/middleware/auth.js`, `backend/src/validators/user.js`
- **Тест:** `backend/tests/health.test.js`, `backend/tests/users.test.js`, `backend/tests/auth.test.js`
- **Хүлээн авах шалгуур:**
  1. `npm run start:grader` Express API-г ажиллуулна; `GET /api/health` → 200 `{ "status": "ok" }`.
  2. User-ийн list/detail/create болон буруу оролт (`username` хоосон → 422, байхгүй id → 404) `team-spec.json` `lab: 4` гэрээтэй таарна.
  3. Зөв нэвтрэлт 200+token, буруу нууц үг 401, токенгүй profile 401.
  4. `npm run test:ci` (backend Supertest + frontend vitest) амжилттай.

### TASK-02 · Мөнхбаяр · Reviewer: TASK-03
- **Хэсэг:** Practice course grid, Quiz page (3 төрлийн асуулт, inline feedback)
- **Routes:** `/practice`, `/quiz/:unitId`
- **Файл:** `frontend/src/features/practice/PracticeCourses.jsx`, `frontend/src/features/quiz/QuizQuestion.jsx` (+ `MultipleChoice`, `TrueFalse`, `CodeOutput` дэд component)
- **Тест:** `frontend/src/tests/PracticeCourses.test.jsx`, `QuizQuestion.test.jsx`
- **Хамаарал:** TASK-03 mock store (асуулт, `submitAttempt` action)
- **Хүлээн авах шалгуур:**
  1. `/practice` дээр хичээл, биелэлт %, `Үргэлжлүүлэх` харагдана; хоосон, алдааны төлөвтэй.
  2. `/quiz/UN04` дээр 3 төрлийн асуулт нэг page-д ажиллаж, `Шалгах` → ногоон/улаан feedback → `Дараагийн асуулт`.
  3. Сүүлийн асуултын дараа `Дуусгах` → `/quiz/result`; буруу unitId → `state-not-found`.

### TASK-03 · Тэмүүлэн (Temka) · Reviewer: TASK-04
- **Хэсэг:** Хэвтээ суралцах зам, Quiz result, mock store (Context + localStorage)
- **Routes:** `/practice/:courseId`, `/quiz/result`
- **Файл:** `frontend/src/features/path/HorizontalLearningPath.jsx`, `frontend/src/features/quiz/QuizResult.jsx`, `frontend/src/mock/db.js`, `frontend/src/mock/MockStoreContext.jsx`
- **Тест:** `frontend/src/tests/HorizontalPath.test.jsx`, `QuizResult.test.jsx`, `mockStore.test.js`
- **Хамаарал:** TASK-02 (quiz submit), TASK-01 (session). Mock store API-г Lab 3-ын эхний өдөр бусдад зарлана.
- **Хүлээн авах шалгуур:**
  1. Зангилаа 4 төлөвөөр (`data-status`) харагдаж, `LOCKED` нь шилжихгүй.
  2. Зам нь өөрийн хайрцагт хэвтээ scroll хийж, 375px-д body scroll үүсэхгүй.
  3. `/quiz/result` дээр score %, зөв хариулт, +XP, ахиц; attempt байхгүй үед хоосон төлөв.
  4. Mock store seed-ээр сэргэж, reload-д төлөв хадгалагдана.

### TASK-04 · Д. Баттөмөр · Reviewer: TASK-05
- **Хэсэг:** Багшийн өрөө (статистик, хичээл, суралцагч), Course CRUD, материал upload (frontend validation), лекц үүсгэх маягт
- **Routes:** `/teacher`, `/teacher/courses/new`
- **Файл:** `frontend/src/features/teacher/TeacherRoom.jsx`, `TeacherCourseForm.jsx`, `CourseForm.jsx`, `frontend/src/utils/validators.js`
- **Тест:** `frontend/src/tests/TeacherRoom.test.jsx`, `CourseForm.test.jsx`, `validators.test.js`, `e2e/crud.spec.js` (tag `crud`)
- **Хамаарал:** TASK-03 mock store, TASK-06 `ConfirmDialog`/`Toast`, TASK-01 role guard
- **Хүлээн авах шалгуур:**
  1. `crud-course` scenario: нэмэх → жагсаалтад харах → засах → устгах, reload-ын дараа хэвээр.
  2. Хоосон нэр, богино тайлбар, буруу файл төрөл/хэмжээнд талбарын алдаа гарч record үүсэхгүй.
  3. Статистик карт, bar chart, суралцагчийн хүснэгт (хайлттай) харагдана.
  4. Student-д `state-forbidden`.

### TASK-05 · Хүслэн О. · Reviewer: TASK-06
- **Хэсэг:** Хичээлийн сан (хайлт, шүүлт), сэдвийн жагсаалт
- **Routes:** `/explore`, `/topics/:courseId`
- **Файл:** `frontend/src/features/explore/ExploreCourses.jsx`, `frontend/src/features/topics/UnitTopics.jsx`
- **Тест:** `frontend/src/tests/ExploreSearch.test.jsx`, `UnitTopics.test.jsx`
- **Хамаарал:** TASK-03 mock store, TASK-01 role guard, TASK-04 Lecture create (өгөгдөл)
- **Хүлээн авах шалгуур:**
  1. "React" гэж хайхад зөвхөн холбогдох хичээл үлдэж, олдохгүй бол хоосон төлөв болон цэвэрлэх товч харагдана.
  2. Хайлтын утга, ангиллын шүүлтүүр URL-ийн `?search=&category=` параметртэй sync хийнэ.
  3. Сэдэв сонгоход тухайн сэдвийн лекцийн жагсаалт зөв харагдана.

### TASK-06 · Цогжавхлан Б. · Reviewer: TASK-01
- **Хэсэг:** Чансаа, лекцийн дэлгэрэнгүй (Render demo, Knowledge Check, багшийн засах/устгах), нийтлэг UI төлөв component, responsive layout, validation/smoke/responsive Playwright scenario
- **Routes:** `/leaderboard`, `/explore/lecture/:id`
- **Файл:**
  - `frontend/src/features/leaderboard/Leaderboard.jsx`
  - `frontend/src/features/lecture/ExploreLectureDetail.jsx`
  - `frontend/src/components/states/*`
  - `frontend/src/components/Toast.jsx`
  - `frontend/src/components/ConfirmDialog.jsx`
  - `frontend/src/styles/*`
  - `e2e/validation.spec.js`
  - `e2e/smoke.spec.js`
  - `e2e/responsive.spec.js`
  - `playwright.config.js`
- **Тест:**
  - `frontend/src/tests/Leaderboard.test.jsx`
  - `frontend/src/tests/LectureDetail.test.jsx`
  - `frontend/src/tests/UIStates.test.jsx`
  - Дээрх E2E тестүүд (`validation`, `smoke`, `responsive` tag)
- **Хамаарал:** TASK-03 mock store, TASK-01 role guard, TASK-04 Lecture create (лекцийн өгөгдөл), бусад гишүүдийн testId-ууд (`team-spec.json`).
- **Хүлээн авах шалгуур:**
  1. Podium, "Энэ долоо хоног"/"Нийт" таб, "Чи" мөр тодорч харагдана. Teacher role-д чансааны хуудас харагдахгүй.
  2. Лекцийн дэлгэрэнгүйд `Render хийх` demo анимейшн ажиллаж, Knowledge Check амжилттай дуусахад тухайн сэдэв `DONE` төлөвт шилжинэ.
  3. `lecture-edit-btn` болон `lecture-delete-btn` зөвхөн Teacher role-д харагдана. Лекц засах үед validation хийгдэж, лекц устгахын өмнө баталгаажуулах dialog гарна.
  4. `validation` scenario нэвтрэх, хичээл нэмэх, файл upload-тай холбоотой алдаануудыг хамруулж амжилттай ажиллана.
  5. 12 route бүр 375px өргөнтэй дэлгэцэд хэвтээ overflow-гүй байна. `smoke` scenario алдаагүй ажиллана.
  6. Хуудас бүрийн `state-*` component нэг бүтэцтэй, loading, empty, error төлөвүүд ижил загвараар харагдана.
  7. Лекцийн дэлгэрэнгүй хуудасны өгөгдөл mock store-той холбогдож, байхгүй `id`-д алдааны төлөв харуулна.
