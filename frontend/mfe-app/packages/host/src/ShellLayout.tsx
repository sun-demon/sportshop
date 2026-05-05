import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  logout,
  selectCartCount,
  selectCurrentUser,
  selectIsAuthenticated,
  setUser,
  setTokens,
  sportshopApi,
  useAppDispatch,
  useAppSelector,
  useGetMeQuery,
  useLogoutMutation,
} from '@sportshop/mfe-store';
import FloatingAppTag from './FloatingAppTag';

export default function ShellLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const cartCount = useAppSelector(selectCartCount);
  const [logoutRequest] = useLogoutMutation();

  const { data: meData } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (meData) dispatch(setUser(meData));
  }, [meData, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingAccessToken = params.get('accessToken');
    const incomingRefreshToken = params.get('refreshToken');
    if (incomingAccessToken) {
      localStorage.setItem('accessToken', incomingAccessToken);
      localStorage.removeItem('token');
      if (incomingRefreshToken) localStorage.setItem('refreshToken', incomingRefreshToken);
      else localStorage.removeItem('refreshToken');
      dispatch(setTokens({ accessToken: incomingAccessToken, refreshToken: incomingRefreshToken }));
      const nextUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [dispatch]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'accessToken' && e.key !== 'refreshToken' && e.key !== 'token') return;
      const accessToken = localStorage.getItem('accessToken') ?? localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!accessToken) {
        dispatch(logout());
        dispatch(sportshopApi.util.resetApiState());
        return;
      }
      dispatch(setTokens({ accessToken, refreshToken }));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch]);

  async function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await logoutRequest({ refreshToken }).unwrap();
      } catch {
        // Do not block local logout on network/API failure.
      }
    }
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
