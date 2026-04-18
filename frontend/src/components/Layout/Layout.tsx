import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🏪 Sportshop
          </Link>
          <nav className="flex gap-6">
            <Link to="/products" className="hover:text-blue-600">Товары</Link>
            {user && (
              <>
                <Link to="/cart" className="hover:text-blue-600 relative">
                  Корзина
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="hover:text-blue-600">Заказы</Link>
              </>
            )}
          </nav>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-white shadow-inner py-4 text-center text-gray-500 text-sm">
        © 2026 Sportshop. Все права защищены.
      </footer>
    </div>
  );
}
