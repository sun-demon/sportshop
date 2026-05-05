import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore, useCartStore, useOrderStore, useProductStore } from '../stores/StoreContext';
import FloatingAppTag from './FloatingAppTag';

const Layout = observer(() => {
  const auth = useAuthStore();
  const cart = useCartStore();
  const orders = useOrderStore();
  const products = useProductStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) auth.fetchMe();
  }, [auth.isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    auth.logout(); orders.clearOrders(); products.clearSelected(); cart.clear(); navigate('/login');
  }

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">⚡ Sportshop</Link>
        <ul className="nav-links">
          <li><NavLink to="/">Главная</NavLink></li>
          <li><NavLink to="/products">Товары</NavLink></li>
          {auth.isAuthenticated && (
            <>
              <li><NavLink to="/cart">Корзина{cart.count > 0 && <span className="badge">{cart.count}</span>}</NavLink></li>
              <li><NavLink to="/orders">Заказы</NavLink></li>
              <li><NavLink to="/profile">Профиль</NavLink></li>
            </>
          )}
        </ul>
        <div className="navbar-user">
          {auth.isAuthenticated ? (
            <>
              <span className="user-greeting">
                {auth.user?.name ?? auth.user?.email ?? '…'}
                {auth.isAdmin && <span className="role-badge">admin</span>}
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
      <FloatingAppTag label="mobx" current="mobx" />
      <footer className="footer"><p>© 2026 Sportshop — MobX</p></footer>
    </div>
  );
});

export default Layout;
