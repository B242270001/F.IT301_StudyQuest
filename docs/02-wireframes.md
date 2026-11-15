# 02. Дэлгэцийн ноорог ба төлөвүүд (12 хуудас)

## Нийтлэг дүрэм

**Breakpoint:** Desktop ≥ 1024px · Tablet 600–1023px · Mobile < 600px (шалгах өргөн 375px). Ямар ч өргөнд `body` хэвтээ scroll үүсэхгүй. Өргөн контент (хэвтээ зам, хүснэгт, chip) өөрийн `overflow-x: auto` хайрцагт scroll хийнэ.

**Нийтлэг төлөв (TASK-06 эзэмшинэ, бүх хуудас ашиглана):**

| Төлөв | `data-testid` | Харагдах агуулга |
|---|---|---|
| Ачаалж байна | `state-loading` | Skeleton/spinner, товч идэвхгүй |
| Хоосон | `state-empty` | Дүрс + тайлбар + дараагийн үйлдлийн товч |
| Сүлжээний алдаа | `state-error` | "Алдаа гарлаа" + `Дахин оролдох` товч |
| Нэвтрээгүй | `state-login-required` | "Нэвтэрнэ үү" + `Нэвтрэх` товч → `/login` |
| Эрхгүй | `state-forbidden` | "Энэ хуудсыг үзэх эрхгүй" + `Өрөө рүү буцах` товч |
| Олдоогүй | `state-not-found` | "Олдсонгүй" + буцах холбоос |

**Хуудас бүрийн гадна wrapper** нь өөрийн `data-testid` (`page-*`)-тэй үргэлж render хийгдэнэ. Нэвтрэлт эсвэл эрх дутсан үед агуулгын оронд `state-login-required` / `state-forbidden` харагдана (URL-ээр шууд орохыг дэмжих).

**Бүх товч:** хамгийн багадаа 44×44px (mobile), keyboard focus харагдана, өнгөөр дангаар утга илэрхийлэхгүй (икон + текст).

---

## [TASK-01] А. Төгөлдөр

### 1. `/login` — Нэвтрэх · Шөнийн өрөө
- **Эрх:** Бүгд (нэвтэрсэн бол `/dashboard` руу шилжинэ) · **testId:** `page-login`

```
+--------------------------------------------------------------+
|  [Шөнийн өрөө: ор, унтаж буй оюутан, одтой цонх]             |
|                              +-------------------------+     |
|                              | StudyQuest (лого)       |     |
|                              | Өглөөний мэнд!          |     |
|                              | Хичээлдээ бэлэн үү?     |     |
|                              | Нэр       [___________] |     |
|                              | Нууц үг   [___________]👁|    |
|                              | [        Сэрэх        ] |     |
|                              +-------------------------+     |
+--------------------------------------------------------------+
```
- **Талбар:** `login-name` (Нэр), `login-password` (Нууц үг, харуулах/нуух).
- **Товч:** `login-submit` — `Сэрэх`.
- **Validation (талбарын доор):** `login-name-error` "Нэр оруулна уу"; `login-password-error` "Нууц үг оруулна уу", 6-аас богино бол "Нууц үг хамгийн багадаа 6 тэмдэгт байна".
- **Алдаа:** буруу нэр/нууц үг → `login-error` улаан banner "Нэр эсвэл нууц үг буруу байна". Анимейшн эхлэхгүй, оруулсан нэр хэвээр.
- **Илгээж байх үед:** товч идэвхгүй, "Сэрж байна…", spinner.
- **Амжилт:** наран мандах → сэрүүлэг → оюутан босох анимейшн (≤ 2 сек, `prefers-reduced-motion` үед алгасна) → `/dashboard`.
- **Mobile:** form нь доороос гарсан card (өргөн 100%), өрөөний дүрс дээд 30%-д.
- **Тэмдэглэл:** бүртгүүлэх холбоос байхгүй. Dev горимд demo бүртгэлийн сануулга харуулж болно (production-д нуух).

### 2. `/dashboard` — Миний өрөө · Өглөө
- **Эрх:** Student, Teacher · **testId:** `page-dashboard`

