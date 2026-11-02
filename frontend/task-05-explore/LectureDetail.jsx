import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { mockCourses, mockLectures, mockProgress, mockTopics } from "./mock/mockExplore";
import arrowLeft from "./assets/arrow-left.svg";
import circleCheck from "./assets/circle-check.svg";
import circle from "./assets/circle.svg";
import bookOpen from "./assets/book-open.svg";
import bookOpenSmall from "./assets/book-open-small.svg";
import lightbulb from "./assets/lightbulb.svg";
import copyIcon from "./assets/copy.svg";
import branches from "./assets/branches.svg";
import play from "./assets/play.svg";
import chevronUp from "./assets/chevron-up.svg";
import checkWhite from "./assets/check.svg";
import checkPurple from "./assets/check-purple.svg";
import checkGreen from "./assets/check-green.svg";
import xIcon from "./assets/x.svg";
import "./LectureDetail.css";

const CATEGORY_LABELS = { WEB: "Web", OS: "OS", DATABASE: "Өгөгдлийн сан", PROGRAMMING: "Програмчлал" };
const LETTERS = "ABCDEFGH";
const KEYWORDS = /(\b(?:function|const|let|import|export|default|from|class|new)\b)/;
const STEP_MS = 700;
const ANSWER_ICONS = { selected: checkPurple, correct: checkGreen, wrong: xIcon };

// demoType бүрийн "Дүрслэх алхам": эх зангилаа → хүүхэд зангилаа → дэлгэцийн үр дүн
const DEMOS = {
  REACT_RENDER: {
    label: "КОМПОНЕНТЫН МОД",
    root: "App",
    children: ["Header", "Content"],
    preview: ["Миний хичээл", "React сурцгаая!"],
    steps: [
      ["App дуудагдана", "React үндсэн App функцийг ажиллуулж JSX-ийг уншина."],
      ["Хүүхэд хэсгүүд үүснэ", "Header ба Content тус бүр өөрийн JSX-ийг буцаана."],
      ["Дэлгэц шинэчлэгдэнэ", "React эдгээр хэсгийг DOM-д нэгтгэн харуулна."],
    ],
  },
  CLIENT_SERVER: {
    label: "ХҮСЭЛТИЙН УРСГАЛ",
    root: "Браузер",
    children: ["Request", "Server"],
    preview: ["Сайн байна уу!", "GET / · 200 OK"],
    steps: [
      ["Хүсэлт илгээгдэнэ", "Браузер URL-ийн дагуу серверт HTTP request илгээнэ."],
      ["Сервер боловсруулна", "app.get('/') маршрут хүсэлтийг хүлээн авна."],
      ["Хариу харагдана", "res.send()-ийн илгээсэн хариуг браузер харуулна."],
    ],
  },
  HTTP: {
    label: "HTTP УРСГАЛ",
    root: "fetch()",
    children: ["Request", "Response"],
    preview: ["200 OK", "res.json() → data"],
    steps: [
      ["Хүсэлт бэлдэнэ", "fetch() GET method-той request үүсгэнэ."],
      ["Сервер хариулна", "Сервер status code ба JSON body буцаана."],
      ["Өгөгдөл ашиглагдана", "res.json()-оор задалж console-д хэвлэнэ."],
    ],
  },
  STATE: {
    label: "STATE УРСГАЛ",
    root: "Counter",
    children: ["count", "setCount"],
    preview: ["Тоолуур: 1", "+1 товч дарагдлаа"],
    steps: [
      ["Анхны render", "useState(0) нь count-ийг 0 болгоно."],
      ["State өөрчлөгдөнө", "+1 дарахад setCount(count + 1) дуудагдана."],
      ["Дахин render", "React шинэ count-оор дэлгэцийг шинэчилнэ."],
    ],
  },
};

const readMinutes = ({ content, codeSample = "" }) =>
  Math.max(1, Math.ceil(`${content} ${codeSample}`.split(/\s+/).length / 100));

function codeFileName({ demoType, codeSample }) {
  if (/^\s*<!DOCTYPE/i.test(codeSample)) return "index.html";
  if (demoType === "REACT_RENDER" || demoType === "STATE") return "App.jsx";
  if (demoType === "CLIENT_SERVER") return "server.js";
  return "main.js";
}

const highlight = (code) =>
  code.split(KEYWORDS).map((part, i) => (i % 2 ? <span key={i} className="lec-kw">{part}</span> : part));

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

