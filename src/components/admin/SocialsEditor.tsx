import { useState } from "react";
import { useData } from "../../context/data-context";
import type { Social } from "../../data/socials";
import { SOCIAL_PLATFORMS, SocialIcon } from "../../lib/socialIcons";

interface SocialForm {
  name: string;
  url: string;
  icon: string;
}

const emptyForm: SocialForm = { name: "", url: "", icon: "github" };

export default function SocialsEditor() {
  const { socials, addSocial, updateSocial, deleteSocial, reorderSocials } = useData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<SocialForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEdit = (social: Social) => {
    setEditingId(social.id);
    setForm({ name: social.name, url: social.url, icon: social.icon });
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.url) return;
    try {
      if (editingId !== null) {
        const existing = socials.find((s) => s.id === editingId);
        await updateSocial({ id: editingId, sort_order: existing?.sort_order ?? 0, ...form });
        setEditingId(null);
      } else {
        await addSocial({ ...form, sort_order: socials.length });
        setShowNew(false);
      }
      setForm(emptyForm);
      setSaveError(null);
    } catch {
      setSaveError("Не удалось сохранить. Проверьте подключение и войдите заново.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
    setSaveError(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSocial(id);
      if (editingId === id) handleCancel();
    } catch {
      setSaveError("Не удалось удалить ссылку.");
    }
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= socials.length) return;
    const ids = socials.map((s) => s.id);
    const tmp = ids[idx]; ids[idx] = ids[newIdx]; ids[newIdx] = tmp;
    try {
      await reorderSocials(ids);
    } catch {
      setSaveError("Не удалось изменить порядок.");
    }
  };

  const updateField = (field: keyof SocialForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const renderForm = () => (
    <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">
        {editingId !== null ? "Редактирование ссылки" : "Новая ссылка"}
      </h3>
      {saveError && <p className="admin__error">{saveError}</p>}
      <div className="admin__field">
        <label className="admin__label">Название *</label>
        <input
          className="admin__input"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="GitHub, Telegram, Email..."
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">URL *</label>
        <input
          className="admin__input"
          value={form.url}
          onChange={(e) => updateField("url", e.target.value)}
          placeholder="https://... или mailto:..."
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Иконка</label>
        <select
          className="admin__select"
          value={form.icon}
          onChange={(e) => updateField("icon", e.target.value)}
        >
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="admin__actions">
        <button className="admin__btn admin__btn--secondary" onClick={handleCancel}>
          Отмена
        </button>
        <button className="admin__btn admin__btn--primary" onClick={handleSave}>
          {editingId !== null ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {(showNew || editingId !== null) && renderForm()}

      {!showNew && editingId === null && (
        <button className="admin__add-btn" onClick={() => setShowNew(true)}>
          + Добавить соцсеть
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        {socials.length === 0 && (
          <p className="admin__empty">Нет ссылок. Добавьте первую!</p>
        )}
        {socials.map((social, idx) =>
          editingId === social.id ? null : (
            <div key={social.id} className="admin__card">
              <div className="admin__card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* drag handle / order buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button
                      className="admin__btn admin__btn--secondary admin__btn--small"
                      style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      title="Выше"
                    >
                      ↑
                    </button>
                    <button
                      className="admin__btn admin__btn--secondary admin__btn--small"
                      style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === socials.length - 1}
                      title="Ниже"
                    >
                      ↓
                    </button>
                  </div>
                  {/* icon preview */}
                  <span style={{ color: "var(--accent)", display: "flex" }}>
                    <SocialIcon icon={social.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="admin__card-title">{social.name}</h3>
                    <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginTop: 4 }}>
                      {social.url}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="admin__btn admin__btn--secondary admin__btn--small"
                    onClick={() => handleEdit(social)}
                  >
                    Изменить
                  </button>
                  <button
                    className="admin__btn admin__btn--danger admin__btn--small"
                    onClick={() => handleDelete(social.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
