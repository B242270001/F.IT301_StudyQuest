# 04. SPA хуудас ба REST API гэрээ

> Энэ баримт нь [../team-spec.json](../team-spec.json)-той яг нийцнэ. Өөрчлөлт хийвэл хоёуланг хамт шинэчилнэ.
> Lab 3: backend байхгүй, mock store ажиллана. Lab 4–6: доорх API бодитоор хэрэгжинэ.

## 1. SPA route (12)

| № | Route | Хуудас | `data-testid` | Эрх | Эзэн | API |
|---|---|---|---|---|---|---|
| 1 | `/login` | Нэвтрэх | `page-login` | Бүгд | TASK-01 | `POST /api/auth/login` |
| 2 | `/dashboard` | Миний өрөө | `page-dashboard` | Student, Teacher | TASK-01 | `GET /api/user/profile` |
| 3 | `/practice` | Хичээл сонгох | `page-practice` | Student | TASK-02 | `GET /api/courses/practice` |
| 4 | `/practice/:courseId` | Суралцах зам | `page-learning-path` | Student | TASK-03 | `GET /api/units/path/:courseId` |
| 5 | `/quiz/:unitId` | Асуулт | `page-quiz` | Student | TASK-02 | `GET /api/quiz/:unitId`, `POST /api/quiz/check` |
| 6 | `/quiz/result` | Үр дүн | `page-quiz-result` | Student | TASK-03 | `POST /api/quiz/submit`, `GET /api/attempts/latest` |
| 7 | `/explore` | Хичээлийн сан | `page-explore` | Student, Teacher | TASK-05 | `GET /api/courses/explore` |
| 8 | `/topics/:courseId` | Сэдвийн жагсаалт | `page-topics` | Student, Teacher | TASK-05 | `GET /api/courses/:courseId/topics` |
| 9 | `/explore/lecture/:id` | Лекц | `page-lecture` | Student, Teacher | TASK-05 | `GET/PUT/DELETE /api/lectures/:id`, `POST /api/lectures/:id/knowledge-check` |
| 10 | `/leaderboard` | Чансаа | `page-leaderboard` | Student, Teacher | TASK-06 | `GET /api/leaderboard` |
| 11 | `/teacher` | Удирдах өрөө | `page-teacher-room` | Teacher | TASK-04 | `GET /api/teacher/overview`, `PUT/DELETE /api/teacher/courses/:id` |
| 12 | `/teacher/courses/new` | Хичээл нэмэх | `page-teacher-course-form` | Teacher | TASK-04 | `POST /api/teacher/courses`, `POST /api/teacher/lectures`, `POST /api/uploads/material` |

**Route-ийн зохион байгуулалт:**
- `/` нь нэвтэрсэн бол `/dashboard`, үгүй бол `/login` руу redirect хийнэ (spec-ийн route биш).
- Static `/quiz/result`-ыг `/quiz/:unitId`-тэй андуурахгүй: static route-ийг тусдаа тодорхойлно (React Router v6 static segment-ийг өндөр эрэмбэлнэ).
- Тодорхойгүй path → `page-not-found` (`state-not-found`).
- Хамгаалагдсан route дээр нэвтрээгүй бол wrapper `page-*` + `state-login-required`; role таарахгүй бол `page-*` + `state-forbidden`. Mock горимд хуудас ингэж шууд URL-аар нээгдэнэ.

## 2. Нийтлэг гэрээ

- Auth: `Authorization: Bearer <JWT>`. Mock горимд session нь `localStorage` `studyquest.session`.
- Алдааны хэлбэр: `{ "message": "Нэр оруулна уу", "field": "title" }` (`field` заавал биш).
- **Статус:** буруу оролт **422**; нэвтрээгүй **401**; role/эзэмшил таарахгүй **403**; байхгүй record **404**; файлын хэмжээ хэтэрсэн **413**.
- POST/PUT алдаатай үед record үүсгэх, өөрчлөхгүй. **DELETE нь 204, body-гүй.**
- `passwordHash`, quiz-ийн `correctAnswer` нь `GET` response-д буцахгүй.

