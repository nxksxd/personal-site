import { useState } from "react";
import { useData } from "../../context/data-context";
import type { Category } from "../../data/posts";

interface CategoryForm {
  name: string;
  slug: string;
  color: string;
}

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  color: "#6366f1",
};

function catToForm(cat: Category): CategoryForm {
  return {
    name: cat.name,
    slug: cat.slug,
    color: cat.color,
  };
}

export default function CategoriesEditor() {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm(catToForm(cat));
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editingId !== null) {
        await updateCategory({ id: editingId, ...form });
        setEditingId(null);
      } else {
        await addCategory(form);
        setShowNew(false);
      }
      setForm(emptyForm);
      setSaveError(null);
    } catch {
      setSaveError("Не удалось сохранить категорию.");
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
      await deleteCategory(id);
      if (editingId === id) handleCancel();
    } catch {
      setSaveError("Не удалось удалить категорию.");
    }
  };

  const renderForm = () => (
    <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">
        {editingId !== null ? "Редактирование категории" : "Новая категория"}
      </h3>
      {saveError && <p className="admin__error">{saveError}</p>}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="admin__field" style={{ flex: 2, minWidth: 180 }}>
          <label className="admin__label">Название *</label>
          <input
            className="admin__input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Разработка"
          />
        </div>
        <div className="admin__field" style={{ flex: 1, minWidth: 120 }}>
          <label className="admin__label">Slug</label>
          <input
            className="admin__input"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto"
          />
        </div>
        <div className="admin__field" style={{ flex: 0, minWidth: 80 }}>
          <label className="admin__label">Цвет</label>
          <input
            type="color"
            className="admin__input"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            style={{ height: 40, padding: 2, cursor: "pointer" }}
          />
        </div>
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
          + Добавить категорию
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        {categories.length === 0 && (
          <p className="admin__empty">Нет категорий. Добавьте первую!</p>
        )}
        {categories.map((cat) =>
          editingId === cat.id ? null : (
            <div key={cat.id} className="admin__card">
              <div className="admin__card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: cat.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <h3 className="admin__card-title" style={{ margin: 0 }}>
                      {cat.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      /{cat.slug}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="admin__btn admin__btn--secondary admin__btn--small"
                    onClick={() => handleEdit(cat)}
                  >
                    Изменить
                  </button>
                  <button
                    className="admin__btn admin__btn--danger admin__btn--small"
                    onClick={() => handleDelete(cat.id)}
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
