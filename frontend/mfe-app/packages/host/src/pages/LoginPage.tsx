import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authStore } from '../stores/authStore';

const LoginPage = observer(() => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authStore.login({ email, password });
      navigate('/catalog');
    } catch {
      // ошибка уже в authStore.error
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Вход в систему</h1>

        {authStore.error && (
          <div className="alert alert-error">{authStore.error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => { authStore.clearError(); setEmail(e.target.value); }}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => { authStore.clearError(); setPassword(e.target.value); }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={authStore.isLoading}
          >
            {authStore.isLoading ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <p className="auth-footer">
          Нет аккаунта?{' '}
          <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
});

export default LoginPage;
