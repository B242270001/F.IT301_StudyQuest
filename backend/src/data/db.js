/**
 * TASK-04 — Д. Баттөмөр
 * In-memory mock database (Lab 4)
 * Lab 6-д MongoDB-тэй солигдоно.
 */

const courses = [
  {
    id: "C01",
    title: "Веб систем ба технологи",
    description: "Вебийн архитектур, HTTP, HTML/CSS, JavaScript судлах.",
    category: "WEB",
    icon: "web",
    isFeatured: true,
    createdBy: "U06",
    createdAt: "2026-10-01T00:00:00Z",
    unitCount: 6,
    lectureCount: 1,
    xp: 2400,
  },
  {
    id: "C02",
    title: "Үйлдлийн систем",
    description: "Процесс, санах ой, файлын системийн удирдлага.",
    category: "OS",
    icon: "os",
    isFeatured: false,
    createdBy: "U06",
    createdAt: "2026-10-02T00:00:00Z",
    unitCount: 2,
    lectureCount: 0,
    xp: 1000,
  },
  {
    id: "C03",
    title: "Өгөгдлийн сан",
    description: "SQL, NoSQL өгөгдлийн сан ба загварчлал.",
    category: "DATABASE",
    icon: "db",
    isFeatured: false,
    createdBy: "U06",
    createdAt: "2026-10-03T00:00:00Z",
    unitCount: 2,
    lectureCount: 0,
    xp: 1000,
  },
];

const lectures = [
  {
    id: "L05",
    topicId: "TP05",
    courseId: "C01",
    title: "React Components",
    summary: "Component-ийн тухай",
    content: "React component нь UI-ийн бие даасан хэсэг юм.",
    codeSample: "function Hello() { return <h1>Hello!</h1>; }",
    demoType: "REACT_RENDER",
    materials: [],
    knowledgeCheck: [
      {
        question: "React component гэж юу вэ?",
        options: ["UI блок", "Database", "Server", "API"],
        correctAnswer: "UI блок",
      },
    ],
    createdBy: "U06",
    createdAt: "2026-10-10T00:00:00Z",
  },
];

const students = [
  {
    id: "U01",
    displayName: "А. Саруул",
    role: "STUDENT",
    totalXp: 890,
    streakDays: 5,
    lastActiveAt: "2026-10-23T09:00:00Z",
  },
  {
    id: "U02",
    displayName: "Бат-Эрдэнэ",
    role: "STUDENT",
    totalXp: 1240,
    streakDays: 12,
    lastActiveAt: "2026-10-24T10:00:00Z",
  },
  {
    id: "U03",
    displayName: "Номин",
    role: "STUDENT",
    totalXp: 1120,
    streakDays: 9,
    lastActiveAt: "2026-10-23T15:00:00Z",
  },
  {
    id: "U04",
    displayName: "Д. Анужин",
    role: "STUDENT",
    totalXp: 980,
    streakDays: 7,
    lastActiveAt: "2026-10-22T08:00:00Z",
  },
  {
    id: "U05",
    displayName: "Болд",
    role: "STUDENT",
    totalXp: 820,
    streakDays: 3,
    lastActiveAt: "2026-10-21T12:00:00Z",
  },
];

let _courseIdCounter = 4;
let _lectureIdCounter = 6;

function nextCourseId() {
  return `C${String(_courseIdCounter++).padStart(2, "0")}`;
}

function nextLectureId() {
  return `L${String(_lectureIdCounter++).padStart(2, "0")}`;
}

module.exports = { courses, lectures, students, nextCourseId, nextLectureId };
