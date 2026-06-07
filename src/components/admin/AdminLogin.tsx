import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminLogin.css";

export default function AdminLogin({ onBack }: { onBack: () => void }) {
  const { isFirstSetup, login, setupPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      await setupPassword(password);
      setLoading(false);
    } else {
      if (!password) {
        setError("Введите пароль");
        return;
      }
      setLoading(true);
      const ok = await login(password);
      setLoading(false);
      if (!ok) {
        setError("Неверный пароль");
        setPassword("");
      }
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <button className="login__back-btn" onClick={onBack}>
          &larr; На сайт
        </button>

        <div className="login__header">
          <div className="login__icon">🔒</div>
          <h1 className="login__title">
            {isFirstSetup ? "Создание пароля" : "Вход в админ-панель"}
          </h1>
          <p className="login__subtitle">
            {isFirstSetup
              ? "Придумайте пароль для доступа к админ-панели"
              : "Введите пароль для доступа"}
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label">Пароль</label>
            <input
              className="login__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoFocus
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
                ? "Создать пароль"
                : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
