# StudyQuest — Тоглоомжуулсан сургалтын платформ (Gamified Learning Platform)

> **Хичээл:** F.IT301 Веб систем ба технологи  
> **Төслийн нэр:** StudyQuest  
> **Хувилбар:** 1.0.0  

---

## 📖 1. Төслийн танилцуулга

**StudyQuest** нь их сургуулийн оюутнуудын онолын хичээлийг сонирхолтой, идэвхтэй болгох зорилготой тоглоомжуулсан (Gamified) сургалтын веб платформ юм. Duolingo-ийн туршлага (XP, Өдрийн цуврал-Streak, Лигийн чансаа-Leaderboard) болон оюутны интерактив виртуал өрөөний концепцийг хослуулсан.

* **Оюутан (`STUDENT`):** Өөрийн виртуал өрөөнөөс дадлага хийх, хэвтээ замаар (Learning Path) шат ахин асуулт хариулт (Quiz) өгөх, XP оноо цуглуулах, хичээлийн сангаас лекц уншиж мэдлэгээ шалгах, чансаанд өрсөлдөх боломжтой.
* **Багш (`TEACHER`):** Багшийн удирдлагын өрөөнд суралцагчдын явц, статистикийг хянах, шинэ хичээл (Course) үүсгэх, засах, устгах (CRUD), лекц болон сургалтын материал оруулах боломжтой.

---

## 🛠️ 2. Технологийн стек

* **Frontend:** React 19, Vite, React Router DOM v7
* **Backend:** Node.js, Express REST API (CORS, Token Auth middleware)
* **Тестчлэл:**
  * Vitest & React Testing Library (Frontend нэгж тестүүд)
  * Node Test Runner & Supertest (Backend REST API тестүүд)
  * Playwright (End-to-End автомат тестүүд)
* **Загвар ба код стандарт:** CSS3 (BEM / Модуль бүтэц), ESLint

---

## 🚀 3. Төслийг ажиллуулах заавар

Системийг ажиллуулахын тулд **Frontend** болон **Backend** серверийг зэрэг ажиллуулах шаардлагатай.

### Алхам 1: Хамаарлуудыг (Dependencies) суулгах

Төслийн үндсэн хавтас дээр frontend болон backend-ийн сангуудыг суулгана:

```bash
# 1. Frontend хамаарлуудыг суулгах
npm install

# 2. Backend хамаарлуудыг суулгах
npm --prefix backend install
```

---

### Алхам 1.5: MongoDB тохируулах (Lab 5)

Backend нь өгөгдлөө MongoDB-д хадгална. Connection string-ийг **`MONGODB_URI`** орчны хувьсагчаас авна:

```bash
cp backend/.env.example backend/.env
# backend/.env доторх MONGODB_URI-г өөрийн local MongoDB эсвэл Atlas хаягаар солино
```

`MONGODB_URI` тохируулаагүй бол сервер алдаа хэвлээд зогсоно. Хоосон database дээр анх асахад тестийн хэрэглэгчид автоматаар үүснэ; дараагийн restart-д өгөгдөл устахгүй.
Backend тестүүд (`npm run test:ci`) өөрийн санах ойн MongoDB-г (`mongodb-memory-server`) ашиглах тул бодит database-д бичихгүй.

---

### Алхам 2: Серверүүдийг ажиллуулах

> **Анхаар:** Нэвтрэх болон хэрэглэгчийн мэдээллийн API хүсэлтүүдийг алдаагүй ажиллуулахын тулд **хоёр тусдаа терминал** ашиглана.

#### Терминал 1 — Backend серверийг асаах (Port: 4000):
```bash
npm run start:grader
```
*(эсвэл `npm --prefix backend start`)*  
Амжилттай асвал консол дээр `StudyQuest API listening on 4000` гэж гарна.

