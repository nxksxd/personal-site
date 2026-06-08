import { useState } from "react";
import { useAuth } from "../../context/auth-context";

export default function UsersEditor() {
  const { users, currentUser, addUser, deleteUser } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setError("");

    if (!username.trim()) {
      setError("Введите логин");
      return;
    }
    if (password.length < 4) {
      setError("Пароль должен быть минимум 4 символа");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    const ok = await addUser(username.trim(), password);
    setLoading(false);

    if (!ok) {
      setError("Пользователь с таким логином уже существует");
      return;
    }

    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowNew(false);
  };

  const handleCancel = () => {
    setShowNew(false);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div>
      {showNew && (
        <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
          <h3 className="admin__card-title">Новый пользователь</h3>
          <div className="admin__field">
            <label className="admin__label">Логин *</label>
            <input
              className="admin__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
            />
          </div>
          <div className="admin__field">
            <label className="admin__label">Пароль *</label>
            <input
              className="admin__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 4 символа"
            />
          </div>
          <div className="admin__field">
            <label className="admin__label">Подтвердите пароль *</label>
            <input
              className="admin__input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
            />
          </div>
          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0 0 8px" }}>
              {error}
            </p>
          )}
          <div className="admin__actions">
            <button className="admin__btn admin__btn--secondary" onClick={handleCancel}>
              Отмена
            </button>
            <button
              className="admin__btn admin__btn--primary"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? "..." : "Добавить"}
            </button>
          </div>
        </div>
      )}

      {!showNew && (
        <button className="admin__add-btn" onClick={() => setShowNew(true)}>
          + Добавить пользователя
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        {users.length === 0 && (
          <p className="admin__empty">Нет пользователей.</p>
        )}
        {users.map((user) => (
          <div key={user.id} className="admin__card">
            <div className="admin__card-header">
              <h3 className="admin__card-title">
                {user.username}
                {currentUser?.id === user.id && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      marginLeft: 8,
                      fontWeight: 500,
                    }}
                  >
                    (вы)
                  </span>
                )}
              </h3>
              {currentUser?.id !== user.id && (
                <button
                  className="admin__btn admin__btn--danger admin__btn--small"
                  onClick={() => deleteUser(user.id)}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
