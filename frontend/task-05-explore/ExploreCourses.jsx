import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { exploreApi } from "../services/api";
import "./ExploreCourses.css";

const STATUS_LABEL = { done: "Дууссан", current: "Үргэлжилж байна", todo: "Дараагийн" };
const CATEGORY_LABEL = { WEB: "Веб", OS: "Үйлдлийн систем", DATABASE: "Өгөгдлийн сан" };
const CATEGORY_ICON = { WEB: "🌐", OS: "🖥️", DATABASE: "🗄️" };

// Сэдэв бүрийн төлөв: дууссан → done, эхний дуусаагүй → current, үлдсэн → todo
function topicsWithStatus(topics, lectures, done) {
  let currentFound = false;
  return topics.map((t) => {
    let status = "done";
    if (!done.has(t.id)) {
      status = currentFound ? "todo" : "current";
      currentFound = true;
    }
    return { ...t, status, lecture: lectures.find((l) => l.topicId === t.id) || null };
  });
}

export default function ExploreCourses({ user }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ key: null, list: [], error: false });
  const [topics, setTopics] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [doneIds, setDoneIds] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);

  // Хайлтын үгийг 300мс хүлээж нэг мөр болгоно
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Ангилал, сэдэв, лекц, оюутны ахицыг нэг удаа татна
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [all, topicList, lectureList, progress] = await Promise.all([
          exploreApi.searchCourses(),
          exploreApi.getTopics(),
          exploreApi.getLectures(),
          user?.id ? exploreApi.getTopicProgress(user.id) : [],
        ]);
        if (cancelled) return;
        setCategories([...new Set(all.map((c) => c.category))]);
        setTopics(topicList);
        setLectures(lectureList);
        setDoneIds(new Set(progress.filter((p) => p.status === "DONE").map((p) => p.topicId)));
      } catch {
        if (!cancelled) setResult((r) => ({ ...r, error: true }));
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Хайлт, ангиллаар хичээлийн жагсаалтыг шүүнэ
  const key = `${search}|${category}`;
  useEffect(() => {
    let cancelled = false;
    exploreApi
      .searchCourses({ search, category })
      .then((list) => {
        if (cancelled) return;
        setResult({ key, list, error: false });
        setSelectedId((cur) => (list.some((c) => c.id === cur) ? cur : list[0]?.id ?? null));
      })
      .catch(() => { if (!cancelled) setResult({ key, list: [], error: true }); });
    return () => { cancelled = true; };
  }, [search, category, key]);

  const courses = result.list;
  const status = result.error ? "error" : result.key !== key ? "loading" : courses.length ? "ready" : "empty";

  const progressOf = (courseId) => {
    const own = topics.filter((t) => t.courseId === courseId);
    const done = own.filter((t) => doneIds.has(t.id)).length;
    return { done, total: own.length, percent: own.length ? Math.round((done / own.length) * 100) : 0 };
  };

  const selected = courses.find((c) => c.id === selectedId);
  const selectedTopics = useMemo(
    () => topicsWithStatus(topics.filter((t) => t.courseId === selectedId), lectures, doneIds),
    [topics, lectures, doneIds, selectedId],
  );
  const startTopic = (courseId) =>
    topicsWithStatus(topics.filter((t) => t.courseId === courseId), lectures, doneIds)
      .find((t) => t.status === "current" && t.lecture);

  const reset = () => { setQuery(""); setSearch(""); setCategory(""); };

  const totalTopics = courses.reduce((n, c) => n + progressOf(c.id).total, 0);
  const totalDone = courses.reduce((n, c) => n + progressOf(c.id).done, 0);
  const selectedProgress = selected ? progressOf(selected.id) : null;

  return (
    <div className="explore-page" data-testid="page-explore">
      <Navbar user={user} />
      <main className="explore-main">
        <section className="explore-hero">
          <div className="explore-hero-text">
            <span className="explore-eyebrow">Судлах</span>
            <h1>Хичээлийн сан</h1>
            <p>Хичээлээ сонгоод, суралцах замаа үргэлжлүүлээрэй.</p>
          </div>
          <ul className="explore-stats" aria-label="Нийт мэдээлэл">
            <li><strong>{courses.length}</strong><span>хичээл</span></li>
            <li><strong>{totalTopics}</strong><span>сэдэв</span></li>
            <li><strong>{totalDone}</strong><span>дууссан</span></li>
          </ul>
          <label className="explore-searchbox">
            <span aria-hidden="true">🔍</span>
            <input
              type="search"
              aria-label="Хичээл хайх"
              placeholder="Хичээл хайх..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </section>

        <div className="explore-chips" role="group" aria-label="Ангилал">
          {["", ...categories].map((c) => (
            <button
              key={c || "all"}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              <span aria-hidden="true">{c ? CATEGORY_ICON[c] || "📚" : "✨"}</span>
              {c ? CATEGORY_LABEL[c] || c : "Бүгд"}
            </button>
          ))}
        </div>

        {status === "loading" && (
          <>
            <p role="status" className="explore-note">Ачаалж байна...</p>
            {courses.length === 0 && (
              <div className="explore-skeletons" aria-hidden="true">
                <span /><span /><span />
              </div>
            )}
          </>
        )}
        {status === "error" && (
          <p role="alert" className="explore-note explore-error">
            Хичээлийн санг ачаалж чадсангүй. Сүлжээний холболтоо шалгаад дахин оролдоно уу.
          </p>
        )}
        {status === "empty" && (
          <div className="explore-empty">
            <span className="explore-empty-icon" aria-hidden="true">🔎</span>
            <p>Хайлтад тохирох хичээл олдсонгүй.</p>
            <button type="button" className="explore-btn" onClick={reset}>Шүүлтүүр арилгах</button>
          </div>
        )}

        {courses.length > 0 && (
          <>
            <ul className="explore-courses" aria-label="Хичээлүүд">
              {courses.map((c) => {
                const p = progressOf(c.id);
                const start = startTopic(c.id);
                return (
                  <li key={c.id}>
                    <div
                      className={`explore-course${c.id === selectedId ? " selected" : ""}${p.percent === 100 ? " complete" : ""}`}
                      data-category={c.category}
                    >
                      <button
                        type="button"
                        className="explore-course-main"
                        aria-pressed={c.id === selectedId}
                        onClick={() => setSelectedId(c.id)}
                      >
                        <span className="explore-course-top">
                          <span className="explore-icon" aria-hidden="true">{CATEGORY_ICON[c.category] || "📚"}</span>
                          <span className="explore-tag" aria-hidden="true">{c.category}</span>
                        </span>
                        <span className="explore-course-title">{c.title}</span>
                        <span className="explore-course-meta">
                          {p.done} / {p.total} сэдэв дууссан · {c.lectureCount} лекц
                        </span>
                        <span className="explore-bar" aria-hidden="true">
                          <span style={{ width: `${p.percent}%` }} />
                        </span>
                      </button>
                      <div className="explore-course-foot">
                        <span className="explore-percent">{p.percent}%</span>
                        {start ? (
                          <Link
                            className="explore-pill"
                            to={`/explore/lecture/${start.lecture.id}`}
                            aria-label={`${p.done > 0 ? "Үргэлжлүүлэх" : "Эхлэх"}: ${c.title}`}
                          >
                            {p.done > 0 ? "Үргэлжлүүлэх" : "Эхлэх"} →
                          </Link>
                        ) : (
                          <span className="explore-pill muted">{p.percent === 100 ? "Дууссан" : "Удахгүй"}</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {selected && (
              <section className="explore-detail" aria-label={`${selected.title} — сэдвүүд`} data-category={selected.category}>
                <header className="explore-detail-head">
                  <span className="explore-icon large" aria-hidden="true">{CATEGORY_ICON[selected.category] || "📚"}</span>
                  <div>
                    <h2>{selected.title}</h2>
                    <p className="explore-sub">{selected.description}</p>
                  </div>
                  <span className="explore-ring" aria-hidden="true" style={{ "--pct": selectedProgress.percent }}>
                    <b>{selectedProgress.done}/{selectedProgress.total}</b>
                  </span>
                </header>
                <ul className="explore-timeline">
                  {selectedTopics.map((t) => (
                    <li key={t.id} className={`explore-topic ${t.status}`}>
                      <span className="explore-dot" aria-hidden="true">
                        {t.status === "done" ? "✓" : t.status === "current" ? "▶" : t.order}
                      </span>
                      <span className="explore-topic-body">
                        <span className="explore-topic-name">{t.title}</span>
                        <span className="explore-topic-meta">{STATUS_LABEL[t.status]}</span>
                      </span>
                      {t.lecture ? (
                        <Link className="explore-btn" to={`/explore/lecture/${t.lecture.id}`}>
                          Лекц үзэх
                        </Link>
                      ) : (
                        <span className="explore-topic-meta">Лекц удахгүй</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
