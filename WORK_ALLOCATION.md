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
| TASK-06 | `/leaderboard`, `/ui-states` | `GET/POST /api/achievements`, `GET/PUT/DELETE /api/achievements/:id` (`GET /api/leaderboard`-ийг TASK-01 MongoDB дээр хэрэгжүүлэв) | Leaderboard view, Achievement |

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
| `docker-compose.yml`, `Dockerfile` (Lab 6) | TASK-06 | Lab 6-д TASK-01 гүйцэтгэв (TASK-06-тай тохиролцсон) |
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
  3. Dashboard дээр `room-computer` харагдана; Ор → гарах modal → `/login`.
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

#### Lab 5 (MongoDB/Mongoose + integration) — TASK-01
- **Хэсэг:** MongoDB холболт (`MONGODB_URI`), User model, Session model (token → User), Note model (owner → User); User CRUD-ыг MongoDB дээр persistent болгох; Dashboard-ын тэмдэглэлийг mock/sessionStorage-оос бодит `/api/notes` руу шилжүүлэх.
- **Entity хамаарал:** `Session.user → User`, `Note.owner → User`
- **Endpoint (шинэ):** `GET/POST /api/notes` (200/201/401/422), `PUT/DELETE /api/notes/:id` (200/204/404/422), `POST /api/auth/logout` (204). Lab 4-ийн User/Auth endpoint-ууд MongoDB дээр шилжсэн.
- **Файл:** `backend/src/db.js`, `backend/src/models/{User,Session,Note}.js`, `backend/src/store/users.js`, `backend/src/routes/{auth,users,notes}.js`, `backend/src/validators/note.js`, `backend/src/middleware/{auth,asyncHandler}.js`, `backend/src/server.js`, `backend/.env.example`, `frontend/services/api.js` (`notesApi`), `frontend/task-01-auth/Dashboard.{jsx,css}`
- **Тест:** `backend/tests/notes.test.js`, `backend/tests/persistence.test.js` (+ шинэчилсэн `users`/`auth` тест, `mongodb-memory-server`), `frontend/tests/ProtectedRoute.test.jsx` (Dashboard ↔ `/api/notes`), `e2e/integration.spec.js` (tag `integration`)
- **Хүлээн авах шалгуур:**
  1. `MONGODB_URI` өгөөгүй бол сервер тодорхой алдаатай зогсоно; өгсөн үед хоосон DB-д seed хэрэглэгч нэг удаа үүснэ.
  2. `POST /api/users`-ээр хэрэглэгч үүсгээд backend restart хийсний дараа `GET /api/users/:id` хэвээр 200 буцаана (нууц үг scrypt hash-аар хадгалагдана).
  3. Dashboard дээр тэмдэглэл нэмэх/засах/устгахад `/api/notes` хүсэлт гарч, `notes-loading`, `notes-success`, `notes-error` төлөвүүд ялгаатай харагдана; reload хийхэд тэмдэглэл хэвээр.
  4. `npm run test:ci` амжилттай.

