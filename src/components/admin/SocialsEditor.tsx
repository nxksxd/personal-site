import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { Social } from "../../data/socials";

const ICON_OPTIONS = ["github", "telegram", "email"];

interface SocialForm {
  name: string;
  url: string;
  icon: string;
}

const emptyForm: SocialForm = { name: "", url: "", icon: "github" };

export default function SocialsEditor() {
  const { socials, addSocial, updateSocial, deleteSocial } = useData();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<SocialForm>(emptyForm);

  const handleEdit = (idx: number, social: Social) => {
    setEditingIdx(idx);
    setForm({ name: social.name, url: social.url, icon: social.icon });
    setShowNew(false);
  };

  const handleSave = () => {
    if (!form.name || !form.url) return;
    if (editingIdx !== null) {
      updateSocial(editingIdx, form);
      setEditingIdx(null);
    } else {
      addSocial(form);
      setShowNew(false);
    }
    setForm(emptyForm);
  };

  const handleCancel = () => {
    setEditingIdx(null);
    setShowNew(false);
    setForm(emptyForm);
  };

  const handleDelete = (idx: number) => {
    deleteSocial(idx);
    if (editingIdx === idx) handleCancel();
  };

  const updateField = (field: keyof SocialForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const renderForm = () => (
    <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">
        {editingIdx !== null ? "Редактирование ссылки" : "Новая ссылка"}
      </h3>
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
          {ICON_OPTIONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>
      <div className="admin__actions">
        <button className="admin__btn admin__btn--secondary" onClick={handleCancel}>
          Отмена
        </button>
        <button className="admin__btn admin__btn--primary" onClick={handleSave}>
          {editingIdx !== null ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {(showNew || editingIdx !== null) && renderForm()}

      {!showNew && editingIdx === null && (
        <button className="admin__add-btn" onClick={() => setShowNew(true)}>
          + Добавить соцсеть
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        {socials.length === 0 && (
          <p className="admin__empty">Нет ссылок. Добавьте первую!</p>
        )}
        {socials.map((social, idx) =>
          editingIdx === idx ? null : (
            <div key={`${social.name}-${idx}`} className="admin__card">
              <div className="admin__card-header">
                <div>
                  <h3 className="admin__card-title">{social.name}</h3>
                  <p
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: "0.85rem",
                      marginTop: 4,
                    }}
                  >
                    {social.url}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="admin__btn admin__btn--secondary admin__btn--small"
                    onClick={() => handleEdit(idx, social)}
                  >
                    Изменить
                  </button>
                  <button
                    className="admin__btn admin__btn--danger admin__btn--small"
                    onClick={() => handleDelete(idx)}
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
