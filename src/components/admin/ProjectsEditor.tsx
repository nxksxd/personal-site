import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { Project } from "../../data/projects";

interface ProjectForm {
  title: string;
  description: string;
  tags: string;
  link: string;
  github: string;
}

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  tags: "",
  link: "",
  github: "",
};

function projectToForm(p: Project): ProjectForm {
  return {
    title: p.title,
    description: p.description,
    tags: p.tags.join(", "),
    link: p.link,
    github: p.github ?? "",
  };
}

function formToProject(
  form: ProjectForm,
  id?: number
): Omit<Project, "id"> & { id?: number } {
  const tags = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    ...(id !== undefined && { id }),
    title: form.title,
    description: form.description,
    tags,
    link: form.link || "#",
    github: form.github || undefined,
  };
}

export default function ProjectsEditor() {
  const { projects, addProject, updateProject, deleteProject } = useData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setForm(projectToForm(project));
    setShowNew(false);
  };

  const handleSave = () => {
    if (!form.title || !form.description) return;
    if (editingId !== null) {
      updateProject(formToProject(form, editingId) as Project);
      setEditingId(null);
    } else {
      addProject(formToProject(form));
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
    deleteProject(id);
    if (editingId === id) handleCancel();
  };

  const updateField = (field: keyof ProjectForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const renderForm = () => (
    <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">
        {editingId !== null ? "Редактирование проекта" : "Новый проект"}
      </h3>
      <div className="admin__field">
        <label className="admin__label">Название *</label>
        <input
          className="admin__input"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Название проекта"
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Описание *</label>
        <textarea
          className="admin__textarea"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Краткое описание проекта"
          rows={3}
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Теги (через запятую)</label>
        <input
          className="admin__input"
          value={form.tags}
          onChange={(e) => updateField("tags", e.target.value)}
          placeholder="React, TypeScript, Python"
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Ссылка на проект</label>
        <input
          className="admin__input"
          value={form.link}
          onChange={(e) => updateField("link", e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">GitHub</label>
        <input
          className="admin__input"
          value={form.github}
          onChange={(e) => updateField("github", e.target.value)}
          placeholder="https://github.com/..."
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
          + Добавить проект
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        {projects.length === 0 && (
          <p className="admin__empty">Нет проектов. Добавьте первый!</p>
        )}
        {projects.map((project) =>
          editingId === project.id ? null : (
            <div key={project.id} className="admin__card">
              <div className="admin__card-header">
                <h3 className="admin__card-title">{project.title}</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="admin__btn admin__btn--secondary admin__btn--small"
                    onClick={() => handleEdit(project)}
                  >
                    Изменить
                  </button>
                  <button
                    className="admin__btn admin__btn--danger admin__btn--small"
                    onClick={() => handleDelete(project.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {project.description.length > 120
                  ? project.description.slice(0, 120) + "..."
                  : project.description}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: 16,
                      background: "var(--tag-bg)",
                      color: "var(--accent)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