#### Нэмэлт — Хэрэглэгчийн дүр (avatar) ба MongoDB чансаа — TASK-01
- **Шалтгаан:** өрөөний хуучин зурагт гуравдагч этгээдийн дүртэй төстэй дүр байсан тул дүргүй өрөөний зураг + өөрсдийн зурсан давхаргатай SVG дүрээр солив.
- **Хэсэг:** давхаргатай SVG дүр (`Avatar`), `/profile/avatar` тохируулах хуудас, Dashboard өрөөнд дүр байрлуулах, Navbar болон Чансаанд дүр харуулах, `GET /api/leaderboard`-ийг MongoDB-ийн `users`-ээс гаргах.
- **Чансааны тохиролцоо:** `/leaderboard` хуудас TASK-06-ийнх хэвээр; дүр харуулах болон mock JSON-оос `GET /api/leaderboard` руу шилжүүлэх өөрчлөлтийг TASK-01 хийв (TASK-06-тай тохиролцсон).
- **Entity:** `User.avatarConfig` `{ body, skinTone, hairStyle, hairColor, outfit, outfitColor, accessory }`, `User.lastWeekRank`
- **Endpoint (шинэ):** `GET /api/user/avatar` (200/401), `PUT /api/user/avatar` (200/401/422), `GET /api/leaderboard?period=weekly|allTime` (200/422), `POST /api/users`-д сонголттой `gender` (анхны дүрийг сонгоно).
- **Файл:** `backend/src/models/avatarOptions.js`, `backend/src/models/User.js`, `backend/src/routes/{avatar,leaderboard}.js`, `backend/src/validators/avatar.js`, `backend/src/store/users.js`, `frontend/components/avatar/{Avatar.jsx,Avatar.css,avatarCatalog.js}`, `frontend/task-01-auth/AvatarEditor.{jsx,css}`, `frontend/task-01-auth/Dashboard.{jsx,css}`, `frontend/components/Navbar.{jsx,css}`, `frontend/task-06-leaderboard/Leaderboard.{jsx,css}`
- **Тест:** `backend/tests/avatar.test.js`, `frontend/tests/AvatarEditor.test.jsx`, `frontend/tests/Leaderboard.test.jsx` (API руу шилжүүлсэн)
- **Хүлээн авах шалгуур:**
  1. Хэрэглэгч `/profile/avatar` дээр үс, хувцас, өнгө, нэмэлтээ сонгоход урьдчилан харагдаж, `Хадгалах` дарахад MongoDB-д хадгалагдана; reload/restart хийсний дараа хэвээр.
  2. Буруу сонголт (жишээ нь `outfit: "spacesuit"`) → 422, өмнөх дүр өөрчлөгдөхгүй.
  3. Dashboard өрөөнд хэрэглэгчийн дүр бодит хэмжээгээр (ширээ, ортой харьцуулж) зогсож, дарахад тохируулах хуудас нээгдэнэ.
  4. Чансааны podium дээр бүтэн дүр, жагсаалтад толгойн дүр харагдана; өгөгдөл `GET /api/leaderboard`-аас ирнэ.

#### Lab 6 (Authentication, authorization, test, Docker) — TASK-01
- **Хэсэг:** Бүртгүүлэх/нэвтрэх, JWT (Bearer) middleware, role-based authorization, `/register` хуудас, frontend+backend `test:ci`, Dockerfile + docker-compose (app + MongoDB).
- **Auth горим:** `team-spec.json` → `authScenario.mode = "bearer"`. JWT `{ sub, role, jti }`, `JWT_SECRET` орчны хувьсагчаас; jti нь MongoDB `Session`-д хадгалагдаж logout хийхэд хүчингүй болно. Эрхийг token-оос биш DB дээрх одоогийн role-оос шалгана.
- **Endpoint (шинэ/өөрчлөгдсөн):**
  - `POST /api/auth/register` → 201 + JWT (үргэлж STUDENT), 422 (validation), 409 (давхардсан нэр)
  - `POST /api/auth/login` → JWT, `POST /api/auth/logout` → 204 (token хүчингүй), `GET /api/auth/me` → 200/401
  - `DELETE /api/users/:id` → **зөвхөн TEACHER**: нэвтрээгүй 401, STUDENT 403, өөрийгөө 422, байхгүй 404, амжилттай 204 (тэмдэглэл, session-ийг хамт устгана)
  - `POST /api/users` `role: TEACHER` → нэвтрээгүй 401, STUDENT 403 (эрх дээшлүүлэхээс сэргийлнэ)