#### Терминал 2 — Frontend клиентийг асаах (Port: 5173):
```bash
npm run dev
```
Хөтөч дээрээ **`http://localhost:5173`** хаягаар хандаж системд нэвтэрнэ. Frontend нь `/api` хүсэлтүүдийг Vite proxy-гоор дамжуулан `http://localhost:4000` руу автоматаар илгээнэ.

---

### 🐳 Docker-оор ажиллуулах (Lab 6)

Node, MongoDB суулгалгүйгээр бүх системийг (frontend build + backend + MongoDB) нэг командаар асаана:

```bash
docker compose up --build -d
```

**`http://localhost:4000`** хаягаар орно. Өгөгдөл `mongo-data` volume-д хадгалагдах тул `docker compose down` хийгээд дахин асаахад хэвээр байна (`down -v` бол бүр мөсөн устгана).
`JWT_SECRET`-ийг төслийн үндсэн хавтасны `.env` файлд (`JWT_SECRET=...`) өгнө; өгөөгүй бол compose доторх туршилтын утга ашиглагдана.

---

## 🔐 Authentication ба эрхийн хамгаалалт (Lab 6)

- **Горим:** JWT Bearer — `Authorization: Bearer <token>` (`team-spec.json` → `authScenario.mode = "bearer"`)
- `/register` хуудас эсвэл `POST /api/auth/register` → 201 + token (шинэ хэрэглэгч үргэлж STUDENT)
- Token-гүй, хуурамч, хугацаа дууссан эсвэл logout хийсэн token → **401**
- Эрх хүрэхгүй үйлдэл → **403** (жишээ: `DELETE /api/users/:id` зөвхөн TEACHER)

---

## 🔑 4. Тестийн хэрэглэгчийн эрхүүд

Системд туршилт хийхэд бэлдсэн дараах хэрэглэгчдийн эрхээр нэвтэрч болно:

| Эрх (Role) | Нэвтрэх нэр (Username) | Нууц үг (Password) | Нэвтрэхэд очих хуудас |
|---|---|---|---|
| **Оюутан (STUDENT)** | `temuulen` | `student123` | `/dashboard` (Миний өрөө) |
| **Оюутан (STUDENT)** | `anujin` | `student123` | `/dashboard` (Миний өрөө) |
| **Оюутан (STUDENT)** | `saruul` | `student123` | `/dashboard` (Миний өрөө) |
| **Багш (TEACHER)** | `bagsh` | `teacher123` | `/teacher` (Багшийн өрөө) |

---

## 🧪 5. Тестүүдийг ажиллуулах заавар

Төслийн чанарыг шалгах зориулалттай нэгж болон интеграцийн тестүүдийг дараах командууд бүхий скриптээр ажиллуулна:

```bash
# 1. Frontend Vitest нэгж тестүүдийг ажиллуулах
npm run test:frontend

# 2. Backend API тестүүдийг ажиллуулах (Supertest + санах ойн MongoDB)
npm run test:backend

# 3. Бүх талын CI тест (Frontend vitest → Backend node:test)
npm run test:ci

# 4. E2E (End-to-End Playwright) тестийг ажиллуулах
npm run e2e

# 5. Кодын хэв маягийг шалгах (Linter)
npm run lint
```

---

## 🗺️ 6. Системийн үндсэн хуудсууд (Маршрутууд)