async function loadLecture(id, studentId) {
  const lecture = await mockLectures.getById(id);
  if (!lecture) return null;
  const [course, topics, lectures, progress] = await Promise.all([
    mockCourses.getById(lecture.courseId),
    mockTopics.getByCourse(lecture.courseId),
    mockLectures.getByCourse(lecture.courseId),
    studentId ? mockProgress.getTopicProgress(studentId) : [],
  ]);
  return {
    lecture,
    course,
    topics: topics.map((topic) => ({
      ...topic,
      lectureId: lectures.find((l) => l.topicId === topic.id)?.id,
      status: progress.find((p) => p.topicId === topic.id)?.status ?? "NOT_STARTED",
    })),
  };
}

function validate({ title, summary, content }) {
  const errors = {};
  if (!title.trim()) errors.title = "Лекцийн гарчиг оруулна уу";
  else if (title.trim().length < 3 || title.trim().length > 100) errors.title = "Гарчиг 3–100 тэмдэгт байна";
  if (summary.trim().length > 300) errors.summary = "Хураангуй 300 тэмдэгтээс ихгүй байна";
  if (!content.trim()) errors.content = "Лекцийн агуулга оруулна уу";
  return errors;
}

export default function LectureDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isTeacher = user?.role === "TEACHER";
  const studentId = isTeacher ? null : user?.id;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const key = `${id}#${attempt}`;

  useEffect(() => {
    let active = true;
    loadLecture(id, studentId)
      .then((data) => active && setResult({ key, status: data ? "ready" : "not-found", data }))
      .catch(() => active && setResult({ key, status: "error" }));
    return () => {
      active = false;
    };
  }, [key, id, studentId]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const status = result.key === key ? result.status : "loading";
  const data = result.data;
  const patchData = (patch) => setResult((r) => ({ ...r, data: { ...r.data, ...patch } }));

  const saveLecture = async (changes) => {
    patchData({ lecture: await mockLectures.update(data.lecture.id, changes) });
  };

  const deleteLecture = async () => {
    await mockLectures.remove(data.lecture.id);
    navigate(`/topics/${data.lecture.courseId}`);
  };

  const completeTopic = async (topicId, score) => {
    await mockProgress.completeTopic(studentId, topicId, score);
    patchData({ topics: data.topics.map((t) => (t.id === topicId ? { ...t, status: "DONE" } : t)) });
  };

  return (
    <div className="lec-page" data-testid="page-lecture">
      <Navbar user={user} />

      {status === "loading" && (
        <p className="lec-state" data-testid="state-loading" role="status">Ачаалж байна…</p>
      )}
      {status === "error" && (
        <div className="lec-state" data-testid="state-error" role="alert">
          <p>Алдаа гарлаа</p>
          <button type="button" className="lec-btn" onClick={() => setAttempt(attempt + 1)}>Дахин оролдох</button>
        </div>
      )}
      {status === "not-found" && (
        <div className="lec-state" data-testid="state-not-found">
          <p>Лекц олдсонгүй</p>
          <Link to="/explore" className="lec-back">
            <img src={arrowLeft} alt="" />
            Хичээлийн сан
          </Link>
        </div>
      )}

      {status === "ready" && (
        <main className="lec-workspace">
          <button
            type="button"
            className="lec-btn lec-drawer-toggle"
            aria-expanded={drawerOpen}
            aria-controls="lec-topics"
            onClick={() => setDrawerOpen(true)}
          >
            ☰ Сэдвүүд
          </button>
          {drawerOpen && <div className="lec-drawer-backdrop" onClick={() => setDrawerOpen(false)} />}

          <TopicNav
            course={data.course}
            topics={data.topics}
            currentTopicId={data.lecture.topicId}
            showProgress={!isTeacher}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          <LectureArticle
            key={data.lecture.id}
            lecture={data.lecture}
            topics={data.topics}
            isTeacher={isTeacher}
            onSave={saveLecture}
            onDelete={deleteLecture}
            onComplete={completeTopic}
          />
        </main>
      )}
    </div>
  );
}

