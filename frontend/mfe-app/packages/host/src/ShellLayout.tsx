import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  logout,
  selectCartCount,
  selectCurrentUser,
  selectIsAuthenticated,
  setUser,
  sportshopApi,
  useAppDispatch,
  useAppSelector,
  useGetMeQuery,
} from '@sportshop/mfe-store';
import FloatingAppTag from './FloatingAppTag';

export default function ShellLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const cartCount = useAppSelector(selectCartCount);

  const { data: meData } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (meData) dispatch(setUser(meData));
  }, [meData, dispatch]);

  function handleLogout() {
    dispatch(logout());
    dispatch(sportshopApi.util.resetApiState());
    navigate('/login');
  }

  return (
    <div className="app-wrapper">
      <header className="navbar" role="banner">
        <Link to="/" className="navbar-brand">
          ⚡ Sportshop
        </Link>
        <nav aria-label="Основная навигация">
          <ul className="nav-links">
            <li>
              <NavLink to="/">Главная</NavLink>
            </li>
            <li>
              <NavLink to="/products">Товары</NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <NavLink to="/cart">
                    Корзина
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
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
        </nav>
        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">
                {user?.name ?? user?.email ?? '…'}
                {user?.role === 'admin' && <span className="role-badge">admin</span>}
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
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <FloatingAppTag label="mfe" current="mfe" />
      <footer className="footer" role="contentinfo">
        <p>© 2026 Sportshop — Module Federation + Redux RTK</p>
      </footer>
    </div>
  );
}