- **Docker:** `Dockerfile` (multi-stage: frontend build → backend runtime), `docker-compose.yml` (`app` + `mongo:7`, `mongo-data` volume), `.dockerignore`. Docker-ийн үндсэн хариуцагч TASK-06 бөгөөд энэ лабд TASK-01 гүйцэтгэв.
- **Файл:** `backend/src/auth/jwt.js`, `backend/src/middleware/auth.js` (`requireAuth`, `requireRole`), `backend/src/routes/{auth,users}.js`, `backend/src/store/users.js`, `backend/src/server.js`, `frontend/task-01-auth/{Register.jsx,Register.css,registerValidation.js,Login.jsx}`, `frontend/services/api.js`, `frontend/App.jsx`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `package.json` (`test:ci`), `eslint.config.js`
- **Тест:** `backend/tests/authz.test.js`, `frontend/tests/Register.test.jsx`, `e2e/integration.spec.js` (`@integration @auth`)
- **Бусдын файлд хийсэн жижиг засвар:** `frontend/tests/LearningPath.test.jsx` (TASK-03) — сул сэдвүүд нэг өгүүлбэрт харагддаг болсон тул текстийг хэсэгчлэн хайдаг болгов (root `test:ci` ногоон байхын тулд).
- **Хүлээн авах шалгуур:**
  1. Token-гүй хүсэлт → 401; хуурамч/хугацаа дууссан/logout хийсэн token → 401; STUDENT-ээр TEACHER-ийн үйлдэл → 403; TEACHER → 204.
  2. `/register` дээр бүртгүүлэхэд `POST /api/auth/register` гарч шууд `/dashboard` нээгдэнэ; буруу оролтод талбарын алдаа, давхардсан нэрэнд серверийн алдаа харагдана.
  3. Root `npm run test:ci` frontend (vitest) болон backend (node:test + Supertest) хоёуланг амжилттай ажиллуулна.
  4. `docker compose up --build` нь MongoDB болон app-ийг асааж `http://localhost:4000`-д ажиллана; `down` хийгээд дахин асаахад өгөгдөл хэвээр.

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