| № | Route | Хуудас | Тодорхойлолт | Эрх |
|---|---|---|---|---|
| 1 | `/login` | Нэвтрэх | Шөнийн өрөө, баталгаажуулалт | Бүгд |
| 2 | `/dashboard` | Миний өрөө | Интерактив өрөө, тэмдэглэл, дадлага руу шилжих | Оюутан, Багш |
| 3 | `/practice` | Дадлага | Хичээл сонгох, явцын хувь | Оюутан |
| 4 | `/practice/:courseId` | Суралцах зам | Хэвтээ scroll бүхий дадлагын зангилаанууд | Оюутан |
| 5 | `/quiz/:unitId` | Асуулт (Quiz) | Сонгох, Үнэн/Худал, Кодын гаралт шалгах | Оюутан |
| 6 | `/quiz/result` | Үр дүн | Оноо, XP болон сул сэдвүүдийн дүн шинжилгээ | Оюутан |
| 7 | `/explore` | Хичээлийн сан | Ангиллаар шүүх, түлхүүр үгээр хайх | Оюутан, Багш |
| 8 | `/topics/:courseId` | Сэдвийн жагсаалт | Хичээлийн сэдвүүд, лекцүүд | Оюутан, Багш |
| 9 | `/explore/lecture/:id`| Лекц үзэх | Markdown лекц, Knowledge Check | Оюутан, Багш |
| 10 | `/leaderboard` | Чансаа | Долоо хоног ба нийт хугацааны онооны эрэмбэ | Оюутан, Багш |
| 11 | `/teacher` | Багшийн өрөө | Хичээлүүдийн удирдлага (CRUD), суралцагчдын тоо | Багш |
| 12 | `/teacher/courses/new`| Хичээл нэмэх | Шинэ курс үүсгэх, лекц нэмэх, материал оруулах | Багш |
| 13 | `/profile/avatar` | Миний дүр | Үс, хувцас, өнгө, нэмэлтээ сонгож дүрээ тохируулах (MongoDB-д хадгална) | Оюутан, Багш |
| 14 | `/register` | Бүртгүүлэх | Шинэ оюутан бүртгүүлж JWT-ээр шууд нэвтэрнэ | Бүгд |

---

## 📁 7. Төслийн бүтэц

```text
├── backend/                  # Node.js Express REST API сервер
│   ├── src/
│   │   ├── routes/           # API маршрутууд (/api/auth, /api/users, /api/health)
│   │   ├── middleware/       # Token authorization middleware
│   │   ├── models/           # Mongoose model-ууд (User, Session, Note)
│   │   ├── store/            # MongoDB-тэй ажиллах store функцууд + seed
│   │   ├── db.js             # MONGODB_URI-аар MongoDB холболт
│   │   ├── validators/       # Оролтын баталгаажуулалт
│   │   ├── app.js            # Express app тохиргоо
│   │   └── server.js         # Сервер асаах цэг (порт: 4000)
│   └── tests/                # Backend API тестүүд
├── docs/                     # Төслийн шинжилгээ ба загварын баримт бичгүүд
├── e2e/                      # Playwright E2E тестүүд
├── frontend/                 # React клиент програм
│   ├── components/           # Дундын компонентууд (Navbar, ProtectedRoute, ConfirmDialog)
│   ├── services/             # Төв API холболт ба Mock үйлчилгээнүүд
│   ├── task-01-auth/         # TASK-01: Нэвтрэх ба Миний өрөө (Dashboard)
│   ├── task-02-quiz/         # TASK-02: Дадлага болон Quiz систем
│   ├── task-03-path/         # TASK-03: Хэвтээ суралцах зам ба Үр дүнгийн хуудас
│   ├── task-04-teacher/      # TASK-04: Багшийн өрөө, Хичээлийн CRUD маягт
│   ├── task-05-explore/      # TASK-05: Хичээлийн сан, Сэдвүүд ба Лекц
│   ├── task-06-leaderboard/  # TASK-06: Чансаа (Leaderboard) ба Глобал UI төлөвүүд
│   ├── tests/                # Frontend Vitest нэгж тестүүд
│   ├── App.jsx               # Маршрутын бүртгэл ба Role guard
│   └── main.jsx              # React DOM эхлэл
├── public/                   # Статик файлууд ба Mock JSON өгөгдлүүд
├── team-spec.json            # Төслийн автомат үнэлгээний гэрээний тодорхойлолт
├── vite.config.js            # Vite тохиргоо болон API proxy
└── WORK_ALLOCATION.md        # Багийн гишүүдийн ажлын хуваарилалт
```