## 3. REST API (22 endpoint)

| № | Method | Path | Эрх | Амжилт | Алдаа | Эзэн |
|---|---|---|---|---|---|---|
| 1 | GET | `/api/health` | Бүгд | 200 `{status:"ok"}` | — | TASK-01 (Lab 4 суурь; TASK-06 Lab 6-д хамгаална) |
| 2 | POST | `/api/auth/login` | Зочин | 200 | 401, 422 | TASK-01 |
| 3 | GET | `/api/user/profile` | Student, Teacher | 200 | 401 | TASK-01 |
| 3a | GET | `/api/users` | Бүгд | 200 | — | TASK-01 (Lab 4 User list) |
| 3b | GET | `/api/users/:id` | Бүгд | 200 | 404 | TASK-01 (Lab 4 User detail) |
| 3c | POST | `/api/users` | Зочин | 201 | 422 | TASK-01 (Lab 4 User create) |
| 4 | GET | `/api/courses/practice` | Student | 200 | 401, 403 | TASK-02 |
| 5 | GET | `/api/quiz/:unitId` | Student | 200 | 401, 403, 404 | TASK-02 |
| 6 | POST | `/api/quiz/check` | Student | 200 | 401, 403, 404, 422 | TASK-02 |
| 7 | POST | `/api/quiz/submit` | Student | 201 | 401, 403, 404, 422 | TASK-02 |
| 8 | GET | `/api/units/path/:courseId` | Student | 200 | 401, 403, 404 | TASK-03 |
| 9 | GET | `/api/attempts/latest` | Student | 200 | 401, 403, 404 | TASK-03 |
| 10 | GET | `/api/teacher/overview` | Teacher | 200 | 401, 403 | TASK-04 |
| 11 | POST | `/api/teacher/courses` | Teacher | 201 | 401, 403, 422 | TASK-04 |
| 12 | PUT | `/api/teacher/courses/:id` | Teacher | 200 | 401, 403, 404, 422 | TASK-04 |
| 13 | DELETE | `/api/teacher/courses/:id` | Teacher | 204 | 401, 403, 404 | TASK-04 |
| 14 | POST | `/api/teacher/lectures` | Teacher | 201 | 401, 403, 404, 422 | TASK-04 |
| 15 | POST | `/api/uploads/material` | Teacher | 201 | 401, 403, 413, 422 | TASK-04 |
| 16 | GET | `/api/courses/explore` | Student, Teacher | 200 | 401 | TASK-05 |
| 17 | GET | `/api/courses/:courseId/topics` | Student, Teacher | 200 | 401, 404 | TASK-05 |
| 18 | GET | `/api/lectures/:id` | Student, Teacher | 200 | 401, 404 | TASK-05 |
| 19 | PUT | `/api/lectures/:id` | Teacher | 200 | 401, 403, 404, 422 | TASK-05 |
| 20 | DELETE | `/api/lectures/:id` | Teacher | 204 | 401, 403, 404 | TASK-05 |
| 21 | POST | `/api/lectures/:id/knowledge-check` | Student | 200 | 401, 403, 404, 422 | TASK-05 |
| 22 | GET | `/api/leaderboard` | Student, Teacher | 200 | 401, 422 | TASK-06 |

## 4. Endpoint-ийн дэлгэрэнгүй

### TASK-01 — Auth
**POST `/api/auth/login`**
```json
// Request
{ "username": "saruul", "password": "student123" }
// 200
{ "token": "jwt...", "user": { "id": "U01", "displayName": "Саруул", "role": "STUDENT" } }
// 422 { "message": "Нэр оруулна уу", "field": "username" }
// 401 { "message": "Нэр эсвэл нууц үг буруу байна" }
```
**GET `/api/user/profile`** → 200 `{ "id":"U01","displayName":"Саруул","role":"STUDENT","totalXp":890,"todayXp":40,"dailyGoalXp":60,"streakDays":5,"rank":4 }`; 401 токенгүй.

