import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { notesApi } from "../services/api";
import Avatar from "../components/avatar/Avatar";
import "./Dashboard.css";
import virtualRoomDay from "./assets/virtualRoomDay.jpg";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const roomImage = virtualRoomDay;

  const displayName = user?.displayName || "Хэрэглэгч";
  const firstName = displayName.split(" ").pop();
  const streak = user?.streakDays || 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Өглөөний мэнд"
      : hour < 18
      ? "Өдрийн мэнд"
      : "Оройн мэнд";

  const [welcomeSubtitle] = useState(() => {
    const subtitles = [
      "Мэдлэгийн шинэ өдөр эхэллээ. Өнөөдөр юуг нээх вэ?",
      "Өнөөдөр ямар шинэ зүйл сурах вэ? 💡",
      "Зорилгодоо хүрэхэд нэг алхам ойртлоо! 🎯",
      "Амжилт бол өдөр тутмын жижиг үйлдлүүдийн үр дүн ✨",
      "Өнөөдрийн хичээлээ амжилттай дуусцгаая! 🚀"
    ];
    return subtitles[Math.floor(Math.random() * subtitles.length)];
  });

  const getStreakMessage = (s) => {
    if (s === 0) {
      return "Өнөөдрөөс цувралаа эхлүүлээрэй! 🔥";
    } else if (s < 30) {
      return `${s} өдрийн цуврал • галыг асааж байна шүү. 🔥🔥🔥`;
    } else if (30 <= s) {
      return `${s} өдрийн цуврал • Түймэр түймэр!!! 🔥🔥🔥🔥🔥`;
    }
  };

  // --- Тэмдэглэл (Lab 5): mock/sessionStorage-оос бодит /api/notes (MongoDB) руу шилжүүлэв ---
  const [notes, setNotes] = useState([]);
  // notesStatus: "loading" | "ready" | "error"
  const [notesStatus, setNotesStatus] = useState("loading");
  const [notesError, setNotesError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleApiError = (err) => {
    if (err?.status === 401) {
      // Token хүчингүй (жишээ нь DB цэвэрлэгдсэн) бол дахин нэвтрүүлнэ.
      onLogout?.();
      return "Нэвтрэх хугацаа дууссан байна";
    }
    return err?.message || "Алдаа гарлаа";
  };

  // GET /api/notes — state-ийг зөвхөн хариу ирсний дараа (promise callback-д) шинэчилнэ.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    notesApi
      .list()
      .then((list) => {
        if (cancelled) return;
        setNotes(list || []);
        setNotesError("");
        setNotesStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setNotesError(handleApiError(err));
        setNotesStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const loadNotes = () => {
    setNotesStatus("loading");
    setNotesError("");
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    if (!successMsg) return undefined;
    const timer = setTimeout(() => setSuccessMsg(""), 2500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const content = noteContent.trim();
    if (!content) {
      setErrorMsg("Тэмдэглэлийн агуулга хоосон байж болохгүй!");
      return;
    }
    if (!activeNoteId && notes.length >= 3) {
      setErrorMsg("Дээд тал нь 3 тэмдэглэл нэмэх боломжтой!");
      return;
    }

    setSaving(true);
    try {
      if (activeNoteId) {
        const updated = await notesApi.update(activeNoteId, content);
        setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? updated : n)));
        setSuccessMsg("Тэмдэглэл шинэчлэгдлээ ✅");
      } else {
        const created = await notesApi.create(content);
        setNotes((prev) => [...prev, created]);
        setSuccessMsg("Тэмдэглэл хадгалагдлаа ✅");
      }
      setIsModalOpen(false);
      setNoteContent("");
      setActiveNoteId(null);
    } catch (err) {
      setErrorMsg(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    setNotesError("");
    try {
      await notesApi.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setSuccessMsg("Тэмдэглэл устгагдлаа 🗑️");
      if (activeNoteId === id) {
        setIsModalOpen(false);
        setActiveNoteId(null);
        setNoteContent("");
      }
    } catch (err) {
      setNotesError(handleApiError(err));
    }
  };

  const handleOpenNewNoteModal = () => {
    setErrorMsg("");
    if (notesStatus !== "ready") return;
    if (notes.length >= 3) {
      setNotesError("Тэмдэглэлийн дээд хязгаар (3) хүрсэн байна!");
      return;
    }
    setActiveNoteId(null);
    setNoteContent("");
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setErrorMsg("");
    setActiveNoteId(note.id);
    setNoteContent(note.content);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container" data-testid="page-dashboard">
      <div className="dashboard-wrapper">
        {/* Топ цэс */}
        <Navbar user={user} />

        {/* Өрөөний интерактив хэсэг */}
        <div className="room-preview-container">
          <div className="room-preview-box">
            {/* Топ Overlay */}
            <div className="room-top-overlay">
              <div className="welcome-card-overlay">
                <h1>{greeting}, {firstName}!</h1>
                {/* 1. Санамсаргүй гарч буй угталтын дэд текст */}
                <p>{welcomeSubtitle}</p>
              </div>

              <div className="streak-card-overlay">
                {/* 2. Streak-ийн утгаас хамаарсан динамик текст */}
                <span>{getStreakMessage(streak)}</span>
              </div>
            </div>

            {/* Зургийн яг харьцаатай scene: товчлуур, дүр зургаасаа хэзээ ч зөрөхгүй */}
            <div className="room-scene">
            {/* Үндсэн зураг (дүргүй өрөө) */}
            <img src={roomImage} className="room-bg-img" alt="Virtual Room" />

            {/* Computer Setup */}
            <button
              onClick={() => navigate("/practice")}
              className="room-interactive-btn computer"
              title="Дадлага хийх 💻"
              data-testid="room-computer"
            />

            {/* Bookshelf */}
            <button
              onClick={() => navigate("/explore")}
              className="room-interactive-btn bookshelf"
              title="Судлах 📚"
              data-testid="room-bookshelf"
            />

            {/* Самбар (Тэмдэглэл нэмэх интерактив товч) */}
            <button
              onClick={handleOpenNewNoteModal}
              className="room-interactive-btn note"
              title="Шинэ тэмдэглэл нэмэх 📝"
              data-testid="add-note-interactive-btn"
            />

            {/* Bed (Гарах) */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="room-interactive-btn bed"
              title="Унтах 😴"
              data-testid="room-bed"
            />

            {/* Хэрэглэгчийн өөрийн дүр (MongoDB-ийн avatarConfig) — дарвал тохируулах хуудас */}
            <button
              type="button"
              className="room-avatar"
              onClick={() => navigate("/profile/avatar")}
              title="Дүрээ өөрчлөх ✨"
              data-testid="room-avatar"
            >
              <Avatar config={user?.avatarConfig} animated title={`${displayName}-ийн дүр`} />
              <span className="room-avatar-hint">Дүрээ өөрчлөх</span>
            </button>
            </div>

            {/* --- 3. ДЭВТРИЙН ЗАГВАРТАЙ ЖИЖИГ ЦААСНУУД (RESPONSIVE) --- */}
            {notes.map((note, index) => {
              const positionClasses = ["sticky-note-left", "sticky-note-right-top", "sticky-note-right-bottom"];
              const positionClass = positionClasses[index] || "sticky-note-left";

              return (
                <div
                  key={note.id}
                  className={`sticky-notebook-card ${positionClass}`}
                  onClick={() => handleEditNote(note)}
                  title="Дараад засах эсвэл устгах"
                  data-testid={`sticky-note-${note.id}`}
                >
                  <button
                    className="sticky-note-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    title="Устгах"
                    data-testid={`delete-note-btn-${note.id}`}
                  >
                    ✕
                  </button>
                  <div className="sticky-notebook-content">
                    {note.content}
                  </div>
                </div>
              );
            })}

            {/* --- Тэмдэглэлийн API төлөв: loading / error / success --- */}
            <div className="notes-status-bar" aria-live="polite">
              {notesStatus === "loading" && (
                <span className="notes-status loading" data-testid="notes-loading">
                  ⏳ Тэмдэглэлүүдийг ачаалж байна...
                </span>
              )}
              {notesError && (
                <span className="notes-status error" data-testid="notes-error">
                  ⚠️ {notesError}
                  {notesStatus === "error" && (
                    <button type="button" onClick={loadNotes} data-testid="notes-retry-btn">
                      Дахин оролдох
                    </button>
                  )}
                </span>
              )}
              {successMsg && (
                <span className="notes-status success" data-testid="notes-success">
                  {successMsg}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- ТОМ ДЭВТЭР ХЭЛБЭРТЭЙ МОДАЛ ЦОНХ (CREATE / UPDATE) --- */}
        {isModalOpen && (
          <div className="note-modal-overlay">
            <div className="notebook-card" data-testid="note-modal">
              <div className="notebook-header">
                <h3>{activeNoteId ? "📖 Дэвтэр засах" : "📓 Шинэ тэмдэглэл бичих"}</h3>
                <span className="notebook-user-tag">👤 {displayName}</span>
              </div>
              
              {errorMsg && (
                <div className="note-error-msg" data-testid="note-error">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveNote}>
                <div className="notebook-paper-container">
                  <textarea
                    className="notebook-textarea"
                    data-testid="note-textarea"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Энд тэмдэглэлээ мөрөөр нь бичнэ үү..."
                    maxLength={150}
                    rows={6}
                  />
                </div>

                <div className="notebook-footer">
                  <span className="note-char-count">
                    {noteContent.length} / 150 тэмдэгт
                  </span>
                  <div className="note-modal-actions">
                    <button
                      type="button"
                      className="note-btn-cancel"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Болих
                    </button>
                    <button
                      type="submit"
                      className="note-btn-save"
                      data-testid="save-note-btn"
                      disabled={saving}
                    >
                      {saving ? "Хадгалж байна..." : "Хадгалах"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* --- СИСТЕМЭЭС ГАРАХ БАТАЛГААЖУУЛАХ ЦОНХ --- */}
        {showLogoutConfirm && (
          <ConfirmDialog
            title="Системээс гарах уу?"
            message="Та StudyQuest системээс гарах гэж байна."
            confirmLabel="Гарах"
            icon={null}
            onConfirm={() => {
              setShowLogoutConfirm(false);
              onLogout();
            }}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}