```
+---------------------------------------------------------------+
| StudyQuest | 👤 Саруул | ⚡ 890 XP | 🔥 5 өдөр | 🏆 #4          |  HUD
+---------------------------------------------------------------+
|  [📚 Номын тавиур]            [🏆 Цом]                         |
|           [💻 Компьютер]  (Teacher: [📋 Удирдах самбар])       |
|  [🛏️ Ор]                       [🎯 Өнөөдрийн зорилго 40/60 XP] |
+---------------------------------------------------------------+
```
- **HUD:** `hud-name`, `hud-xp`, `hud-streak`, `hud-rank`.
- **Объектууд (дарж шилжинэ):**

| Объект | `data-testid` | Хаашаа | Role |
|---|---|---|---|
| Компьютер | `room-computer` | `/practice` | Бүгд |
| Номын тавиур | `room-bookshelf` | `/explore` | Бүгд |
| Цом | `room-trophy` | `/leaderboard` | Бүгд |
| Ор | `room-bed` | Гарах modal | Бүгд |

- **Өдрийн зорилго** (`daily-goal`): Student-д "40 / 60 XP" progress. Teacher-т "Суралцагч: N" харуулна.
- **Гарах modal:** "Гарах уу?" `logout-confirm` (Тийм, гарах → `/login`), `logout-cancel` (Болих).
- **Төлөв:** ачаалах үед HUD skeleton; алдаа гарвал HUD-д "—" ба `Дахин оролдох`; нэвтрээгүй бол `state-login-required`.
- **Mobile:** HUD 2 мөр болж, объектууд 2×2 card grid; hover tooltip-ыг товшилт/фокусоор орлуулна.

---

## [TASK-02] Мөнхбаяр

### 3. `/practice` — Дадлага · Хичээл сонгох
- **Эрх:** Student · **testId:** `page-practice`
- **Агуулга:** хичээлийн card grid (`practice-course-card`): дүрс, нэр, нэгжийн тоо, биелэлт %, progress bar, `Үргэлжлүүлэх` (`practice-continue`) → `/practice/:courseId`. "Веб систем ба технологи" онцлогдоно. `← Өрөө рүү буцах` → `/dashboard`.
- **Хоосон:** "Дадлага хийх хичээл алга" + `Хичээлийн сан руу очих` → `/explore`.
- **Алдаа:** `state-error` + `Дахин оролдох`. Багш орвол `state-forbidden`.
- **Mobile:** card нэг баганад.

### 5. `/quiz/:unitId` — Дадлага · Асуулт
- **Эрх:** Student · **testId:** `page-quiz`

```
+---------------------------------------------------------+
| ✕ Гарах   Асуулт 2/4  [=====>      ]   ⚡ +10 XP          |
|---------------------------------------------------------|
| Асуултын текст                       [оюутны дүр]       |
| (CODE_OUTPUT бол код блок)                              |
|  ( ) Сонголт А   ( ) Сонголт Б   ( ) В   ( ) Г          |
|  (TRUE_FALSE бол: [Үнэн] [Худал])                       |
| [Шалгах]                                                |
+---------------------------------------------------------+
```
- **Нэг page-д 3 төрөл:** `MULTIPLE_CHOICE` (`quiz-option-*`), `TRUE_FALSE`, `CODE_OUTPUT` (`quiz-code` блок + сонголт).
- **Товч:** `quiz-check` (`Шалгах`, хариулт сонгоогүй бол идэвхгүй) → inline feedback → `quiz-next` (`Дараагийн асуулт`), сүүлийн асуултад `quiz-finish` (`Дуусгах`) → `/quiz/result`.
- **Feedback (`quiz-feedback`):** зөв → ногоон хүрээ, ✓, тайлбар. Буруу → улаан хүрээ, ✗, зөв хариулт ба тайлбар.
- **Гарах:** `✕` дарахад "Ахиц алдагдана" баталгаажуулах modal.
- **Хоосон:** "Энэ нэгжид асуулт алга" + `Замруу буцах`. **Олдоогүй unitId:** `state-not-found`. **Алдаа:** `state-error`.
- **Mobile:** оюутны дүр нуугдана, сонголтууд бүтэн өргөн.

---

## [TASK-03] Тэмүүлэн (Temka)

### 4. `/practice/:courseId` — Дадлага · Суралцах зам
- **Эрх:** Student · **testId:** `page-learning-path`

