import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { Post } from "../../data/posts";

interface PostForm {
  title: string;
  date: string;
  content: string;
  comment: string;
  tags: string;
}

const emptyForm: PostForm = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  content: "",
  comment: "",
  tags: "",
};

function postToForm(post: Post): PostForm {
  return {
    title: post.title,
    date: post.date,
    content: post.content,
    comment: post.comment ?? "",
    tags: post.tags?.join(", ") ?? "",
  };
}

function formToPost(form: PostForm, id?: number): Omit<Post, "id"> & { id?: number } {
  const tags = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    ...(id !== undefined && { id }),
    title: form.title,
    date: form.date,
    content: form.content,
    comment: form.comment || undefined,
    tags: tags.length > 0 ? tags : undefined,
  };
}

export default function PostsEditor() {
  const { posts, addPost, updatePost, deletePost } = useData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyForm);

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setForm(postToForm(post));
    setShowNew(false);
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    if (editingId !== null) {
      updatePost(formToPost(form, editingId) as Post);
      setEditingId(null);
    } else {
      addPost(formToPost(form));
      setShowNew(false);
    }
    setForm(emptyForm);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
  };

  const handleDelete = (id: number) => {
    deletePost(id);
    if (editingId === id) handleCancel();
  };

  const updateField = (field: keyof PostForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const renderForm = () => (
    <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">
        {editingId !== null ? "Редактирование поста" : "Новый пост"}
      </h3>
      <div className="admin__field">
        <label className="admin__label">Заголовок *</label>
        <input
          className="admin__input"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Название поста"
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Дата</label>
        <input
          className="admin__input"
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Содержание *</label>
        <textarea
          className="admin__textarea"
          value={form.content}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder="Текст поста..."
          rows={4}
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Комментарий автора</label>
        <textarea
          className="admin__textarea"
          value={form.comment}
          onChange={(e) => updateField("comment", e.target.value)}
          placeholder="Ваш комментарий (необязательно)"
          rows={2}
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Теги (через запятую)</label>
        <input
          className="admin__input"
          value={form.tags}
          onChange={(e) => updateField("tags", e.target.value)}
          placeholder="релиз, FinAI"
        />
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
          + Добавить пост
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        {posts.length === 0 && (
          <p className="admin__empty">Нет постов. Добавьте первый!</p>
        )}
        {posts.map((post) =>
          editingId === post.id ? null : (
            <div key={post.id} className="admin__card">
              <div className="admin__card-header">
                <h3 className="admin__card-title">{post.title}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="admin__btn admin__btn--secondary admin__btn--small"
                    onClick={() => handleEdit(post)}
                  >
                    Изменить
                  </button>
                  <button
                    className="admin__btn admin__btn--danger admin__btn--small"
                    onClick={() => handleDelete(post.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                {post.date}
                {post.tags && ` · ${post.tags.join(", ")}`}
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                {post.content.length > 150
                  ? post.content.slice(0, 150) + "..."
                  : post.content}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
