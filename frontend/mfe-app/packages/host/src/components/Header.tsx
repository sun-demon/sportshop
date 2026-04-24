import { observer } from 'mobx-react-lite';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authStore } from '../stores/authStore';

const Header = observer(() => {
  const navigate = useNavigate();

  function handleLogout() {
    authStore.logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">⚽ Sportshop</Link>

      {authStore.isAuthenticated && (
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/catalog" className={({ isActive }) => isActive ? 'active' : ''}>
                Каталог
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
                Корзина
              </NavLink>
            </li>
            <li>
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>
                Заказы
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                Профиль
              </NavLink>
            </li>
            {authStore.isAdmin && (
              <li>
                <NavLink to="/products/new" className={({ isActive }) => isActive ? 'active' : ''}>
                  + Товар
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      )}

      <div className="navbar-user">
        {authStore.isAuthenticated ? (
          <>
            <span className="user-greeting">
              {authStore.user?.name ?? authStore.user?.email}
              {authStore.isAdmin && <span className="role-badge">admin</span>}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">Войти</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
});

export default Header;