```
[ Section 1: Вебийн үндэс ] ----------> [ Section 2: Frontend технологи ] ---->
  (✓) Вебийн архитектур                   (⚡) HTML ба CSS   ← Current
  (✓) HTTP ба HTTPS                       (🔒) JavaScript
  (✓) Client ба Server                    (🔒) React үндэс
```
- **Зангилаа (`path-node`, `data-status`):** `COMPLETED` ногоон ✓, `CURRENT` ягаан гэрэлтэлттэй, `AVAILABLE` энгийн, `LOCKED` саарал + 🔒.
- **Үйлдэл:** `CURRENT`/`AVAILABLE`/`COMPLETED` дарахад `/quiz/:unitId`. `LOCKED` дарахад "Өмнөх нэгжийг дуусгана уу" tooltip, шилжихгүй.
- Толгойд хичээлийн нэр, ахиц %, `← Хичээл сонгох`.
- **Олдоогүй courseId:** `state-not-found`. **Хоосон (нэгжгүй):** "Энэ хичээлд нэгж алга". **Алдаа:** `state-error`.
- **Mobile:** зам нь өөрийн хайрцагт хэвтээ scroll хийнэ (body scroll үүсэхгүй). Current зангилаа харагдахаар автоматаар төвлөрнө.


### 6. `/quiz/result` — Дадлага · Хичээлийн үр дүн
- **Эрх:** Student · **testId:** `page-quiz-result`
- **Агуулга:** `result-score` (%), `result-correct` ("3 / 4 зөв"), `result-xp` ("+30 XP"), ахицын bar (нэгж, хичээлийн биелэлт %), дахин давах сэдвүүдийн жагсаалт.
- **Товч:** `result-retry` (`Дахин оролдох` → `/quiz/:unitId`), `result-back-path` (`Замруу буцах` → `/practice/:courseId`), `result-back-room` (`Өрөө рүү буцах` → `/dashboard`).
- **Хоосон (өмнө quiz өгөөгүй):** "Дадлагын үр дүн алга" + `Дадлага эхлэх` → `/practice`. Үр дүн mock store-ийн `latestAttempt`-ээс уншигдана (URL-д хамаарахгүй).

---

## [TASK-04] Д. Баттөмөр

### 11. `/teacher` — Багш · Удирдах өрөө
- **Эрх:** Teacher · **testId:** `page-teacher-room`

```
+---------------------------------------------------------------+
| Багшийн өрөө                          [+ Хичээл нэмэх]        |
| [Хичээл: 3] [Суралцагч: 5] [Дундаж оноо: 78%] [Оролдлого: 12] |  статистик
|  ▇▇ ▇▇▇▇ ▇▇▇  (хичээл тус бүрийн XP — bar chart)               |
|---------------------------------------------------------------|
| Хичээлүүд:  Нэр | Ангилал | Нэгж | Лекц | [Засах] [Устгах]    |
| Суралцагчид: Нэр | XP | Streak | Сүүлд идэвхтэй               |
+---------------------------------------------------------------+
```
- **Статистик:** `stat-courses`, `stat-students`, `stat-avg-score`, `stat-attempts`; хичээл бүрийн bar chart.
- **Хичээлийн хүснэгт:** мөр `course-row` (`data-course-id`), `course-count` (нийт тоо), `course-edit-btn`, `course-delete-btn`. `teacher-add-course` (`+ Хичээл нэмэх`) → `/teacher/courses/new`.
- **Засах:** `course-edit-form` modal (`CourseForm`: нэр, ангилал, дүрс, тайлбар) → `course-save`, `course-cancel`. Validation `/teacher/courses/new`-тэй ижил.
- **Устгах:** `confirm-dialog` "«Нэр» хичээлийг устгах уу? Холбогдох нэгж, сэдэв, лекц хамт устна." → `confirm-delete`, `confirm-cancel`. Амжилттай бол `toast-success`.
- **Суралцагчийн хүснэгт:** нэрээр хайх `student-search`.
- **Хоосон:** хичээл 0 → "Хичээл алга. Эхний хичээлээ нэмнэ үү" + `+ Хичээл нэмэх`. Суралцагч 0 → "Суралцагч бүртгэгдээгүй".
- **Эрх:** Student → `state-forbidden`; зочин → `state-login-required`. **Алдаа:** `state-error`.
- **Mobile:** хүснэгт нь card жагсаалт болно, статистик 2×2.

### 12. `/teacher/courses/new` — Багш · Хичээл нэмэх
- **Эрх:** Teacher · **testId:** `page-teacher-course-form`

