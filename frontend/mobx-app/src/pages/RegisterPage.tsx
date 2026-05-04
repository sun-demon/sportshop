import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '../stores/StoreContext';

const RegisterPage = observer(() => {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try { await auth.register({ name, email, password }); navigate('/'); }
    catch { /* ошибка в auth.error */ }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        {auth.error && <div className="alert alert-error">{auth.error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label htmlFor="name">Имя (необязательно)</label>
            <input id="name" type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          <div className="form-group"><label htmlFor="email">Email</label>
            <input id="email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
          <div className="form-group"><label htmlFor="password">Пароль</label>
            <input id="password" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" /></div>
          <button type="submit" className="btn btn-primary btn-full" disabled={auth.isLoading}>
            {auth.isLoading ? 'Создание аккаунта…' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-footer">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </div>
    </div>
  );
});

export default RegisterPage;