function TopicNav({ course, topics, currentTopicId, showProgress, open, onClose }) {
  const doneCount = topics.filter((t) => t.status === "DONE").length;

  return (
    <aside id="lec-topics" className={`lec-topics${open ? " is-open" : ""}`} aria-label="Сэдвүүд">
      <div className="lec-topics-top">
        <Link to="/explore" className="lec-back">
          <img src={arrowLeft} alt="" />
          Хичээлийн сан
        </Link>
        <button type="button" className="lec-drawer-close" onClick={onClose} aria-label="Сэдвүүдийг хаах">✕</button>
      </div>
      <hr className="lec-divider" />
      <h2 className="lec-course">{course?.title}</h2>
      <p className="lec-meta">
        {CATEGORY_LABELS[course?.category] ?? course?.category} · {topics.length} сэдэв
      </p>
      {showProgress && (
        <>
          <div
            className="lec-progress"
            role="progressbar"
            aria-label="Хичээлийн ахиц"
            aria-valuemin={0}
            aria-valuemax={topics.length}
            aria-valuenow={doneCount}
          >
            <span style={{ width: `${topics.length ? (doneCount / topics.length) * 100 : 0}%` }} />
          </div>
          <p className="lec-progress-text">{doneCount} / {topics.length} сэдэв дууссан</p>
        </>
      )}

      <ol className="lec-topic-list">
        {topics.map((topic) => {
          const current = topic.id === currentTopicId;
          const done = topic.status === "DONE";
          const body = (
            <>
              <img src={current ? bookOpen : done ? circleCheck : circle} alt="" />
              <span className="lec-topic-title">{topic.title}</span>
              {done && <span className="lec-sr"> (дууссан)</span>}
            </>
          );
          return (
            <li key={topic.id}>
              {topic.lectureId ? (
                <Link
                  to={`/explore/lecture/${topic.lectureId}`}
                  className={`lec-topic${current ? " is-current" : ""}`}
                  aria-current={current ? "page" : undefined}
                  data-status={topic.status}
                  onClick={onClose}
                >
                  {body}
                </Link>
              ) : (
                <span className="lec-topic is-disabled" data-status={topic.status}>
                  {body}
                  <span className="lec-sr"> (лекц алга)</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="lec-hint">
        <img src={lightbulb} alt="" />
        <p>Ойлгосноо өөрийн үгээр тайлбарлаад үзээрэй.</p>
      </div>
    </aside>
  );
}

function LectureArticle({ lecture, topics, isTeacher, onSave, onDelete, onComplete }) {
  const topicIndex = topics.findIndex((t) => t.id === lecture.topicId);
  const topic = topics[topicIndex];
  const next = topicIndex === -1 ? undefined : topics[topicIndex + 1];
  const isDone = topic?.status === "DONE";
  const doneCount = topics.filter((t) => t.status === "DONE").length;
  const demo = DEMOS[lecture.demoType];
  const kc = lecture.knowledgeCheck ?? [];

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");
  const [stepsOpen, setStepsOpen] = useState(false);
  const [phase, setPhase] = useState(3); // 0 = юу ч render хийгээгүй … 3 = дэлгэц бүрэн
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(null);
  const [kcError, setKcError] = useState("");
  const closeConfirm = useCallback(() => setConfirming(false), []);

  useEffect(() => {
    if (phase >= 3) return;
    const timer = setTimeout(() => setPhase((p) => p + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const toggleSteps = () => {
    if (stepsOpen) return setStepsOpen(false);
    setStepsOpen(true);
    setPhase(prefersReducedMotion() ? 3 : 0);
  };

  const choose = (qi, option) => {
    setAnswers((a) => ({ ...a, [qi]: option }));
    setChecked(null);
    setKcError("");
  };

  const submit = async () => {
    if (kc.some((_, qi) => !answers[qi])) {
      setKcError("Бүх асуултад хариулна уу.");
      return;
    }
    const correct = kc.filter((q, qi) => answers[qi] === q.correctAnswer).length;
    setChecked({ correct, total: kc.length });
    if (correct === kc.length && !isDone) await onComplete(topic.id, 100);
  };

  if (editing) {
    return (
      <article className="lec-article">
        <LectureEditForm
          lecture={lecture}
          onCancel={() => setEditing(false)}
          onSave={async (changes) => {
            await onSave(changes);
            setEditing(false);
            setNotice("Лекц хадгалагдлаа.");
          }}
        />
      </article>
    );
  }

  return (
    <article className="lec-article" aria-labelledby="lec-title">
      <header className="lec-header">
        <div className="lec-heading">
          <p className="lec-eyebrow">
            {topic && `${topic.order}-Р СЭДЭВ · `}{readMinutes(lecture)} МИНУТ
          </p>
          <h1 id="lec-title">{lecture.title}</h1>
        </div>
        <div className="lec-header-side">
          {isTeacher ? (
            <>
              <button type="button" className="lec-btn" data-testid="lecture-edit-btn" onClick={() => { setNotice(""); setEditing(true); }}>
                Засах
              </button>
              <button type="button" className="lec-btn lec-btn-danger" data-testid="lecture-delete-btn" onClick={() => setConfirming(true)}>
                Устгах
              </button>
            </>
          ) : isDone ? (
            <span className="lec-status is-done"><img src={circleCheck} alt="" />Дууссан</span>
          ) : (
            <span className="lec-status"><img src={bookOpenSmall} alt="" />Уншиж байна</span>
          )}
        </div>
      </header>

      {notice && <p className="lec-notice" role="status">{notice}</p>}
      {lecture.summary && <p className="lec-summary">{lecture.summary}</p>}
      <div className="lec-content">{lecture.content}</div>

      {(lecture.codeSample || demo) && (
        <div className={`lec-code-demo${lecture.codeSample && demo ? "" : " is-single"}`}>
          {lecture.codeSample && <CodeBlock lecture={lecture} />}
          {demo && <DemoPanel demo={demo} phase={phase} />}
        </div>
      )}

      {demo && (
        <>
          <div className="lec-render-bar">
            <button
              type="button"
              className="lec-reveal"
              data-testid="lecture-render"
              aria-expanded={stepsOpen}
              aria-controls="lec-steps"
              onClick={toggleSteps}
            >
              <img src={play} alt="" />
              Дүрслэх алхмуудыг харах
              <img src={chevronUp} alt="" className="lec-chevron" />
            </button>
            <p className="lec-render-state">{stepsOpen ? "Алхмууд дэлгэгдсэн" : "Алхмууд хураагдсан"}</p>
          </div>
          {stepsOpen && (
            <ol id="lec-steps" className="lec-steps">
              {demo.steps.map(([title, text], i) => (
                <li
                  key={title}
                  className={`lec-step${phase > i ? "" : " is-pending"}`}
                  aria-current={phase === i + 1 ? "step" : undefined}
                >
                  <span className="lec-step-num">{i + 1}</span>
                  <div>
                    <p className="lec-step-title">{title}</p>
                    <p className="lec-step-text">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {kc.length > 0 && (
        <section className="lec-kc" aria-labelledby="lec-kc-title">
          <div className="lec-kc-head">
            <h2 id="lec-kc-title">Мэдлэг шалгах</h2>
            <span className="lec-kc-count">{kc.length} асуулт</span>
          </div>
          {kc.map((q, qi) => (
            <fieldset key={q.question} className="lec-kc-question" data-testid={`kc-question-${qi}`}>
              <legend>{q.question}</legend>
              <div className="lec-answers">
                {q.options.map((option, oi) => {
                  const selected = answers[qi] === option;
                  const correct = option === q.correctAnswer;
                  const state = isTeacher
                    ? correct ? "correct" : "idle"
                    : checked && selected ? (correct ? "correct" : "wrong") : selected ? "selected" : "idle";
                  return (
                    <label key={option} className={`lec-answer is-${state}`}>
                      <input
                        type="radio"
                        name={`kc-${qi}`}
                        value={option}
                        checked={selected}
                        disabled={isTeacher}
                        onChange={() => choose(qi, option)}
                      />
                      <span className="lec-key">{LETTERS[oi]}</span>
                      <span className="lec-answer-text">{option}</span>
                      {ANSWER_ICONS[state] && <img src={ANSWER_ICONS[state]} alt="" />}
                      {state === "correct" && <span className="lec-sr"> — зөв хариулт</span>}
                      {state === "wrong" && <span className="lec-sr"> — буруу хариулт</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {kcError && (
            <p className="lec-kc-feedback is-wrong" role="alert"><img src={xIcon} alt="" />{kcError}</p>
          )}
          {checked && (
            checked.correct === checked.total ? (
              <p className="lec-kc-feedback is-correct" role="status">
                <img src={checkGreen} alt="" />
                Бүх хариулт зөв! Сэдэв дууссан.
              </p>
            ) : (
              <p className="lec-kc-feedback is-wrong" role="status">
                <img src={xIcon} alt="" />
                {checked.correct} / {checked.total} зөв. Буруу хариултаа засаад дахин шалгана уу.
              </p>
            )
          )}
        </section>
      )}

      {topic && !isTeacher && (
        <div className="lec-complete">
          <div className="lec-complete-text">
            <p className="lec-next">
              {next ? (
                <>
                  Дараагийн сэдэв:{" "}
                  {next.lectureId ? <Link to={`/explore/lecture/${next.lectureId}`}>{next.title}</Link> : next.title}
                </>
              ) : (
                "Энэ бол хичээлийн сүүлийн сэдэв."
              )}
            </p>
            <p className="lec-complete-hint">
              {isDone
                ? `Хичээлийн ахиц ${doneCount} / ${topics.length}.`
                : `Дуусгаснаар хичээлийн ахиц ${doneCount + 1} / ${topics.length} болно.`}
            </p>
          </div>
          {!(isDone && kc.length === 0) && (
            <button type="button" className="lec-primary" data-testid="kc-submit" onClick={submit}>
              {isDone ? "Дахин шалгах" : "Сэдвийг дуусгах"}
              <img src={checkWhite} alt="" />
            </button>
          )}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Лекцийг устгах уу?"
          name={lecture.title}
          message="Лекц бүрмөсөн устна. Энэ үйлдлийг буцаах боломжгүй."
          onCancel={closeConfirm}
          onConfirm={onDelete}
        />
      )}
    </article>
  );
}

function CodeBlock({ lecture }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => navigator.clipboard?.writeText(lecture.codeSample).then(() => setCopied(true), () => {});

  return (
    <figure className="lec-code">
      <figcaption className="lec-code-head">
        <span className="lec-filename">{codeFileName(lecture)}</span>
        {copied && <span className="lec-copied" role="status">Хуулсан</span>}
        <button type="button" className="lec-copy" onClick={copy} aria-label="Кодыг хуулах">
          <img src={copyIcon} alt="" />
        </button>
      </figcaption>
      <pre tabIndex={0}>
        <code>{highlight(lecture.codeSample)}</code>
      </pre>
    </figure>
  );
}

function DemoPanel({ demo, phase }) {
  const pending = (reached) => (reached ? "" : " is-pending");

  return (
    <div className="lec-demo">
      <div className="lec-tree">
        <p className="lec-tree-label">{demo.label}</p>
        <span className={`lec-node lec-node-root${pending(phase >= 1)}`}>{demo.root}</span>
        <img src={branches} alt="" className={`lec-branches${pending(phase >= 2)}`} />
        <div className="lec-node-children">
          {demo.children.map((child) => (
            <span key={child} className={`lec-node${pending(phase >= 2)}`}>{child}</span>
          ))}
        </div>
      </div>
      <div className="lec-browser">
        <div className="lec-browser-bar">
          <span />
          <span />
          <span />
          <p>Дэлгэцэд харагдах нь</p>
        </div>
        <div className={`lec-browser-body${pending(phase >= 3)}`}>
          <p className="lec-preview-title">{demo.preview[0]}</p>
          <p className="lec-preview-text">{demo.preview[1]}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ name, label, error, multiline, ...props }) {
  const Control = multiline ? "textarea" : "input";
  return (
    <div className="lec-field">
      <label htmlFor={`lec-${name}-input`}>{label}</label>
      <Control
        id={`lec-${name}-input`}
        name={name}
        data-testid={`lecture-${name}-input`}
        className={error ? "is-error" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `lec-${name}-error` : undefined}
        {...props}
      />
      {error && <p id={`lec-${name}-error`} className="lec-field-error">{error}</p>}
    </div>
  );
}

function LectureEditForm({ lecture, onSave, onCancel }) {
  const [values, setValues] = useState({
    title: lecture.title,
    summary: lecture.summary ?? "",
    content: lecture.content,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  const errorCount = Object.keys(errors).length;

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current.elements[firstInvalid].focus();
      return;
    }
    setSaving(true);
    await onSave({ title: values.title.trim(), summary: values.summary.trim(), content: values.content.trim() });
  };

  return (
    <form ref={formRef} className="lec-form" data-testid="lecture-edit-form" onSubmit={submit} noValidate>
      <div className="lec-form-head">
        <h2>Лекц засах</h2>
        {errorCount > 0 && <span className="lec-badge is-error">{errorCount} алдаа байна</span>}
      </div>
      <Field name="title" label="Лекцийн гарчиг *" error={errors.title} value={values.title} onChange={set("title")} />
      <Field name="summary" label="Хураангуй" multiline rows={3} error={errors.summary} value={values.summary} onChange={set("summary")} />
      <Field name="content" label="Агуулга *" multiline rows={9} error={errors.content} value={values.content} onChange={set("content")} />
      <div className="lec-form-actions">
        <button type="button" className="lec-btn" onClick={onCancel}>Буцах</button>
        <button type="submit" className="lec-primary" data-testid="lecture-save" disabled={saving}>Хадгалах</button>
      </div>
    </form>
  );
}