```
+---------------------------------------------------------+
| ← Багшийн өрөө      Хичээл нэмэх                        |
| A. Хичээлийн мэдээлэл                                   |
|  Нэр [__________]  Ангилал [Сонгох v]  Дүрс [Сонгох v]  |
|  Тайлбар [______________________________]              |
| B. Материал upload   [Файл сонгох] pdf,pptx,docx,png,jpg|
|  • slides.pdf (1.2 MB)  [Хасах]                         |
| C. Лекц (заавал биш)                                    |
|  Гарчиг [____]  Сэдэв [Шинэ сэдэв v]  Хураангуй [____]  |
|  Агуулга [______]  Кодын жишээ [____]  Демо [Сонгох v]  |
|  Knowledge Check: асуулт 1 / асуулт 2 (заавал биш)      |
| [Хадгалах]  [Болих]                                     |
+---------------------------------------------------------+
```
- **Талбар (testId):** `course-title-input`, `course-category-select`, `course-icon-select`, `course-description-input`, `material-input` (file), `lecture-title-input`, `lecture-topic-input`, `lecture-summary-input`, `lecture-content-input`, `lecture-code-input`, `lecture-demo-select`.
- **Validation (талбарын доор):**

| Талбар | Дүрэм | Мессеж |
|---|---|---|
| `course-title-input` | заавал, 3–80 | "Хичээлийн нэр оруулна уу" / "Нэр хамгийн багадаа 3 тэмдэгт" |
| `course-category-select` | заавал | "Ангилал сонгоно уу" |
| `course-description-input` | заавал, 10–500 | "Тайлбар оруулна уу" / "Тайлбар хамгийн багадаа 10 тэмдэгт" |
| `material-input` | pdf/pptx/docx/png/jpg, ≤ 10 MB | `material-error`: "Зөвхөн pdf, pptx, docx, png, jpg файл" / "Файл 10 MB-аас их байна" |
| Лекц | Аль нэг талбар бөглөгдсөн бол гарчиг, агуулга заавал | "Лекцийн гарчиг оруулна уу" / "Лекцийн агуулга оруулна уу" |

  Алдааны элемент: `<field>-error` (жишээ `course-title-error`).
- **Хадгалах (`course-save`):** зөв бол Course (+ Lecture, Topic) үүсгээд `/teacher` руу шилжиж `toast-success` харуулна. Алдаатай бол record үүсэхгүй, шилжихгүй, оруулсан утга хэвээр, эхний алдаатай талбар руу focus.
- **Илгээж байх үед:** товч идэвхгүй, "Хадгалж байна…".
- **Болих (`course-cancel`):** өөрчлөлттэй бол баталгаажуулж `/teacher` руу буцна.
- **Эрх:** Student → `state-forbidden`; зочин → `state-login-required`.
- **Mobile:** бүх талбар нэг баганад, товчнууд доод талд sticky.

---

## [TASK-05] О. Хүслэн 

### 7. `/explore` — Судлах · Хичээлийн сан
- **Эрх:** Student, Teacher · **testId:** `page-explore`
- **Агуулга:** `explore-search` (хайлтын input, 300ms debounce), ангиллын chip `explore-filter-*` (`Бүгд`, `Web`, `OS`, `Өгөгдлийн сан`, `Програмчлал`), үр дүнгийн тоо `explore-count`, хичээлийн card (`explore-card`) → `Сэдвүүд` товч → `/topics/:courseId`.
- **URL sync:** `?search=` ба `?category=`.
- **Хоосон:** "«xxx» хайлтад илэрц олдсонгүй" + `explore-clear` (`Шүүлтүүр цэвэрлэх`). **Алдаа:** `state-error`.
- **Mobile:** chip нь хэвтээ scroll хайрцагт; card нэг баганад. `← Өрөө рүү буцах`.

### 8. `/topics/:courseId` — Судлах · Сэдвийн жагсаалт
- **Эрх:** Student, Teacher · **testId:** `page-topics`
- **Агуулга:** хичээлийн нэр, нийт ахиц % (`topics-progress`), сэдвийн мөр (`topic-row`, `data-status`: `NOT_STARTED`/`DONE`) → дарахад тухайн сэдвийн лекц `/explore/lecture/:id`. `← Хичээлийн сан` → `/explore`.
- **Хоосон:** "Энэ хичээлд сэдэв алга". **Олдоогүй:** `state-not-found`. **Алдаа:** `state-error`.

---

## [TASK-06] Б. Цогжавхлан


