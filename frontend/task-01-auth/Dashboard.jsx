import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmDialog from "../components/ConfirmDialog";
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

  const [notes, setNotes] = useState(() => {
    if (user?.notes && Array.isArray(user.notes) && user.notes.length > 0) {
      return user.notes;
    }
    const defaultNotesPool = [
      { id: "n1", content: "Ez 4 GPA 😎" },
      { id: "n2", content: "Хичээлээ хий2! 🫠" },
      { id: "n3", content: "Тууштай байдал бол амжилт! 💪" },
      { id: "n4", content: "Өдөр бүр 1% илүү байя 📈" },
      { id: "n5", content: "Фокус алдахгүй шүү! ☕" }
    ];
    const shuffled = [...defaultNotesPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  });

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isTeacher = user?.role === "TEACHER";

  const saveNotesToUser = (updatedNotes) => {
    setNotes(updatedNotes);
    const updatedUser = { ...user, notes: updatedNotes };
    sessionStorage.setItem('studyquest.currentUser', JSON.stringify(updatedUser));
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!noteContent.trim()) {
      setErrorMsg("Тэмдэглэлийн агуулга хоосон байж болохгүй!");
      return;
    }

    if (activeNoteId) {
      // Update
      const updated = notes.map((n) => (n.id === activeNoteId ? { ...n, content: noteContent.trim() } : n));
      saveNotesToUser(updated);
    } else {
      if (notes.length >= 3) {
        setErrorMsg("Дээд тал нь 3 тэмдэглэл нэмэх боломжтой!");
        return;
      }
      const newNote = {
        id: `n_${Date.now()}`,
        content: noteContent.trim()
      };
      saveNotesToUser([...notes, newNote]);
    }

    setIsModalOpen(false);
    setNoteContent("");
    setActiveNoteId(null);
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotesToUser(updated);
    if (activeNoteId === id) {
      setIsModalOpen(false);
      setActiveNoteId(null);
      setNoteContent("");
    }
  };

  const handleOpenNewNoteModal = () => {
    setErrorMsg("");
    if (notes.length >= 3) {
      alert("Тэмдэглэлийн дээд хязгаар (3) хүрсэн байна!");
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

            {/* Үндсэн зураг */}
            <img src={roomImage} className="room-bg-img" alt="Virtual Room" />

            {/* Student: Computer / Teacher: Board */}
            {isTeacher ? (
              <button
                onClick={() => navigate("/teacher")}
                className="room-interactive-btn board"
                title="Багшийн өрөө 📋"
                data-testid="room-board"
              />
            ) : (
              <button
                onClick={() => navigate("/practice")}
                className="room-interactive-btn computer"
                title="Дадлага хийх 💻"
                data-testid="room-computer"
              />
            )}

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
                    >
                      Хадгалах
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