#### Lab 3 (Routing, role UI, E2E) — TASK-06 гүйцэтгэл
- **Хэсэг:** Чансааны role-based UI (TEACHER → `state-forbidden`), чансааны тогтвортой testId-ууд, бүх route-ийн `smoke` ба 375px/1440px `responsive` Playwright тест, чансааны `role` scenario.
- **Тэмдэглэл:** Лекцийн дэлгэрэнгүй (`/explore/lecture/:id`) нь одоо `team-spec.json`-д TASK-05-ийнх тул энэ хэсэгт тооцохгүй. Хуучин `feature/TASK-06-lecture-detail` (PR #4, хаагдсан)-ын smoke/responsive тестийг одоогийн route, JWT нэвтрэлттэй нийцүүлж шинээр бичив.
- **Файл:** `frontend/task-06-leaderboard/Leaderboard.{jsx,css}`, `e2e/task06-helpers.js`, `e2e/smoke.spec.js`, `e2e/responsive.spec.js`, `e2e/leaderboard.spec.js`, `team-spec.json` (`task06-leaderboard-role-*`)
- **testId:** `leaderboard-tab-{weekly,allTime}`, `leaderboard-loading`, `leaderboard-error`, `leaderboard-retry-btn`, `leaderboard-empty`, `leaderboard-podium`, `leaderboard-list`, `leaderboard-row-me`, `leaderboard-my-progress`, `leaderboard-goto-teacher`, `state-forbidden`
- **Тест:** `frontend/tests/Leaderboard.test.jsx` (+2: багшид хаалттай, testId), `e2e/leaderboard.spec.js` (`@role`), `e2e/smoke.spec.js` (`@smoke`, 17 route), `e2e/responsive.spec.js` (`@responsive`, 17 route × 2 өргөн)
- **Хүлээн авах шалгуур:**
  1. STUDENT: podium, "ЧИ" мөр, ахицын карт харагдана; "Бүх цаг" таб солигдоно.
  2. TEACHER: `/leaderboard` → `state-forbidden`, чансааны API дуудагдахгүй, "Багшийн өрөө рүү" товч `/teacher` нээнэ. Нэвтрээгүй → `/login`.
  3. `team-spec.json`-ийн route бүр шууд URL-ээр өөрийн page testId-тай, runtime алдаагүй нээгдэнэ (`smoke`).
  4. Route бүр 375px ба 1440px өргөнд хэвтээ overflow-гүй (`responsive`).

#### Lab 4 (Express REST) — TASK-06
- **Хэсэг:** Шинэ entity **Achievement** (сурлагын тэмдэг) — бусад гишүүнд оноогдоогүй, чансаатай холбоотой gamification хэсэг. Санах ойн store, бүтэн REST CRUD, сервер талын validation.
- **Endpoint:** `GET /api/achievements` (200, буруу `type` 422), `GET /api/achievements/:id` (200/404), `POST /api/achievements` (201/422), `PUT /api/achievements/:id` (200/404/422), `DELETE /api/achievements/:id` (204/404)
- **Файл:** `backend/src/routes/achievements.js`, `backend/src/store/achievements.js`, `backend/src/validators/achievement.js`, `backend/src/app.js` (router холболт, 1 мөр), `backend/package.json` (`test:ci`-д тест нэмэв), `docs/04-api-pages.md`, `team-spec.json` (`lab: 4`, `taskId: TASK-06`)
- **Тест:** `backend/tests/achievements.test.js` (Supertest, 22 тохиолдол: амжилттай ба буруу оролт бүр)
- **Хүлээн авах шалгуур:**
  1. `team-spec.json`-ийн `lab: 4` / `TASK-06` endpoint бүр заасан status буцаана.
  2. Хоосон `title`, буруу `code`/`type`, хүрээнээс гарсан `threshold`/`xpReward`, давхардсан `code` → 422 `{ message, field }`, record үүсэхгүй/өөрчлөгдөхгүй.
  3. `npm run test:ci` амжилттай.

#### Lab 5 (MongoDB/Mongoose + integration) — TASK-06
- **Хэсэг:** Achievement-ийг санах ойгоос MongoDB руу шилжүүлж persistent болгох; хоёр шинэ model ба `User`-тэй хамаарал; `/achievements` хуудсыг бодит API-тай end-to-end холбох.
- **Entity хамаарал:** `UserAchievement.user → User` (TASK-01-ийн model), `UserAchievement.achievement → Achievement`, `UserAchievement.awardedBy → User`. Тэмдэг устгахад олголтууд хамт устна.
- **Endpoint (шинэ):** `POST /api/achievements/:id/award` (201/404/409/422), `GET /api/achievements/user/:userId` (200/404). `GET /api/achievements/:id` нь `holderCount` буцаана. Lab 4-ийн 5 endpoint MongoDB дээр шилжсэн.
- **Frontend:** `/achievements` (`page-achievements`) — `achievements-loading` / `achievements-error` (+ `achievements-retry-btn`) / `achievements-empty` / `achievements-list`, амжилт `achievements-success`. STUDENT: бүх тэмдэг + өөрийн авсан (`data-earned`). TEACHER: нэмэх/засах/устгах маягт (frontend validation + серверийн 422-г талбарт харуулна), устгахын өмнө `ConfirmDialog`. Navbar-т "Тэмдэг" цэс.
- **Файл:** `backend/src/models/{Achievement,UserAchievement}.js`, `backend/src/store/achievements.js` (Mongoose), `backend/src/routes/achievements.js`, `backend/src/server.js` (`seedAchievements`, 3 мөр), `frontend/task-06-leaderboard/{Achievements.jsx,Achievements.css,achievementValidation.js}`, `frontend/services/api.js` (`achievementsApi`), `frontend/App.jsx` (`/achievements` route), `frontend/components/Navbar.jsx` (цэс), `docs/04-api-pages.md`, `team-spec.json`
- **Тест:** `backend/tests/achievementAwards.test.js` (хамаарал, 409/422/404, cascade, restart persistence), `backend/tests/achievements.test.js` (MongoDB дээр), `frontend/tests/Achievements.test.jsx` (loading/success/error, validation, create/edit/delete), `e2e/achievements.spec.js` (`@integration`, `@validation`)
- **Хүлээн авах шалгуур:**
  1. `POST /api/achievements`-ээр үүсгээд backend restart хийсний дараа `GET /api/achievements`-д хэвээр байна.
  2. Багш `/achievements` дээр тэмдэг нэмэхэд `POST /api/achievements` хүсэлт гарч `achievements-success` харагдана; reload хийхэд тэмдэг хэвээр.
  3. Loading, success, error төлөвүүд ялгаатай харагдана; алдааны үед "Дахин оролдох" ажиллана.
  4. `npm run test:ci` амжилттай.