**GET `/api/users`** → 200 `[ { "id":"U01","username":"anujin","displayName":"...","role":"STUDENT" } ]` (`password` байхгүй).

**GET `/api/users/:id`** → 200 хэрэглэгч; 404 `{ "message": "Хэрэглэгч олдсонгүй" }`.

**POST `/api/users`**
```json
// Request
{ "username": "lab4user", "password": "secret123", "displayName": "Лабын Хэрэглэгч", "role": "STUDENT" }
// 201 { "id": "U11", "username": "lab4user", "displayName": "Лабын Хэрэглэгч", "role": "STUDENT" }
// 422 { "message": "Нэр оруулна уу", "field": "username" }
```

### TASK-02 — Practice ба Quiz
**GET `/api/courses/practice`** → 200 `[ { "id":"C01","title":"Веб систем ба технологи","icon":"web","unitCount":6,"progress":45,"isFeatured":true } ]`

**GET `/api/quiz/:unitId`** → 200 `{ "unitId":"UN04","title":"HTML ба CSS","questions":[ { "id":"Q03","type":"CODE_OUTPUT","questionText":"...","codeSnippet":"...","options":["a","b","c"],"xpReward":10 } ] }` (`correctAnswer` байхгүй).

**POST `/api/quiz/check`** — нэг асуултыг шалгана (inline feedback).
```json
// Request  { "questionId": "Q01", "answer": "useState" }
// 200      { "isCorrect": true, "correctAnswer": "useState", "explanation": "..." }
// 422      { "message": "Хариулт сонгоно уу", "field": "answer" }
```

**POST `/api/quiz/submit`** — attempt үүсгэж, XP болон progress шинэчилнэ.
```json
// Request
{ "unitId": "UN04", "answers": [ { "questionId": "Q01", "answer": "useState" } ] }
// 201
{ "attemptId": "A01", "scorePercent": 100, "correctCount": 4, "totalCount": 4, "xpEarned": 40, "totalXp": 930 }
// 422 { "message": "Бүх асуултад хариулна уу", "field": "answers" }
```

### TASK-03 — Зам ба үр дүн
**GET `/api/units/path/:courseId`** → 200 `{ "courseTitle":"Веб систем ба технологи","progress":45,"sections":[ { "title":"Вебийн үндэс","units":[ { "id":"UN01","title":"Вебийн архитектур","status":"COMPLETED" } ] } ] }`; 404 хичээл олдоогүй.

**GET `/api/attempts/latest`** → 200 `{ "attemptId":"A01","unitId":"UN04","courseId":"C01","scorePercent":75,"correctCount":3,"totalCount":4,"xpEarned":30,"unitProgress":100,"courseProgress":55,"weakTopics":["JS Events"] }`; 404 attempt байхгүй (UI хоосон төлөв харуулна).

### TASK-04 — Багш
**GET `/api/teacher/overview`** → 200
```json
{ "stats": { "courseCount": 3, "studentCount": 5, "avgScore": 78, "attemptCount": 12 },
  "xpByCourse": [ { "courseId": "C01", "title": "Веб систем ба технологи", "xp": 2400 } ],
  "courses": [ { "id":"C01","title":"...","category":"WEB","unitCount":6,"lectureCount":1 } ],
  "students": [ { "id":"U01","displayName":"Саруул","totalXp":890,"streakDays":5,"lastActiveAt":"2026-10-23T09:00:00Z" } ] }
```
**POST `/api/teacher/courses`** (201) / **PUT `/api/teacher/courses/:id`** (200)
```json
// Request
{ "title": "Мобайл хөгжүүлэлт", "description": "React Native үндэс", "category": "PROGRAMMING", "icon": "mobile" }
// 201/200  { "course": { "id": "C04", "title": "Мобайл хөгжүүлэлт" } }
// 422      { "message": "Хичээлийн нэр оруулна уу", "field": "title" }   // PUT-д 404 олдоогүй
```
**DELETE `/api/teacher/courses/:id`** → 204, body-гүй; 404; 403 (student). Холбогдох Unit/Topic/Lecture устна.

