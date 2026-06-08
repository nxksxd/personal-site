import { useState } from "react";
import { useData } from "../../context/data-context";
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
        await updateSocial({ id: editingId, ...form });
        setEditingId(null);
      } else {
        await addSocial(form);
        setShowNew(false);
      }
      setForm(emptyForm);
      setSaveError(null);
    } catch {
      setSaveError(
        "Не удалось сохранить. Проверьте подключение и войдите заново."
      );
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
        {socials.map((social) =>
          editingId === social.id ? null : (
            <div key={social.id} className="admin__card">
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
