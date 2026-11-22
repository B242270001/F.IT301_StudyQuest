// TASK-01: /profile/avatar — хэрэглэгч дүрээ тохируулж MongoDB-д хадгална.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Avatar from "../components/avatar/Avatar";
import { AVATAR_COLORS, AVATAR_PARTS, normalizeAvatar } from "../components/avatar/avatarCatalog";
import { authApi, avatarApi } from "../services/api";
import "./AvatarEditor.css";

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function AvatarEditor({ user, onUserUpdate, onLogout }) {
  const navigate = useNavigate();
  // status: "loading" | "ready" | "error"
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [config, setConfig] = useState(() => normalizeAvatar(user?.avatarConfig));
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    avatarApi
      .get()
      .then((data) => {
        if (cancelled) return;
        const current = normalizeAvatar(data?.avatarConfig);
        setConfig(current);
        setSaved(current);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 401) {
          onLogout?.();
          return;
        }
        setLoadError(err?.message || "Дүрийг ачаалж чадсангүй");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setLoadError("");
    setReloadKey((k) => k + 1);
  };

  const update = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSuccess("");
    setSaveError("");
  };

  const randomize = () => {
    const next = {};
    for (const { field, options } of AVATAR_PARTS) next[field] = pick(options).value;
    for (const { field, colors } of AVATAR_COLORS) next[field] = pick(colors);
    setConfig(next);
    setSuccess("");
  };

  const dirty = saved && JSON.stringify(saved) !== JSON.stringify(config);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSuccess("");
    try {
      const data = await avatarApi.save(config);
      const stored = normalizeAvatar(data?.avatarConfig);
      setSaved(stored);
      setConfig(stored);
      const nextUser = authApi.updateSession({ avatarConfig: stored });
      if (nextUser) onUserUpdate?.(nextUser);
      setSuccess("Дүр хадгалагдлаа ✅");
    } catch (err) {
      if (err?.status === 401) {
        onLogout?.();
        return;
      }
      setSaveError(err?.message || "Хадгалж чадсангүй");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-page" data-testid="page-avatar-editor">
      <Navbar user={user ? { ...user, avatarConfig: config } : user} />

      <main className="avatar-layout">
        <section className="avatar-preview-card">
          <div className="avatar-stage">
            <Avatar config={config} animated title="Миний дүр" data-testid="avatar-preview" />
          </div>
          <p className="avatar-preview-name">{user?.displayName || "Хэрэглэгч"}</p>
          <div className="avatar-preview-heads" aria-label="Жижиг хэмжээн дээр">
            <span className="avatar-chip-head"><Avatar config={config} variant="head" /></span>
            <span className="avatar-chip-head small"><Avatar config={config} variant="head" /></span>
          </div>
        </section>

        <section className="avatar-controls">
          <header className="avatar-controls-head">
            <div>
              <h1>Дүрээ тохируулах</h1>
              <p>Таны дүр өрөөнд, чансаанд болон цэсэнд харагдана.</p>
            </div>
            <button type="button" className="avatar-btn ghost" onClick={randomize} disabled={status !== "ready"}>
              🎲 Санамсаргүй
            </button>
          </header>

          {status === "loading" && (
            <p className="avatar-state" data-testid="avatar-loading">⏳ Дүрийг ачаалж байна...</p>
          )}

          {status === "error" && (
            <div className="avatar-state error" role="alert" data-testid="avatar-error">
              ⚠️ {loadError}
              <button type="button" className="avatar-btn" onClick={retry}>Дахин оролдох</button>
            </div>
          )}

          {status === "ready" && (
            <>
              {AVATAR_PARTS.map(({ field, label, options }) => (
                <fieldset key={field} className="avatar-group">
                  <legend>{label}</legend>
                  <div className="avatar-options">
                    {options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`avatar-option ${config[field] === o.value ? "selected" : ""}`}
                        aria-pressed={config[field] === o.value}
                        onClick={() => update(field, o.value)}
                        data-testid={`avatar-${field}-${o.value}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}

              {AVATAR_COLORS.map(({ field, label, colors }) => (
                <fieldset key={field} className="avatar-group">
                  <legend>{label}</legend>
                  <div className="avatar-swatches">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`avatar-swatch ${config[field] === color ? "selected" : ""}`}
                        style={{ background: color }}
                        aria-label={`${label} ${color}`}
                        aria-pressed={config[field] === color}
                        onClick={() => update(field, color)}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}

              <footer className="avatar-actions">
                {saveError && (
                  <span className="avatar-msg error" data-testid="avatar-save-error">⚠️ {saveError}</span>
                )}
                {success && (
                  <span className="avatar-msg success" data-testid="avatar-success">{success}</span>
                )}
                <button type="button" className="avatar-btn ghost" onClick={() => navigate("/dashboard")}>
                  Өрөө рүү буцах
                </button>
                <button
                  type="button"
                  className="avatar-btn primary"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  data-testid="avatar-save-btn"
                >
                  {saving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </footer>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