**POST `/api/teacher/lectures`** → 201 `{ "lecture": { "id":"L06","title":"..." } }`. Request: `{ "courseId","topicTitle" (эсвэл "topicId"),"title","summary","content","codeSample","demoType","materials":[...],"knowledgeCheck":[...] }`. 422 `{ "message":"Лекцийн гарчиг оруулна уу","field":"title" }`.

**POST `/api/uploads/material`** — `multipart/form-data`, `file` талбар. Зөвхөн pdf, pptx, docx, png, jpg; ≤ 10 MB.
`201 { "url":"/uploads/slides.pdf","name":"slides.pdf","sizeBytes":1258291 }`; 422 буруу төрөл; 413 хэмжээ хэтэрсэн; 401 нэвтрээгүй; 403 Student.

### TASK-05 — Судлах
**GET `/api/courses/explore?search=react&category=WEB`** → 200 `[ { "id":"C01","title":"...","category":"WEB","topicCount":6,"lectureCount":1 } ]` (`search` нь нэр/тайлбараар, том жижгийг ялгахгүй; `category` нь enum, буруу утга 422). Илэрц байхгүй бол `[]`.

**GET `/api/courses/:courseId/topics`** → 200 `{ "courseTitle":"...","progress":33,"topics":[ { "id":"TP05","title":"React Components","order":5,"status":"DONE","lectureId":"L05" } ] }`; 404.

**GET `/api/lectures/:id`** → 200 `{ "id":"L05","title":"React Components","content":"...","codeSample":"...","demoType":"REACT_RENDER","materials":[],"knowledgeCheck":[ { "question":"...","options":[...] } ],"topics":[ {"id":"TP01","title":"Client-Server","lectureId":"L01"} ] }`; 404.

**PUT `/api/lectures/:id`** (Teacher) → 200 засагдсан lecture; 422 `{ "message":"Лекцийн гарчиг оруулна уу","field":"title" }`. **DELETE** → 204, body-гүй.

**POST `/api/lectures/:id/knowledge-check`** → Request `{ "answers": ["...","..."] }`; 200 `{ "correctCount":2,"totalCount":2,"topicStatus":"DONE" }`; 422 хариулаагүй асуулттай үед.

### TASK-06 — Чансаа ба техникийн
**GET `/api/leaderboard?period=weekly|allTime`** → 200 `[ { "rank":1,"userId":"U02","name":"Бат-Эрдэнэ","xp":1240,"change":0 }, { "rank":4,"userId":"U01","name":"Саруул","xp":890,"change":1,"isMe":true } ]`. `period` өөр утгатай бол 422. Багш жагсаалтад орохгүй.

**GET `/api/health`** → 200 `{ "status": "ok" }` (Lab 4-д TASK-01 серверийн суурь болгон хэрэгжүүлнэ).

## 5. Хүлээн авах шалгуур

- Хоосон нэртэй `POST /api/teacher/courses` → 422, дараагийн `GET /api/teacher/overview`-д шинэ хичээл үүсээгүй.
- Student токентой `DELETE /api/teacher/courses/:id` → 403; токенгүй → 401; байхгүй id → 404; амжилттай → 204 body-гүй.
- UI: хичээл нэмэх → жагсаалтад харах → засах → устгах урсгал ажиллана.
- Lab 3-д дээрх бүх урсгал mock store дээр ажиллаж, `/api` руу ямар ч хүсэлт явахгүй.
- Бүх endpoint-ийн route, status, scenario `team-spec.json`-д бүртгэгдсэн.