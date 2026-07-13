import { useState } from "react";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/auth-context";

export default function UsersEditor() {
  const { users, currentUser, addUser, changeUserPassword, deleteUser } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => { setError(""); setSuccess(""); };
  const closePasswordForm = () => {
    setEditingId(null); setCurrentPassword(""); setNewPassword(""); setNewPasswordConfirm(""); resetMessages();
  };

  const handleAdd = async () => {
    resetMessages();
    if (!username.trim()) return setError("Введите логин");
    if (password.length < 12) return setError("Пароль должен быть минимум 12 символов");
    if (password !== confirmPassword) return setError("Пароли не совпадают");
    setLoading(true);
    const ok = await addUser(username.trim(), password);
    setLoading(false);
    if (!ok) return setError("Пользователь с таким логином уже существует");
    setUsername(""); setPassword(""); setConfirmPassword(""); setShowNew(false);
  };

  const handlePasswordChange = async () => {
    resetMessages();
    if (!currentPassword) return setError("Введите свой текущий пароль");
    if (newPassword.length < 12) return setError("Новый пароль должен быть минимум 12 символов");
    if (newPassword !== newPasswordConfirm) return setError("Новые пароли не совпадают");
    setLoading(true);
    try {
      await changeUserPassword(editingId!, currentPassword, newPassword, newPasswordConfirm);
      setCurrentPassword(""); setNewPassword(""); setNewPasswordConfirm("");
      setSuccess("Пароль изменён");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось изменить пароль");
    } finally { setLoading(false); }
  };

  return <div>
    {showNew ? <div className="admin__card" style={{ borderColor: "var(--accent)" }}>
      <h3 className="admin__card-title">Новый пользователь</h3>
      <div className="admin__field"><label className="admin__label">Логин *</label><input className="admin__input" value={username} onChange={e=>setUsername(e.target.value)} /></div>
      <div className="admin__field"><label className="admin__label">Пароль *</label><input className="admin__input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Минимум 12 символов" /></div>
      <div className="admin__field"><label className="admin__label">Подтвердите пароль *</label><input className="admin__input" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} /></div>
      {error && <p style={{color:"#ef4444"}}>{error}</p>}
      <div className="admin__actions"><button className="admin__btn admin__btn--secondary" onClick={()=>{setShowNew(false);resetMessages();}}>Отмена</button><button className="admin__btn admin__btn--primary" onClick={handleAdd} disabled={loading}>{loading?"...":"Добавить"}</button></div>
    </div> : <button className="admin__add-btn" onClick={()=>{setShowNew(true);closePasswordForm();}}>+ Добавить пользователя</button>}

    <div style={{marginTop:16}}>{users.map(user => <div key={user.id} className="admin__card">
      <div className="admin__card-header"><h3 className="admin__card-title">{user.username}{currentUser?.id===user.id && <span style={{fontSize:".75rem",color:"var(--accent)",marginLeft:8}}>(вы)</span>}</h3>
        <div className="admin__actions"><button className="admin__btn admin__btn--secondary admin__btn--small" onClick={()=>{editingId===user.id?closePasswordForm():(setEditingId(user.id),setShowNew(false),resetMessages());}}>Изменить пароль</button>{currentUser?.id!==user.id&&<button className="admin__btn admin__btn--danger admin__btn--small" onClick={()=>deleteUser(user.id)}>Удалить</button>}</div>
      </div>
      {editingId===user.id && <div style={{marginTop:16}}>
        <div className="admin__field"><label className="admin__label">Ваш текущий пароль *</label><input className="admin__input" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} /></div>
        <div className="admin__field"><label className="admin__label">Новый пароль для {user.username} *</label><input className="admin__input" type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Минимум 12 символов" /></div>
        <div className="admin__field"><label className="admin__label">Повторите новый пароль *</label><input className="admin__input" type="password" autoComplete="new-password" value={newPasswordConfirm} onChange={e=>setNewPasswordConfirm(e.target.value)} /></div>
        {error&&<p style={{color:"#ef4444"}}>{error}</p>}{success&&<p style={{color:"#22c55e"}}>{success}</p>}
        <div className="admin__actions"><button className="admin__btn admin__btn--secondary" onClick={closePasswordForm}>Отмена</button><button className="admin__btn admin__btn--primary" onClick={handlePasswordChange} disabled={loading}>{loading?"...":"Сменить пароль"}</button></div>
      </div>}
    </div>)}</div>
  </div>;
}
