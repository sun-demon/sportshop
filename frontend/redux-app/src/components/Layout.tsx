import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, selectCurrentUser, selectIsAuthenticated, setUser } from '../features/authSlice';
import { selectCartCount } from '../features/cartSlice';
import { sportshopApi, useGetMeQuery } from '../api/sportshopApi';
import FloatingAppTag from './FloatingAppTag';

export default function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // user берётся из двух мест: authSlice И RTK Query getMe (одни данные в двух частях приложения)
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
      <nav className="navbar">
        <Link to="/" className="navbar-brand">⚡ Sportshop</Link>
        <ul className="nav-links">
          <li><NavLink to="/">Главная</NavLink></li>
          <li><NavLink to="/products">Товары</NavLink></li>
          {isAuthenticated && (
            <>
              <li>
                <NavLink to="/cart">
                  Корзина{cartCount > 0 && <span className="badge">{cartCount}</span>}
                </NavLink>
              </li>
              <li><NavLink to="/orders">Заказы</NavLink></li>
              <li><NavLink to="/profile">Профиль</NavLink></li>
            </>
          )}
        </ul>
        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">
                {user?.name ?? user?.email ?? '…'}
                {user?.role === 'admin' && <span className="role-badge">admin</span>}
              </span>
              <button className="btn btn-outline" onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Войти</Link>
              <Link to="/register" className="btn btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </nav>
      <main className="main-content"><Outlet /></main>
      <FloatingAppTag label="redux" current="redux" />
      <footer className="footer"><p>© 2026 Sportshop — Redux RTK</p></footer>
    </div>
  );
}
