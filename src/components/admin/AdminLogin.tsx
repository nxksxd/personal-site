import { useState } from "react";
import { useAuth } from "../../context/auth-context";
import "./AdminLogin.css";

export default function AdminLogin({ onBack }: { onBack: () => void }) {
  const { isFirstSetup, authLoading, login, setupFirstUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Введите логин");
      return;
    }

    if (isFirstSetup) {
      if (password.length < 4) {
        setError("Пароль должен быть минимум 4 символа");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
      setLoading(true);
      try {
        await setupFirstUser(username.trim(), password);
      } catch {
        setError("Не удалось создать аккаунт. Попробуйте ещё раз.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!password) {
        setError("Введите пароль");
        return;
      }
      setLoading(true);
      const ok = await login(username.trim(), password);
      setLoading(false);
      if (!ok) {
        setError("Неверный логин или пароль");
        setPassword("");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="login">
        <div className="login__card">
          <p className="login__subtitle">Загрузка…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login">
      <div className="login__card">
        <button className="login__back-btn" onClick={onBack}>
          &larr; На сайт
        </button>

        <div className="login__header">
          <div className="login__icon">🔒</div>
          <h1 className="login__title">
            {isFirstSetup ? "Создание аккаунта" : "Вход в админ-панель"}
          </h1>
          <p className="login__subtitle">
            {isFirstSetup
              ? "Создайте первый аккаунт администратора"
              : "Введите логин и пароль для доступа"}
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Логин</label>
            <input
              className="login__input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              autoFocus
            />
          </div>

          <div className="login__field">
            <label className="login__label">Пароль</label>
            <input
              className="login__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </div>

          {isFirstSetup && (
            <div className="login__field">
              <label className="login__label">Подтвердите пароль</label>
              <input
                className="login__input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
              />
            </div>
          )}

          {error && <p className="login__error">{error}</p>}

          <button className="login__submit" type="submit" disabled={loading}>
            {loading
              ? "..."
              : isFirstSetup
                ? "Создать аккаунт"
                : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
