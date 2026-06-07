import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import PostsEditor from "./PostsEditor";
import ProjectsEditor from "./ProjectsEditor";
import SocialsEditor from "./SocialsEditor";
import UsersEditor from "./UsersEditor";
import "./AdminPanel.css";

type Tab = "posts" | "projects" | "socials" | "users";

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("posts");
  const { resetAll } = useData();
  const { logout, currentUser } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="admin">
      <div className="admin__inner">
        <div className="admin__header">
          <div className="admin__header-left">
            <button className="admin__back-btn" onClick={onBack}>
              &larr; На сайт
            </button>
            <h1 className="admin__title">Админ-панель</h1>
          </div>
          <div className="admin__header-right">
            {currentUser && (
              <span className="admin__user-badge">{currentUser.username}</span>
            )}
            <button
              className="admin__reset-btn"
              onClick={() => setShowResetConfirm(true)}
            >
              Сбросить всё
            </button>
            <button
              className="admin__logout-btn"
              onClick={() => {
                logout();
                onBack();
              }}
            >
              Выйти
            </button>
          </div>
        </div>

        {showResetConfirm && (
          <div className="admin__reset-confirm">
            <p>Вернуть все данные к начальным? Это действие нельзя отменить.</p>
            <div className="admin__reset-actions">
              <button
                className="admin__btn admin__btn--danger"
                onClick={() => {
                  resetAll();
                  setShowResetConfirm(false);
                }}
              >
                Да, сбросить
              </button>
              <button
                className="admin__btn admin__btn--secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        <div className="admin__tabs">
          <button
            className={`admin__tab ${tab === "posts" ? "admin__tab--active" : ""}`}
            onClick={() => setTab("posts")}
          >
            Новости
          </button>
          <button
            className={`admin__tab ${tab === "projects" ? "admin__tab--active" : ""}`}
            onClick={() => setTab("projects")}
          >
            Проекты
          </button>
          <button
            className={`admin__tab ${tab === "socials" ? "admin__tab--active" : ""}`}
            onClick={() => setTab("socials")}
          >
            Соцсети
          </button>
          <button
            className={`admin__tab ${tab === "users" ? "admin__tab--active" : ""}`}
            onClick={() => setTab("users")}
          >
            Пользователи
          </button>
        </div>

        <div className="admin__content">
          {tab === "posts" && <PostsEditor />}
          {tab === "projects" && <ProjectsEditor />}
          {tab === "socials" && <SocialsEditor />}
          {tab === "users" && <UsersEditor />}
        </div>
      </div>
    </div>
  );
}
