import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import FloatingAppTag from '../FloatingAppTag';

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    void logout().finally(() => navigate('/login'));
  }

  return (
    <div className="app-wrapper">
      <nav className="navbar" aria-label="Основная навигация">
        <Link to="/" className="navbar-brand">
          ⚡ Sportshop
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/">Главная</NavLink>
          </li>
          <li>
            <NavLink to="/products">Товары</NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink to="/cart">
                  Корзина
                  {itemCount > 0 && <span className="badge">{itemCount}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink to="/orders">Заказы</NavLink>
              </li>
              <li>
                <NavLink to="/profile">Профиль</NavLink>
              </li>
            </>
          )}
        </ul>
        <div className="navbar-user">
          {user ? (
            <>
              <span className="user-greeting">
                {user.name ?? user.email}
                {user.role === 'admin' && <span className="role-badge">admin</span>}
              </span>
              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Войти
              </Link>
              <Link to="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <FloatingAppTag label="classic" current="classic" />
      <footer className="footer" role="contentinfo">
        <p>© 2026 Sportshop — React + Context API</p>
      </footer>
    </div>
  );
}