### 9. `/explore/lecture/:id` — Судлах · React лекц
- **Эрх:** Student, Teacher · **testId:** `page-lecture`

```
+----------------------------------------------------------+
| ← Сэдвүүд | Веб систем > React Components                |
| Сэдвүүд    |    React Components                         |
| - Client.. | [App] ├─[Header] └─[Content]                |
| > React    | [ Render хийх ]  (step-by-step animation)   |
|            | ```jsx function App() {...}```              |
|            | Knowledge Check: 2 асуулт  [Шалгах]         |
+----------------------------------------------------------+
```
- **Үйлдэл:** `lecture-render` (`Render хийх`) — App → Header → Content дарааллаар анимейшн. `prefers-reduced-motion` үед бүгдийг шууд харуулна.
- **Knowledge Check:** `kc-question-*`, `kc-submit` (`Шалгах`) → зөв/буруу feedback, тэр сэдэв `DONE` болж ахиц шинэчлэгдэнэ.
- **Teacher-д л харагдах:** `lecture-edit-btn` → `lecture-edit-form` (гарчиг, хураангуй, агуулга; validation: гарчиг, агуулга заавал) → `lecture-save`; `lecture-delete-btn` → `confirm-dialog` → `confirm-delete` → `/topics/:courseId`. Student-д эдгээр товч DOM-д байхгүй.
- **Олдоогүй:** `state-not-found`. **Алдаа:** `state-error`.
- **Mobile:** зүүн цэс drawer болж `☰ Сэдвүүд` товчоор нээгдэнэ; код блок өөрийн хайрцагт scroll.

### 10. `/leaderboard` — Чансаа · Долоо хоног
- **Эрх:** Student, Teacher · **testId:** `page-leaderboard`

```
        [ 🥈 Номин ]  [ 🥇 Бат-Эрдэнэ ]  [ 🥉 Тэмүүлэн ]   (podium)
 [Энэ долоо хоног] [Нийт]
 4 | 🎯 Чи (Саруул)  | 890 XP (+40) | ▲ 1   ← тодорсон
 5 | Болд            | 820 XP       | ▼ 1
```
- **Таб:** `leaderboard-tab-weekly` (`Энэ долоо хоног`, анхдагч), `leaderboard-tab-all` (`Нийт`).
- **Podium:** `podium-1`, `podium-2`, `podium-3`. 
- **Мөр:** `leaderboard-row` (`data-rank`), өөрийн мөр `leaderboard-me` + "Чи" тэмдэг, ягаан дэвсгэр. Эрэмбийн өөрчлөлт ▲/▼ (икон + тоо).
- Teacher чансаанд оролцохгүй (жагсаалтад харагдахгүй, `leaderboard-me` байхгүй).
- **Хоосон:** "Чансаа бүрдээгүй байна". Гурваас цөөн хэрэглэгчтэй бол podium байгаа хэмжээгээр. **Алдаа:** `state-error`.
- **Mobile:** podium жижгэрнэ.

---

## Холбоотой дэлгэцийн схем

```
/login → /dashboard ─┬─ 💻 /practice → /practice/:courseId → /quiz/:unitId → /quiz/result
                     ├─ 📚 /explore → /topics/:courseId → /explore/lecture/:id
                     ├─ 🏆 /leaderboard
                     ├─ 📋 (Teacher) /teacher → /teacher/courses/new
                     └─ 🛏️ Гарах modal → /login
```

## Ноорогийн файлууд

Доорх зургуудыг repository-д хамт хадгална (desktop + mobile хувилбартай):

```
./wireframes/01-login.png            ./wireframes/07-explore.png
./wireframes/02-dashboard.png        ./wireframes/08-topics.png
./wireframes/03-practice.png         ./wireframes/09-lecture.png
./wireframes/04-learning-path.png    ./wireframes/10-leaderboard.png
./wireframes/05-quiz.png             ./wireframes/11-teacher-room.png
./wireframes/06-quiz-result.png      ./wireframes/12-teacher-course-form.png
```

## Хариуцлага

| Хариуцагч | Хуудас |
|---|---|
| TASK-01 А. Төгөлдөр | 1, 2 |
| TASK-02 Мөнхбаяр | 3, 5 |
| TASK-03 Тэмүүлэн | 4, 6 |
| TASK-04 Д. Баттөмөр | 11, 12 |
| TASK-05 О. Хүслэн | 7, 8 |
| TASK-06 Б. Цогжавхлан | 9, 10 |