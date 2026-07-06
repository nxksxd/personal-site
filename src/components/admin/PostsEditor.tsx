import { useState, useRef } from "react";
import { useData } from "../../context/data-context";
import MarkdownEditor from "./MarkdownEditor";
import type { Post } from "../../data/posts";

interface PostForm {
  title: string;
  date: string;
  content: string;
  image: string;
  comment: string;
  tags: string;
  status: "published" | "draft";
  slug: string;
  meta_description: string;
  og_image: string;
  category_id: string;
  project_id: string;
  post_type: string;
}

const POST_TYPES = ["Релиз", "Devlog", "Анонс", "Заметка"];

const emptyForm: PostForm = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  content: "",
  image: "",
  comment: "",
  tags: "",
  status: "published",
  slug: "",
  meta_description: "",
  og_image: "",
  category_id: "",
  project_id: "",
  post_type: "",
};

function postToForm(post: Post): PostForm {
  return {
    title: post.title,
    date: post.date,
    content: post.content,
    image: post.image ?? "",
    comment: post.comment ?? "",
    tags: post.tags?.join(", ") ?? "",
    status: post.status ?? "published",
    slug: post.slug ?? "",
    meta_description: post.meta_description ?? "",
    og_image: post.og_image ?? "",
    category_id: post.category_id?.toString() ?? "",
    project_id: post.project_id?.toString() ?? "",
    post_type: post.post_type ?? "",
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
    image: form.image || undefined,
    comment: form.comment || undefined,
    tags: tags.length > 0 ? tags : undefined,
    status: form.status,
    slug: form.slug || undefined,
    meta_description: form.meta_description || undefined,
    og_image: form.og_image || undefined,
    category_id: form.category_id ? parseInt(form.category_id) : undefined,
    project_id: form.project_id ? parseInt(form.project_id) : undefined,
    post_type: form.post_type || undefined,
  };
}

export default function PostsEditor() {
  const { allPosts, categories, projects, addPost, updatePost, deletePost, uploadFile } = useData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setForm(postToForm(post));
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    try {
      if (editingId !== null) {
        await updatePost(formToPost(form, editingId) as Post);
        setEditingId(null);
      } else {
        await addPost(formToPost(form));
        setShowNew(false);
      }
      setForm(emptyForm);
      setSaveError(null);
      setShowSeo(false);
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
    setShowSeo(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePost(id);
      if (editingId === id) handleCancel();
    } catch {
      setSaveError("Не удалось удалить запись.");
    }
  };

  const updateField = (field: keyof PostForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setUploading(true);
    try {
      const upload = await uploadFile(file);
      updateField("image", upload.url);
    } catch {
      // Fallback to base64
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateField("image", reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const statusLabel = (s: string | undefined) => (s === "draft" ? "Черновик" : "Опубликован");
  const statusColor = (s: string | undefined) => (s === "draft" ? "#f59e0b" : "#10b981");

  const renderForm = () => (
    <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">
        {editingId !== null ? "Редактирование поста" : "Новый пост"}
      </h3>
      {saveError && <p className="admin__error">{saveError}</p>}

      {/* Status & Category row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="admin__field" style={{ flex: 1, minWidth: 140 }}>
          <label className="admin__label">Статус</label>
          <select
            className="admin__input"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="published">Опубликован</option>
            <option value="draft">Черновик</option>
          </select>
        </div>
        <div className="admin__field" style={{ flex: 1, minWidth: 140 }}>
          <label className="admin__label">Категория</label>
          <select
            className="admin__input"
            value={form.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
          >
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project & Type row — связь новости с проектом (devlog) */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="admin__field" style={{ flex: 1, minWidth: 140 }}>
          <label className="admin__label">Проект</label>
          <select
            className="admin__input"
            value={form.project_id}
            onChange={(e) => updateField("project_id", e.target.value)}
          >
            <option value="">Без проекта (общая новость)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="admin__field" style={{ flex: 1, minWidth: 140 }}>
          <label className="admin__label">Тип записи</label>
          <select
            className="admin__input"
            value={form.post_type}
            onChange={(e) => updateField("post_type", e.target.value)}
          >
            <option value="">Не указан</option>
            {POST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

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
        <label className="admin__label">Обложка</label>
        <div className="admin__image-field">
          <input
            className="admin__input"
            value={form.image}
            onChange={(e) => updateField("image", e.target.value)}
            placeholder="URL картинки или загрузите файл"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            className="admin__btn admin__btn--secondary"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ whiteSpace: "nowrap" }}
            disabled={uploading}
          >
            {uploading ? "Загрузка..." : "Загрузить"}
          </button>
        </div>
        {form.image && (
          <div className="admin__image-preview">
            <img
              src={form.image}
              alt="Превью"
              style={{
                maxWidth: "100%",
                maxHeight: 160,
                borderRadius: 8,
                marginTop: 8,
                objectFit: "cover",
              }}
            />
            <button
              className="admin__btn admin__btn--danger admin__btn--small"
              style={{ marginTop: 4 }}
              onClick={() => updateField("image", "")}
            >
              Убрать
            </button>
          </div>
        )}
      </div>
      <div className="admin__field">
        <label className="admin__label">Содержание * (Markdown)</label>
        <MarkdownEditor
          value={form.content}
          onChange={(v) => updateField("content", v)}
          placeholder="Текст поста в формате Markdown..."
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

      {/* SEO fields toggle */}
      <button
        type="button"
        className="admin__btn admin__btn--secondary"
        style={{ marginBottom: 12, fontSize: "0.85rem" }}
        onClick={() => setShowSeo(!showSeo)}
      >
        {showSeo ? "▼ Скрыть SEO" : "▶ SEO-настройки"}
      </button>
      {showSeo && (
        <div style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}>
          <div className="admin__field">
            <label className="admin__label">Slug (URL)</label>
            <input
              className="admin__input"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="admin__field">
            <label className="admin__label">Meta Description</label>
            <textarea
              className="admin__textarea"
              value={form.meta_description}
              onChange={(e) => updateField("meta_description", e.target.value)}
              placeholder="Описание для поисковых систем (до 160 символов)"
              rows={2}
            />
          </div>
          <div className="admin__field">
            <label className="admin__label">OG Image URL</label>
            <input
              className="admin__input"
              value={form.og_image}
              onChange={(e) => updateField("og_image", e.target.value)}
              placeholder="URL картинки для соцсетей"
            />
          </div>
        </div>
      )}

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
        {allPosts.length === 0 && (
          <p className="admin__empty">Нет постов. Добавьте первый!</p>
        )}
        {allPosts.map((post) =>
          editingId === post.id ? null : (
            <div key={post.id} className="admin__card">
              <div className="admin__card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div>
                    <h3 className="admin__card-title" style={{ margin: 0 }}>
                      {post.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: statusColor(post.status || "published") + "22",
                          color: statusColor(post.status || "published"),
                        }}
                      >
                        {statusLabel(post.status || "published")}
                      </span>
                      {post.category && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: post.category.color + "22",
                            color: post.category.color,
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                {post.slug && ` · /${post.slug}`}
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
